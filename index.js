import * as CANNON from './lib/cannon-es_my.js'
window.CANNON = CANNON
import cannonDebugger from './lib/cannon-es-debugger.js'
// THREE.cannonDebugger = cannonDebugger

// import { Ground } from './ground.js'
import { Level } from './level.js'
import { Box } from './box.js'
import { FloatingBox } from './floatingBox.js'
import { Role } from './role.js'
import { Axes } from './axes.js'
import { Enemy } from './enemy.js'

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
window.cameraWrap = new THREE.Group()

init_three()
init_cannon()
window.cannonDebugRenderer = cannonDebugger(scene, world.bodies)
init()
requestAnimationFrame(animate)

function init() {
  // window.ground = new Ground() // todo: refactor

  window.level = new Level()
  level.load(() => {
    // level.mesh.material = floatingBox.box.mesh.material
  })

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

  // window.floatingBox3 = new FloatingBox()
  // floatingBox3.box.body.position.y = 6 * 3
  // floatingBox3.box.body.position.z = -35
  // floatingBox3.timeBias = 4

  // window.floatingBox4 = new FloatingBox()
  // floatingBox4.box.body.position.y = 6 * 4
  // floatingBox4.box.body.position.z = -40
  // floatingBox4.timeBias = 6

  // window.floatingBox5 = new FloatingBox()
  // floatingBox5.box.body.position.y = 6 * 5
  // floatingBox5.box.body.position.z = -35
  // floatingBox5.timeBias = 8

  window.role = new Role(0, 5, 0)
  role.load()
  // window.axes = new Axes()

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

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 1000)
  camera.position.set(0, 30, 30)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  scene.add(cameraWrap)
  cameraWrap.add(camera)

  clock = new THREE.Clock()

  // lights

  var light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 20, 0)
  scene.add(light)

  window.directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(0, 50, 0)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 1
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.right = 100
  directionalLight.shadow.camera.left = -100
  directionalLight.shadow.camera.top = 100
  directionalLight.shadow.camera.bottom = -100
  // directionalLight.shadow.radius = 2;
  directionalLight.shadow.radius = 0
  // directionalLight.shadow.bias = - 0.00006;
  directionalLight.shadow.bias = - 0.001; // used for `mesh.material.shadowSide = THREE.FrontSide` ( plane's shadow )
  scene.add(directionalLight)

  var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000)
  grid.position.y = 0.1
  grid.material.opacity = 0.2
  grid.material.transparent = true
  scene.add(grid)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.gammaOutput = true
  renderer.gammaFactor = 1.3
  renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function init_cannon() {
  window.fixedTimeStep = 1 / 60
  window.maxSubSteps = 3
  window.world = new CANNON.World()
  world.defaultContactMaterial.friction = 0.05
  world.gravity.set(0, -50, 0)
  world.broadphase = new CANNON.NaiveBroadphase()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

function animate(time) {
  requestAnimationFrame(animate)

  var dt = clock.getDelta()

  updates.forEach((update) => {
    update(dt, time)
  })

  if (window.camera && window.role.gltf) {
    camera.position.set(role.gltf.scene.position.x, role.gltf.scene.position.y + 100, role.gltf.scene.position.z + 100)
    // camera.lookAt(role.gltf.scene.position)
  }

  cannonDebugRenderer.update()
  world.step(fixedTimeStep, dt)
  renderer.render(scene, camera)

  stats.update()
}
