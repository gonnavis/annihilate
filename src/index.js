import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
window.THREE = THREE
import { OrbitControls } from '../lib/three.js/examples/jsm/controls/OrbitControls.js'

import * as CANNON from '../lib/cannon-es_my.js'
window.CANNON = CANNON
import cannonDebugger from '../lib/cannon-es-debugger.js'
// THREE.cannonDebugger = cannonDebugger

import { GUI } from '../lib/lil-gui.module.min.js'

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
import { Flail } from './Flail.js'
import { Robot } from './Robot.js'
import { RoleControls } from './RoleControls.js'
import { Ai } from './Ai.js'
import { MutantAi } from './MutantAi.js'
import { RobotAi } from './RobotAi.js'
import { RobotBossAi } from './RobotBossAi.js'
import { PaladinAi } from './PaladinAi.js'
import { ParrotAi } from './ParrotAi.js'
import { HandKnife } from './HandKnife.js'
import { Teleporter } from './Teleporter.js'
import { Parrot } from './Parrot.js'
import { Catapult } from './Catapult.js'
import { Cloud } from './Cloud.js'
import { BirdFlock } from './BirdFlock.js'
import { JumpPoint } from './JumpPoint.js'
import { RobotBoss } from './RobotBoss.js'
// import { TorusKnot } from './TorusKnot.js'
// import { TranslatedBox } from './TranslatedBox.js'

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
window.hadoukens = []
window.bullets = []
window.grenades = []

let fsm
window.service = null

// let cameraDist = 7
// let cameraDist = 11
let cameraDist = 15
let cameraPosX = 0
let cameraPosY = g.getQueryStringByName('view') === 'front' ? 0 : cameraDist
let cameraPosZ = g.getQueryStringByName('view') === 'top' ? 0 : cameraDist

// const gui = new GUI({ width: 310 })
const gui = new GUI()

init_xstate()
init_three()
init_cannon()
if (g.getQueryStringByName('cannon') === 'true') window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, { autoUpdate: false })
init()
requestAnimationFrame(animate)

function init_xstate() {
  fsm = createMachine(
    {
      id: 'index',
      initial: 'initial',
      states: {
        initial: {},
        maria: { entry: 'entryMaria' },
        paladin: { entry: 'entryPaladin', exit: 'exitPaladin' },
        robot: { entry: 'entryRobot', exit: 'exitRobot' },
        robotBoss: { entry: 'entryRobotBoss', exit: 'exitRobotBoss' },
        parrot: { entry: 'entryParrot', exit: 'exitParrot' },
        mutant: { entry: 'entryMutant', exit: 'exitMutant' },
      },
      on: {
        maria: { target: '.maria' },
        paladin: { target: '.paladin' },
        robot: { target: '.robot' },
        robotBoss: { target: '.robotBoss' },
        parrot: { target: '.parrot' },
        mutant: { target: '.mutant' },
      },
    },
    {
      actions: {
        entryMaria: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(maria) ///todo: Use ECS?
          roleControls.setRole(maria)

          // ai.setTarget(maria)

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domMaria.disabled = true
        },
        entryPaladin: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(paladin) ///todo: Use ECS?
          roleControls.setRole(paladin)

          // ai.setTarget(paladin)

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domPaladin.disabled = true

          if (paladin.ai) paladin.ai.enabled = false
        },
        exitPaladin: () => {
          if (paladin.ai) paladin.ai.enabled = true
        },
        entryRobot: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(robot) ///todo: Use ECS?
          roleControls.setRole(robot)

          // ai.setTarget(robot)

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domRobot.disabled = true

          if (robot.ai) robot.ai.enabled = false
        },
        exitRobot: () => {
          if (robot.ai) robot.ai.enabled = true
        },
        entryRobotBoss: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(robotBoss) ///todo: Use ECS?
          roleControls.setRole(robotBoss)

          // ai.setTarget(robotBoss)

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domRobotBoss.disabled = true

          if (robotBoss.ai) robotBoss.ai.enabled = false
        },
        exitRobotBoss: () => {
          if (robotBoss.ai) robotBoss.ai.enabled = true
        },
        entryParrot: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(parrot) ///todo: Use ECS?
          roleControls.setRole(parrot)

          // ai.setTarget(parrot)

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domParrot.disabled = true

          if (parrot.ai) parrot.ai.enabled = false
        },
        exitParrot: () => {
          if (parrot.ai) parrot.ai.enabled = true
        },
        entryMutant: () => {
          if (!window.roleControls) window.roleControls = new RoleControls(mutants[0]) ///todo: Use ECS?
          roleControls.setRole(mutants[0])

          // ai.setTarget(mutants[0])

          Array.prototype.forEach.call(domRoles.children, (domRole) => {
            domRole.disabled = false
          })
          domMutant.disabled = true

          if (mutants[0].ai) mutants[0].ai.enabled = false
        },
        exitMutant: () => {
          if (mutants[0].ai) mutants[0].ai.enabled = true
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
  window.groundBox = new Box(8, 1.3, 30)
  groundBox.mesh.position.set(-11, 0.65, 0)
  groundBox.body.position.copy(groundBox.mesh.position)

  // wall box
  window.wallBoxL = new Box(2, 12, 6)
  wallBoxL.isScene = true
  wallBoxL.mesh.position.set(-24, 6, -12)
  // wallBoxL.mesh.position.set(-5, 5, 0)
  wallBoxL.body.position.copy(wallBoxL.mesh.position)

  window.wallBoxR = new Box(2, 12, 6)
  wallBoxR.isScene = true
  wallBoxR.mesh.position.set(-18, 6, -12)
  // wallBoxR.mesh.position.set(1, 5, 0)
  wallBoxR.body.position.copy(wallBoxR.mesh.position)

  // catapult
  window.catapult = new Catapult(3, 0.2, 4)

  // teleporter
  window.teleporter = new Teleporter(0.7, 0.7, 0.7)
  teleporter.body.position.set(-13, 3.7, -12)
  teleporter.mesh.position.copy(teleporter.body.position)
  teleporter.dest.set(-21, 22, -18)

  window.teleporter2 = new Teleporter(0.7, 0.7, 0.7)
  teleporter2.body.position.set(-11, 3.7, -12)
  teleporter2.mesh.position.copy(teleporter2.body.position)
  teleporter2.dest.set(-18, 220, -18)

  window.teleporter3 = new Teleporter(0.7, 0.7, 0.7)
  teleporter3.body.position.set(-9, 3.7, -12)
  teleporter3.mesh.position.copy(teleporter3.body.position)
  teleporter3.dest.set(-9, 22, -12)

  window.teleporter4 = new Teleporter(0.7, 0.7, 0.7)
  teleporter4.body.position.set(-19, 3, -60)
  teleporter4.mesh.position.copy(teleporter4.body.position)
  teleporter4.dest.set(-20, 15, -45)

  // jumpPoint
  window.jumpPoint = new JumpPoint(0.7)
  jumpPoint.body.position.set(-16, 14, -60)
  // jumpPoint.body.position.set(-16, 12, -55)
  jumpPoint.mesh.position.copy(jumpPoint.body.position)

  window.hill = new Hill()

  // window.torusKnot = new TorusKnot({
  //   position: new THREE.Vector3(0, 2, 0),
  // })

  // window.translatedBox = new TranslatedBox({
  //   position: new THREE.Vector3(0, 1.5, 0),
  // })

  // air box
  window.airBox = new Box(15, 1.5, 30)
  airBox.mesh.position.set(-20, 12, -33)
  airBox.body.position.copy(airBox.mesh.position)

  window.airBox2 = new Box(6, 1.5, 30)
  // airBox2.mesh.position.set(-20, 12, -68)
  airBox2.mesh.position.set(-25, 12, -75)
  airBox2.body.position.copy(airBox2.mesh.position)

  window.airBox3 = new Box(6, 1.5, 30)
  // airBox3.mesh.position.set(-20, 12, -68)
  airBox3.mesh.position.set(-15, 12, -90)
  airBox3.body.position.copy(airBox3.mesh.position)

  window.floatingBoxes = []
  for (let i = 0; i < 7; i++) {
    let floatingBox = new FloatingBox(3.7, 0.37, 3.7)
    // floatingBox.body.position.x = i * 20
    floatingBox.body.position.y = 2.2 * (i + 1)
    floatingBox.body.position.z = -12.96 - i * 2.6
    // floatingBox.body.position.z = -35 - (i % 2) * 5
    // floatingBox.timeBias = i * 2

    floatingBoxes.push(floatingBox)
  }

  //

  if (g.getQueryStringByName('roleAirBox') === 'true') {
    window.maria = new Maria(-20, 15, -45)
  } else if (g.getQueryStringByName('boss') === 'true') {
    window.maria = new Maria(-40, 5, 35)
    // window.maria = new Maria(-40, 5, 15)
  } else {
    window.maria = new Maria(-2, 2, 0)
    // window.maria = new Maria(-2, 2, 8)
    // window.maria = new Maria(0, 5, -15)
    // window.maria = new Maria(-35, 5, 0)
    // window.maria = new Maria(0, 0, 0)
  }
  maria.load(() => {
    // maria.mesh.rotation.set(0, Math.PI, 0)
    maria.setFacing(0, -1)
  })
  window.greatSword = new GreatSword()
  greatSword.owner = maria

  if (g.isEnemy) {
    if (!(g.getQueryStringByName('paladin') === 'false')) {
      window.paladin = new Paladin({
        position: new THREE.Vector3(5, 5, 0),
      })
      // window.paladin = new Paladin(0, 5, 0)
      paladin.load(() => {
        // paladin.mesh.rotation.set(0, Math.PI, 0)
        paladin.setFacing(-1, 0)
      })
      window.sword = new Sword()
      sword.owner = paladin
      window.shield = new Shield()
      shield.owner = paladin
      // window.flail = new Flail() // TODO: Add to maria greatSword for test.
      // flail.owner = paladin
      paladin.ai = new PaladinAi(paladin, 8)
    }

    window.mutants = []
    THREE.MathUtils.seededRandom( 1 );
    // let mutantsCount = g.getQueryStringByName('mutants') === 'false' ? 0 : 3
    let mutantsCount = parseInt(g.getQueryStringByName('mutants'))
    if (Number.isNaN(mutantsCount)) mutantsCount = 3
    for (let i = 0; i < mutantsCount; i++) {
      let mutant = new Mutant({ position: new THREE.Vector3((THREE.MathUtils.seededRandom() - 0.5) * 28, 2, (THREE.MathUtils.seededRandom() - 0.5) * 28) })
      // let mutant = new Mutant(-25, 5, 0)
      let handKnife = new HandKnife()
      handKnife.owner = mutant
      mutant.load()
      mutants.push(mutant)

      let ai = new MutantAi(mutant, 4)
      mutant.ai = ai
      // ai.isAttack = false
    }

    if (!(g.getQueryStringByName('robot') === 'false')) {
      window.robots = []
      window.robot = new Robot({
        position: new THREE.Vector3(6, 2, -4),
      })
      robots.push(robot)
      robot.load()
      robot.ai = new RobotAi(robot, 8)
      // robot.ai.isAttack = false

      // window.robot2 = new Robot(15, 5, 15)
      // robots.push(robot2)
      // robot2.load()
    }

    if (!(g.getQueryStringByName('parrot') === 'false')) {
      window.parrot = new Parrot({
        position: new THREE.Vector3(0, 4, -5),
      })
      parrot.load()
      parrot.ai = new ParrotAi(parrot, 8)
    }

    window.robotBoss = new RobotBoss({
      position: new THREE.Vector3(-40, 5, 10),
    })
    robotBoss.load()
    robotBoss.ai = new RobotBossAi(robotBoss, 8) // TODO: Create in RobotBoss.js? Because need access ai in it.
  }

  domMaria.addEventListener('click', (event) => {
    window.service.send('maria')
  })
  domPaladin.addEventListener('click', (event) => {
    window.service.send('paladin')
  })
  domRobot.addEventListener('click', (event) => {
    window.service.send('robot')
  })
  domRobot.addEventListener('click', (event) => {
    window.service.send('robotBoss')
  })
  domParrot.addEventListener('click', (event) => {
    window.service.send('parrot')
  })
  domMutant.addEventListener('click', (event) => {
    window.service.send('mutant')
  })

  window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'Digit0':
        window.setting['defeat all mutants (0)']()
        break
      case 'Digit1':
        window.service.send('maria')
        break
      case 'Digit2':
        window.service.send('paladin')
        break
      case 'Digit3':
        window.service.send('robot')
        break
      case 'Digit6':
        window.service.send('robotBoss')
        break
      case 'Digit4':
        window.service.send('parrot')
        break
      case 'Digit5':
        window.service.send('mutant')
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
    'defeat all mutants (0)': () => {
      window.mutants.forEach((mutant) => {
        mutant.health = 0
        mutant.hit()
      })
    },
    'add flail': () => {
      window.flail = new Flail({ delegate: maria.swordTipDelegate }) // TODO: Add to maria greatSword for test.
      flail.owner = maria
      flail.body.collisionFilterGroup = g.GROUP_ROLE_ATTACKER
      flail.body.collisionFilterMask = g.GROUP_ENEMY
      maria.attackSpeed = 0.6
      maria.whirlwindOneTurnDuration = 0.5
    },
  }

  // gui.add(window.ai, 'enabled').name('simple enemy AI')

  gui.add(setting, 'show debugRenderer')
  gui.add(setting, 'defeat all mutants (0)')
  gui.add(setting, 'add flail')
  gui.add({ 'show cloud': false }, 'show cloud').onChange((bool) => {
    if (bool) {
      if (window.cloud) {
        window.cloud.mesh.visible = true
      } else {
        window.cloud = new Cloud()
        if (g.isOrbit) cloud.mesh.position.set(0, 2, 0)
        else cloud.mesh.position.set(-27, 16.5, -25)
        cloud.mesh.scale.set(12, 6, 12)

        if (!g.isOrbit) window.role.body.position.set(-24, 16, -25)
      }
    } else {
      window.cloud.mesh.visible = false
    }
  })
  gui.add({ 'show birdFlock': false }, 'show birdFlock').onChange((bool) => {
    if (bool) {
      if (window.birdFlock) {
        window.birdFlock.mesh.visible = true
      } else {
        window.birdFlock = new BirdFlock()
        if (g.isOrbit) birdFlock.mesh.position.set(0, 1, 0)
        else birdFlock.mesh.position.set(-20, 13, -26)

        if (!g.isOrbit) window.role.body.position.set(-24, 16, -25)
      }
    } else {
      window.birdFlock.mesh.visible = false
    }
  })

  // gui.add(teleporter.mesh.position, 'x', -50, 50, 1)
  // gui.add(teleporter.mesh.position, 'y', -50, 50, 1)
  // gui.add(teleporter.mesh.position, 'z', -50, 50, 1)

  if (g.getQueryStringByName('gui') === 'false') gui.close()

  ///todo: fix bug after ```roleControls.role = paladin```.
}

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 370)
  camera.position.set(cameraPosX, cameraPosY, cameraPosZ)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()

  // lights

  let light = new THREE.HemisphereLight(0x888888, 0x333333)
  light.position.set(0, 7.41, 0)
  scene.add(light)

  window.shadowLight = new THREE.DirectionalLight(0x888888)
  shadowLight.position.set(0, 37, 0)
  shadowLight.castShadow = true
  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 185
  shadowLight.shadow.camera.right = 37
  shadowLight.shadow.camera.left = -37
  shadowLight.shadow.camera.top = 37
  shadowLight.shadow.camera.bottom = -37
  // shadowLight.shadow.radius = 2;
  shadowLight.shadow.radius = 0
  // shadowLight.shadow.bias = - 0.00006;
  scene.add(shadowLight)
  scene.add(shadowLight.target)

  // window.supLight = new THREE.DirectionalLight(0x888888)
  window.supLight = new THREE.DirectionalLight(0x333333)
  supLight.position.set(1, 1, 3)
  scene.add(supLight)

  window.gridHelper = new THREE.GridHelper(100, 100, 0x000000, 0x000000)
  gridHelper.position.y = 0.037
  gridHelper.material.opacity = 0.2
  gridHelper.material.transparent = true
  scene.add(gridHelper)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.gammaOutput = true
  // renderer.gammaFactor = 1.3
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  if (g.isOrbit) window.controls = new OrbitControls(camera, renderer.domElement)
}

function init_cannon() {
  window.fixedTimeStep = 1 / 60
  // window.fixedTimeStep = 1 / 120
  window.maxSubSteps = 3
  // window.maxSubSteps = 30
  window.world = new CANNON.World()
  world.defaultMaterial.restitution = 0 ///todo: Why no effect, still bounce?
  world.defaultContactMaterial.friction = 0.05
  // world.defaultContactMaterial.friction = 0
  world.gravity.set(0, -10, 0)
  world.broadphase = new CANNON.NaiveBroadphase()

  // world.defaultContactMaterial.contactEquationRelaxation = 10
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
  // debugger
  console.log('animate')
  requestAnimationFrame(animate)

  var dt = clock.getDelta()

  updates.forEach((entity) => {
    entity.update(dt, time)
  })

  if (window.service.state.matches('initial')) return

  if (window.camera && window.role.gltf) {
    if (!window.controls) {
      camera.position.set(role.mesh.position.x + cameraPosX, role.mesh.position.y + cameraPosY, role.mesh.position.z + cameraPosZ)
      // camera.lookAt(role.mesh.position)
    }
    shadowLight.position.x = shadowLight.target.position.x = window.role.body.position.x
    shadowLight.position.z = shadowLight.target.position.z = window.role.body.position.z
    gridHelper.position.x = Math.round(window.role.body.position.x)
    gridHelper.position.z = Math.round(window.role.body.position.z)
  }

  if (window.cannonDebugRenderer) cannonDebugRenderer.update()
  world.step(fixedTimeStep, dt, maxSubSteps)
  renderer.render(scene, camera)

  stats.update()
  // debugger
}
