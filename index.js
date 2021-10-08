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
var physicsWorld
var dynamicObjects = []
var transformAux1

var heightData = null
var ammoHeightData = null

var time = 0
var objectTimePeriod = 3
var timeNextSpawn = time + objectTimePeriod
var maxNumObjects = 30

Ammo().then(function (AmmoLib) {
  Ammo = AmmoLib

  heightData = generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)

  init_three()
  // init_cannon();
  init_ammo()
  // window.cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
  // init()
  animate()
})

function init() {
  window.ground = new Ground() // todo: refactor

  window.role = new Role(0, 5, 0)
  role.load()
  window.axes = new Axes()

  window.enemy = new Enemy(15, 5, -15)
  enemy.load()
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
  light.position.set(0, 20, 10)
  scene.add(light)

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
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
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
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  physicsWorld.setGravity(new Ammo.btVector3(0, -6, 0))

  // Create the terrain body

  const groundShape = createTerrainShape()
  const groundTransform = new Ammo.btTransform()
  groundTransform.setIdentity()
  // Shifts the terrain, since bullet re-centers it on its bounding box.
  groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
  const groundMass = 0
  const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
  const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
  const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
  physicsWorld.addRigidBody(groundBody)

  transformAux1 = new Ammo.btTransform()
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

function generateHeight( width, depth, minHeight, maxHeight ) {

  // Generates the height data (a sinus wave)

  const size = width * depth;
  const data = new Float32Array( size );

  const hRange = maxHeight - minHeight;
  const w2 = width / 2;
  const d2 = depth / 2;
  const phaseMult = 12;

  let p = 0;

  for ( let j = 0; j < depth; j ++ ) {

    for ( let i = 0; i < width; i ++ ) {

      const radius = Math.sqrt(
        Math.pow( ( i - w2 ) / w2, 2.0 ) +
          Math.pow( ( j - d2 ) / d2, 2.0 ) );

      const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;

      data[ p ] = height;

      p ++;

    }

  }

  return data;

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
				const heightScale = 1;

				// Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
				const upAxis = 1;

				// hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
				const hdt = "PHY_FLOAT";

				// Set this to your needs (inverts the triangles)
				const flipQuadEdges = false;

				// Creates height data buffer in Ammo heap
				ammoHeightData = Ammo._malloc( 4 * terrainWidth * terrainDepth );

				// Copy the javascript height data array to the Ammo one.
				let p = 0;
				let p2 = 0;

				for ( let j = 0; j < terrainDepth; j ++ ) {

					for ( let i = 0; i < terrainWidth; i ++ ) {

						// write 32-bit float data to memory
						Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];

						p ++;

						// 4 bytes/float
						p2 += 4;

					}

				}

				// Creates the heightfield physics shape
				const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
					terrainWidth,
					terrainDepth,
					ammoHeightData,
					heightScale,
					terrainMinHeight,
					terrainMaxHeight,
					upAxis,
					hdt,
					flipQuadEdges
				);

				// Set horizontal scale
				const scaleX = terrainWidthExtents / ( terrainWidth - 1 );
				const scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
				heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

				heightFieldShape.setMargin( 0.05 );

				return heightFieldShape;

			}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

//

function animate() {
  requestAnimationFrame(animate)

  // var dt = clock.getDelta()

  // updates.forEach((update) => {
  //   update(dt)
  // })

  // if (window.camera && window.role.gltf) {
  //   camera.position.set(role.gltf.scene.position.x, 30, role.gltf.scene.position.z + 30)
  //   // camera.lookAt(role.gltf.scene.position)
  // }

  // cannonDebugRenderer.update()
  // world.step(fixedTimeStep, dt)
  renderer.render(scene, camera)

  stats.update()
}
