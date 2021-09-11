
// glsl function
var vec2 = function (x, y) { return new THREE.Vector2(...arguments) }
var vec3 = function (x, y, z) { return new THREE.Vector3(...arguments) }


// setting

var container, stats, clock, gui, mixer, actions, activeAction, previousAction;
var camera, scene, renderer, model, face;
var updates = []


init_three();
init_cannon();
window.cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
init()
animate();

function init() {
  window.ground = new Ground()// todo: refactor

  window.role = new Role(0, 5, 0)
  role.load()
  window.axes = new Axes()

  window.enemy = new Enemy(15, 5, -15)
  enemy.load()
}

function init_three() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
  camera.position.set(0, 30, 30)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

  clock = new THREE.Clock();

  // lights

  var light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 20, 10);
  scene.add(light);


  var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
  grid.position.y = .1
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 1.3;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function init_cannon() {
  window.fixedTimeStep = 1 / 60;
  window.maxSubSteps = 3;
  window.world = new CANNON.World()
  world.defaultContactMaterial.friction = .01
  world.gravity.set(0, -50, 0)
  world.broadphase = new CANNON.NaiveBroadphase();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {
  requestAnimationFrame(animate);

  var dt = clock.getDelta();

  updates.forEach(update => {
    update(dt)
  })

  if (window.camera && window.role.gltf) {
    camera.position.set(
      role.gltf.scene.position.x,
      30,
      role.gltf.scene.position.z + 30,
    )
    // camera.lookAt(role.gltf.scene.position)
  }

  cannonDebugRenderer.update()
  world.step(fixedTimeStep, dt)
  renderer.render(scene, camera);

  stats.update();

}
