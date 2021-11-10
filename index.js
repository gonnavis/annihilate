// glsl function
var vec2 = function (x, y) {
  return new THREE.Vector2(...arguments)
}
var vec3 = function (x, y, z) {
  return new THREE.Vector3(...arguments)
}

// setting

var container, stats, clock, gui, mixer, actions, activeAction, previousAction
var camera, scene, renderer, model, face
var updates = []
window.gs = 0.5 //global scale ( mainly for ammojs bodies to have desired falling speed ).

// Heightfield parameters
var terrainWidthExtents = 100
var terrainDepthExtents = 100
var terrainWidth = 128
var terrainDepth = 128
var terrainHalfWidth = terrainWidth / 2
var terrainHalfDepth = terrainDepth / 2
var terrainMaxHeight = 8
var terrainMinHeight = -2

// Graphics variables
var container, stats
var camera, scene, renderer
var terrainMesh
var clock = new THREE.Clock()

// Physics variables
var collisionConfiguration
var dispatcher
var broadphase
var solver
var world
var dynamicObjects = []
var transformAux1

var heightData = null
var ammoHeightData = null

var time = 0
var objectTimePeriod = 3
var timeNextSpawn = time + objectTimePeriod
var maxNumObjects = 30
var cameraAway = 15
// var cameraAway = 30

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib

  heightData = generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)

  init_three()
  // init_cannon();
  init_ammo()
  // window.cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
  init()
  animate()
})

function init() {
  window.ground = new Ground() // todo: refactor
  window.ground = new Box() // todo: refactor

  window.role = new Role(0, 20, 0)
  role.load()
  window.axes = new Axes()

  window.enemy = new Enemy(15, 5, -15)
  enemy.load()
}

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(0, cameraAway * gs, cameraAway * gs)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  clock = new THREE.Clock()

  // lights

  var light = new THREE.HemisphereLight(0xffffff, 0x444444)
  light.position.set(0, 20, 0)
  scene.add(light)

  light = new THREE.DirectionalLight(0xffffff)
  light.position.set(0, 20, 10)
  // scene.add(light)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.gammaOutput = true
  renderer.gammaFactor = 1.3
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  // controls = new THREE.OrbitControls(camera, renderer.domElement)
}

// function init_cannon() {
//   window.fixedTimeStep = 1 / 60;
//   window.maxSubSteps = 3;
//   window.world = new CANNON.World()
//   world.defaultContactMaterial.friction = .05
//   world.gravity.set(0, -50, 0)
//   world.broadphase = new CANNON.NaiveBroadphase();
// }

function init_ammo() {
  // Physics configuration

  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  broadphase = new Ammo.btDbvtBroadphase()
  solver = new Ammo.btSequentialImpulseConstraintSolver()
  world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  world.setGravity(new Ammo.btVector3(0, -9.8, 0))

  // Create the terrain body ( sine wave shape )

  // const groundShape = createTerrainShape()
  // const groundTransform = new Ammo.btTransform()
  // groundTransform.setIdentity()
  // // Shifts the terrain, since bullet re-centers it on its bounding box.
  // groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
  // const groundMass = 0
  // const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
  // const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
  // const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
  // world.addRigidBody(groundBody)

  // transformAux1 = new Ammo.btTransform()
}

function createTerrainShape() {
  // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
  const heightScale = 1

  // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
  const upAxis = 1

  // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
  const hdt = 'PHY_FLOAT'

  // Set this to your needs (inverts the triangles)
  const flipQuadEdges = false

  // Creates height data buffer in Ammo heap
  ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)

  // Copy the javascript height data array to the Ammo one.
  let p = 0
  let p2 = 0

  for (let j = 0; j < terrainDepth; j++) {
    for (let i = 0; i < terrainWidth; i++) {
      // write 32-bit float data to memory
      Ammo.HEAPF32[(ammoHeightData + p2) >> 2] = heightData[p]

      p++

      // 4 bytes/float
      p2 += 4
    }
  }

  // Creates the heightfield physics shape
  const heightFieldShape = new Ammo.btHeightfieldTerrainShape(terrainWidth, terrainDepth, ammoHeightData, heightScale, terrainMinHeight, terrainMaxHeight, upAxis, hdt, flipQuadEdges)

  // Set horizontal scale
  const scaleX = terrainWidthExtents / (terrainWidth - 1)
  const scaleZ = terrainDepthExtents / (terrainDepth - 1)
  heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))

  heightFieldShape.setMargin(0.05)

  return heightFieldShape
}

function generateHeight(width, depth, minHeight, maxHeight) {
  // Generates the height data (a sinus wave)

  const size = width * depth
  const data = new Float32Array(size)

  const hRange = maxHeight - minHeight
  const w2 = width / 2
  const d2 = depth / 2
  const phaseMult = 12

  let p = 0

  for (let j = 0; j < depth; j++) {
    for (let i = 0; i < width; i++) {
      const radius = Math.sqrt(Math.pow((i - w2) / w2, 2.0) + Math.pow((j - d2) / d2, 2.0))

      const height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight

      data[p] = height

      p++
    }
  }

  return data
}

function createTerrainShape() {
  // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
  const heightScale = 1

  // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
  const upAxis = 1

  // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
  const hdt = 'PHY_FLOAT'

  // Set this to your needs (inverts the triangles)
  const flipQuadEdges = false

  // Creates height data buffer in Ammo heap
  ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)

  // Copy the javascript height data array to the Ammo one.
  let p = 0
  let p2 = 0

  for (let j = 0; j < terrainDepth; j++) {
    for (let i = 0; i < terrainWidth; i++) {
      // write 32-bit float data to memory
      Ammo.HEAPF32[(ammoHeightData + p2) >> 2] = heightData[p]

      p++

      // 4 bytes/float
      p2 += 4
    }
  }

  // Creates the heightfield physics shape
  const heightFieldShape = new Ammo.btHeightfieldTerrainShape(terrainWidth, terrainDepth, ammoHeightData, heightScale, terrainMinHeight, terrainMaxHeight, upAxis, hdt, flipQuadEdges)

  // Set horizontal scale
  const scaleX = terrainWidthExtents / (terrainWidth - 1)
  const scaleZ = terrainDepthExtents / (terrainDepth - 1)
  heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))

  heightFieldShape.setMargin(0.05)

  return heightFieldShape
}

function createTerrainShape() {
  // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
  const heightScale = 1

  // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
  const upAxis = 1

  // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
  const hdt = 'PHY_FLOAT'

  // Set this to your needs (inverts the triangles)
  const flipQuadEdges = false

  // Creates height data buffer in Ammo heap
  ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)

  // Copy the javascript height data array to the Ammo one.
  let p = 0
  let p2 = 0

  for (let j = 0; j < terrainDepth; j++) {
    for (let i = 0; i < terrainWidth; i++) {
      // write 32-bit float data to memory
      Ammo.HEAPF32[(ammoHeightData + p2) >> 2] = heightData[p]

      p++

      // 4 bytes/float
      p2 += 4
    }
  }

  // Creates the heightfield physics shape
  const heightFieldShape = new Ammo.btHeightfieldTerrainShape(terrainWidth, terrainDepth, ammoHeightData, heightScale, terrainMinHeight, terrainMaxHeight, upAxis, hdt, flipQuadEdges)

  // Set horizontal scale
  const scaleX = terrainWidthExtents / (terrainWidth - 1)
  const scaleZ = terrainDepthExtents / (terrainDepth - 1)
  heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))

  heightFieldShape.setMargin(0.05)

  return heightFieldShape
}

function detectCollision() {
  // https://medium.com/@bluemagnificent/collision-detection-in-javascript-3d-physics-using-ammo-js-and-three-js-31a5569291ef
  let dispatcher = world.getDispatcher()
  let numManifolds = dispatcher.getNumManifolds()

  for (let i = 0; i < numManifolds; i++) {
    let contactManifold = dispatcher.getManifoldByIndexInternal(i)

    let rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody)
    let rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody)

    // if (rb0.name !== 'ground' && rb1.name !== 'ground') console.log('detectCollision', rb0, rb1)

    // why fire collide event at here will cause too early / too far.
    // rb0.onCollide({
    //   body: rb1,
    // })
    // rb1.onCollide({
    //   body: rb0,
    // })

    // let threeObject0 = rb0.threeObject
    // let threeObject1 = rb1.threeObject

    // if (!threeObject0 && !threeObject1) continue

    // let userData0 = threeObject0 ? threeObject0.userData : null
    // let userData1 = threeObject1 ? threeObject1.userData : null
    // let tag0 = userData0 ? userData0.tag : 'none'
    // let tag1 = userData1 ? userData1.tag : 'none'

    let numContacts = contactManifold.getNumContacts()

    for (let j = 0; j < numContacts; j++) {
      let contactPoint = contactManifold.getContactPoint(j)
      let distance = contactPoint.getDistance()

      // why fire collide event at here works fine, even do not need check distance.
      rb0.onCollide({
        body: rb1,
        distance,
      })
      rb1.onCollide({
        body: rb0,
        distance,
      })

      // if (distance > 0.0) continue

      let velocity0 = rb0.getLinearVelocity()
      let velocity1 = rb1.getLinearVelocity()
      let worldPos0 = contactPoint.get_m_positionWorldOnA()
      let worldPos1 = contactPoint.get_m_positionWorldOnB()
      let localPos0 = contactPoint.get_m_localPointA()
      let localPos1 = contactPoint.get_m_localPointB()

      // console.log({
      //   manifoldIndex: i,
      //   contactIndex: j,
      //   distance: distance,
      //   name0: rb0.name,
      //   name1: rb1.name,
      //   object0: {
      //     name: rb0.name,
      //     velocity: { x: velocity0.x(), y: velocity0.y(), z: velocity0.z() },
      //     worldPos: { x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z() },
      //     localPos: { x: localPos0.x(), y: localPos0.y(), z: localPos0.z() },
      //   },
      //   object1: {
      //     name: rb1.name,
      //     velocity: { x: velocity1.x(), y: velocity1.y(), z: velocity1.z() },
      //     worldPos: { x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z() },
      //     localPos: { x: localPos1.x(), y: localPos1.y(), z: localPos1.z() },
      //   },
      // })
    }
  }
}

//

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

function animate() {
  requestAnimationFrame(animate)

  var dt = clock.getDelta()

  world.stepSimulation(dt, 10)
  detectCollision()

  updates.forEach((update) => {
    update(dt)
  })

  if (window.camera && window.role.gltf) {
    camera.position.set(role.gltf.scene.position.x, cameraAway * gs, role.gltf.scene.position.z + cameraAway * gs)
    // camera.position.set(role.gltf.scene.position.x, 100, role.gltf.scene.position.z + 100)
    // camera.lookAt(role.gltf.scene.position)
  }

  // cannonDebugRenderer.update()
  // world.step(fixedTimeStep, dt)
  renderer.render(scene, camera)

  stats.update()
}
