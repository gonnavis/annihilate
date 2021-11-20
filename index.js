import * as CANNON from './lib/cannon-es_my.js'
window.CANNON = CANNON
import cannonDebugger from './lib/cannon-es-debugger.js'
// THREE.cannonDebugger = cannonDebugger

import { Ground } from './ground.js'
import { Level } from './level.js'
import { Box } from './box.js'
import { FloatingBox } from './floatingBox.js'
import { Maria } from './maria.js'
import { Paladin } from './paladin.js'
import { GreatSword } from './greatSword.js'
import { Sword } from './sword.js'
import { Shield } from './shield.js'
import { Enemy } from './enemy.js'
import { RoleControls } from './roleControls.js'

const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

// glsl function
window.vec2 = function (x, y) {
  return new THREE.Vector2(...arguments)
}
window.vec3 = function (x, y, z) {
  return new THREE.Vector3(...arguments)
}

// setting

window.container = null
window.stats = null
window.clock = null
window.gui = null
window.mixer = null
window.actions = null
window.activeAction = null
window.previousAction = null
window.camera = null
window.scene = null
window.renderer = null
window.model = null
window.face = null
window.updates = []
window.attackers = []

let xstate
let xstateService

init_xstate()
init_three()
init_cannon()
window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, {
  autoUpdate: false,
})
init()
requestAnimationFrame(animate)

function init_xstate() {
  xstate = createMachine(
    {
      id: 'index',
      initial: 'initial',
      states: {
        initial: {
          on: { maria: { target: 'maria' } },
          on: { paladin: { target: 'paladin' } },
        },
        maria: {
          entry: 'entryMaria',
          on: {
            paladin: { target: 'paladin' },
          },
        },
        paladin: {
          entry: 'entryPaladin',
          on: {
            maria: { target: 'maria' },
          },
        },
      },
    },
    {
      actions: {
        entryMaria: () => {
          roleControls.setRole(maria)
          domMaria.disabled = true
          domPaladin.disabled = false
        },
        entryPaladin: () => {
          roleControls.setRole(paladin)
          domPaladin.disabled = true
          domMaria.disabled = false
        },
      },
    }
  )

  xstateService = interpret(xstate)
  xstateService.start()
}

function init() {
  window.ground = new Ground() // todo: refactor

  window.level = new Level()
  level.load()

  window.box = new Box(20, 4, 80)
  box.mesh.position.set(-30, 1, 0)
  box.body.position.copy(box.mesh.position)

  window.floatingBox = new FloatingBox()
  floatingBox.box.body.position.y = 6
  floatingBox.box.body.position.z = -35
  floatingBox.timeBias = 0

  window.floatingBox2 = new FloatingBox()
  floatingBox2.box.body.position.y = 6 * 2
  floatingBox2.box.body.position.z = -40
  floatingBox2.timeBias = 2

  window.floatingBox3 = new FloatingBox()
  floatingBox3.box.body.position.y = 6 * 3
  floatingBox3.box.body.position.z = -35
  floatingBox3.timeBias = 4

  window.floatingBox4 = new FloatingBox()
  floatingBox4.box.body.position.y = 6 * 4
  floatingBox4.box.body.position.z = -40
  floatingBox4.timeBias = 6

  window.floatingBox5 = new FloatingBox()
  floatingBox5.box.body.position.y = 6 * 5
  floatingBox5.box.body.position.z = -35
  floatingBox5.timeBias = 8

  // window.maria = new Maria(0, 5, -15)
  window.maria = new Maria(5, 5, 0)
  maria.load(() => {
    maria.gltf.scene.rotation.set(0, -Math.PI / 2, 0)
  })
  window.greatSword = new GreatSword()
  greatSword.owner = maria

  window.paladin = new Paladin(0, 5, 0)
  // window.paladin = new Paladin(0, 5, 0)
  paladin.load(() => {
    paladin.gltf.scene.rotation.set(0, Math.PI / 2, 0)
  })
  window.sword = new Sword()
  sword.owner = paladin
  window.shield = new Shield()
  shield.owner = paladin

  // window.roleControls = new RoleControls(maria) ///todo: Use ECS?
  window.roleControls = new RoleControls(paladin)

  xstateService.send('paladin')

  domMaria.addEventListener('click', (e) => {
    xstateService.send('maria')
  })
  domPaladin.addEventListener('click', (e) => {
    xstateService.send('paladin')
  })

  ///todo: fix bug after ```roleControls.role = paladin```.

  // window.enemys = []
  // window.enemy = new Enemy(15, 5, -15)
  // enemys.push(enemy)
  // enemy.load()

  // window.enemy2 = new Enemy(15, 5, 15)
  // enemys.push(enemy2)
  // enemy2.load()
}

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100)
  camera.position.set(0, 30, 30)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()

  // lights

  var light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 20, 0)
  scene.add(light)

  light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 50, 0)
  light.castShadow = true
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  light.shadow.camera.near = 1
  light.shadow.camera.far = 500
  light.shadow.camera.right = 100
  light.shadow.camera.left = -100
  light.shadow.camera.top = 100
  light.shadow.camera.bottom = -100
  // light.shadow.radius = 2;
  light.shadow.radius = 0
  // light.shadow.bias = - 0.00006;
  scene.add(light)

  var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  grid.position.y = 0.1
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.gammaOutput = true
  // renderer.gammaFactor = 1.3
  renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function init_cannon() {
  window.fixedTimeStep = 1 / 60
  // window.fixedTimeStep = 1 / 120
  window.maxSubSteps = 3
  // window.maxSubSteps = 30
  window.world = new CANNON.World()
  world.defaultMaterial.restitution = 0 ///todo: Why no effect, still bounce?
  world.defaultContactMaterial.friction = 0.05
  world.gravity.set(0, -50, 0)
  world.broadphase = new CANNON.NaiveBroadphase()

  world.addEventListener('beginContact', (event) => {
    if (event.bodyA) {
      event.bodyA.dispatchEvent({ type: 'beginContact', body: event.bodyB })
    }
    if (event.bodyB) {
      event.bodyB.dispatchEvent({ type: 'beginContact', body: event.bodyA })
    }

    // test log
    // if (!event.bodyA) {
    //   console.log('-beginContact;', event.bodyB.name)
    //   return
    // }
    // if (!event.bodyB) {
    //   console.log('-beginContact;', event.bodyA.name)
    //   return
    // }

    // // if (event.bodyA.name === 'ground' || event.bodyB.name === 'ground') return
    // // if (event.bodyA.name === 'role' || event.bodyB.name === 'role') {
    // if ((event.bodyA.name === 'role' || event.bodyB.name === 'role') && (event.bodyA.name === 'box' || event.bodyB.name === 'box')) {
    //   console.log('beginContact:', event.bodyA.name, event.bodyB.name)
    // }
  })
  world.addEventListener('endContact', (event) => {
    if (event.bodyA) {
      event.bodyA.dispatchEvent({ type: 'endContact', body: event.bodyB })
    }
    if (event.bodyB) {
      event.bodyB.dispatchEvent({ type: 'endContact', body: event.bodyA })
    }

    // test log
    // if (!event.bodyA) {
    //   console.log('-endContact;', event.bodyB.name)
    //   return
    // }
    // if (!event.bodyB) {
    //   console.log('-endContact;', event.bodyA.name)
    //   return
    // }

    // if ((event.bodyA.name === 'role' || event.bodyB.name === 'role') && (event.bodyA.name === 'box' || event.bodyB.name === 'box')) {
    //   console.log('endContact:', event.bodyA.name, event.bodyB.name)
    // }
  })

  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Digit1':
        xstateService.send('maria')
        break
      case 'Digit2':
        xstateService.send('paladin')
        break
    }
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

function animate(time) {
  // console.log('animate')
  requestAnimationFrame(animate)

  var dt = clock.getDelta()

  if (role === maria) {
    paladin.xstateService.send('attack')
  } else {
    maria.xstateService.send('attack')
  }

  updates.forEach((update) => {
    update(dt, time)
  })

  if (window.camera && window.role.gltf) {
    camera.position.set(role.gltf.scene.position.x, role.gltf.scene.position.y + 30, role.gltf.scene.position.z + 30)
    // camera.lookAt(role.gltf.scene.position)
  }

  cannonDebugRenderer.update()
  world.step(fixedTimeStep, dt, maxSubSteps)
  renderer.render(scene, camera)

  stats.update()
}
