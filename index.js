import * as CANNON from './lib/cannon-es_my.js'
window.CANNON = CANNON
import cannonDebugger from './lib/cannon-es-debugger.js'
// THREE.cannonDebugger = cannonDebugger

import { GUI } from './lib/lil-gui.module.min.js'

import { Ground } from './Ground.js'
import { Hill } from './Hill.js'
// import { Level } from './Level.js'
import { Box } from './Box.js'
import { FloatingBox } from './FloatingBox.js'
import { Maria } from './Maria.js'
import { Paladin } from './Paladin.js'
import { Mutant } from './Mutant.js'
import { GreatSword } from './GreatSword.js'
import { Sword } from './Sword.js'
import { Shield } from './Shield.js'
import { Enemy } from './Enemy.js'
import { RoleControls } from './RoleControls.js'
import { Ai } from './Ai.js'
import { HandKnife } from './HandKnife.js'
import { Teleporter } from './Teleporter.js'

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

let fsm
window.service = null

const gui = new GUI({ width: 310 })

init_xstate()
init_three()
init_cannon()
// window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, { autoUpdate: false })
init()
requestAnimationFrame(animate)

function init_xstate() {
  fsm = createMachine(
    {
      id: 'index',
      initial: 'initial',
      states: {
        initial: {
          // todo: Why can't init/send first of this list?
          on: { paladin: { target: 'paladin' } },
          on: { maria: { target: 'maria' } },
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
          if (!window.roleControls) window.roleControls = new RoleControls(maria) ///todo: Use ECS?
          roleControls.setRole(maria)

          // ai.setTarget(maria)

          domMaria.disabled = true
          domPaladin.disabled = false
        },
        entryPaladin: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(paladin) ///todo: Use ECS?
          roleControls.setRole(paladin)

          // ai.setTarget(paladin)

          domPaladin.disabled = true
          domMaria.disabled = false
        },
      },
    }
  )

  window.service = interpret(fsm)
  window.service.start()
}

function init() {
  window.ground = new Ground() // todo: refactor

  // window.level = new Level()
  // level.load()

  // ground box
  window.groundBox = new Box(20, 4, 80)
  groundBox.mesh.position.set(-30, 1, 0)
  groundBox.body.position.copy(groundBox.mesh.position)

  window.teleporter = new Teleporter(2, 2, 2)
  teleporter.body.position.set(-35, 10, -35)
  teleporter.mesh.position.copy(teleporter.body.position)
  teleporter.dest.set(-50, 60, -50)

  window.teleporter2 = new Teleporter(2, 2, 2)
  teleporter2.body.position.set(-30, 10, -35)
  teleporter2.mesh.position.copy(teleporter2.body.position)
  teleporter2.dest.set(-50, 600, -50)

  window.teleporter3 = new Teleporter(2, 2, 2)
  teleporter3.body.position.set(-25, 10, -35)
  teleporter3.mesh.position.copy(teleporter3.body.position)
  teleporter3.dest.set(-25, 60, -35)

  window.hill = new Hill()

  // air box
  window.airBox = new Box(40, 4, 80)
  airBox.mesh.position.set(-55, 35, -90)
  airBox.body.position.copy(airBox.mesh.position)

  window.floatingBoxes = []
  for (let i = 0; i < 7; i++) {
    let floatingBox = new FloatingBox(10, 1, 10)
    // floatingBox.body.position.x = i * 20
    floatingBox.body.position.y = 6 * (i + 1)
    floatingBox.body.position.z = -35 - i * 7
    // floatingBox.body.position.z = -35 - (i % 2) * 5
    // floatingBox.timeBias = i * 2

    floatingBoxes.push(floatingBox)
  }

  // window.maria = new Maria(0, 5, -15)
  window.maria = new Maria(-5, 5, 0)
  maria.load(() => {
    // maria.gltf.scene.rotation.set(0, Math.PI, 0)
    maria.setFacing(0, -1)
  })
  window.greatSword = new GreatSword()
  greatSword.owner = maria

  window.paladin = new Paladin(5, 5, 0)
  // window.paladin = new Paladin(0, 5, 0)
  paladin.load(() => {
    // paladin.gltf.scene.rotation.set(0, Math.PI, 0)
    paladin.setFacing(0, -1)
  })
  window.sword = new Sword()
  sword.owner = paladin
  window.shield = new Shield()
  shield.owner = paladin

  window.mutants = []
  for (let i = 0; i < 10; i++) {
    let mutant = new Mutant((Math.random() - 0.5) * 50, 5, (Math.random() - 0.5) * 50)
    let handKnife = new HandKnife()
    handKnife.owner = mutant
    mutant.load()
    mutants.push(mutant)

    let ai = new Ai(mutant, maria, 4)
    // ai.isAttack = false
  }

  domMaria.addEventListener('click', (e) => {
    window.service.send('maria')
  })
  domPaladin.addEventListener('click', (e) => {
    window.service.send('paladin')
  })

  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Digit0':
        window.setting['kill all mutants (0)']()
        break
      case 'Digit1':
        window.service.send('maria')
        break
      case 'Digit2':
        window.service.send('paladin')
        break
    }
  })

  window.service.send('maria')
  // window.service.send('paladin')

  window.setting = {
    'show debugRenderer': () => {
      if (!window.cannonDebugRenderer) {
        window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, {
          autoUpdate: false,
        })
      }
    },
    'kill all mutants (0)': () => {
      window.mutants.forEach((mutant) => {
        mutant.health = 0
        mutant.hit()
      })
    },
  }

  // gui.add(window.ai, 'enabled').name('simple enemy AI')

  gui.add(setting, 'show debugRenderer')
  gui.add(setting, 'kill all mutants (0)')

  // gui.add(teleporter.mesh.position, 'x', -50, 50, 1)
  // gui.add(teleporter.mesh.position, 'y', -50, 50, 1)
  // gui.add(teleporter.mesh.position, 'z', -50, 50, 1)

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

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(0, 30, 30)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()

  // lights

  let light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 20, 0)
  scene.add(light)

  window.shadowLight = new THREE.DirectionalLight(0xffffff)
  shadowLight.position.set(0, 100, 0)
  shadowLight.castShadow = true
  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 500
  shadowLight.shadow.camera.right = 100
  shadowLight.shadow.camera.left = -100
  shadowLight.shadow.camera.top = 100
  shadowLight.shadow.camera.bottom = -100
  // shadowLight.shadow.radius = 2;
  shadowLight.shadow.radius = 0
  // shadowLight.shadow.bias = - 0.00006;
  scene.add(shadowLight)
  scene.add(shadowLight.target)

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

  world.defaultContactMaterial.contactEquationRelaxation = 10
  // Prevent bounce, especially after jumpAttack. // todo: Why relaxation affect bounce?
  // But can cause sink when climbing hill problem.

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

  updates.forEach((entity) => {
    entity.update(dt, time)
  })

  if (window.service.state.matches('initial')) return

  if (window.camera && window.role.gltf) {
    camera.position.set(role.gltf.scene.position.x, role.gltf.scene.position.y + 30, role.gltf.scene.position.z + 30)
    // camera.lookAt(role.gltf.scene.position)
    shadowLight.position.x = shadowLight.target.position.x = window.role.body.position.x
    shadowLight.position.z = shadowLight.target.position.z = window.role.body.position.z
  }

  if (window.cannonDebugRenderer) cannonDebugRenderer.update()
  world.step(fixedTimeStep, dt, maxSubSteps)
  renderer.render(scene, camera)

  stats.update()
}
