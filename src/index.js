import * as THREE from '../lib/three.js/build/three.module.js'
window.THREE = THREE
import { OrbitControls } from '../lib/three.js/examples/jsm/controls/OrbitControls.js'
import { MeshCutter } from './MeshCutter.js'

window.container = null
window.stats = null
window.camera = null
window.scene = null
window.renderer = null
init_three()
requestAnimationFrame(animate)

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 370)
  camera.position.set(3, 5, 7)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)

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
  // gridHelper.position.y = 0.037
  gridHelper.material.opacity = 0.2
  gridHelper.material.transparent = true
  // scene.add(gridHelper)

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
  // stats = new Stats()
  // container.appendChild(stats.dom)

  window.controls = new OrbitControls(camera, renderer.domElement)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// //

function animate(time) {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)

  // stats.update()
}

window.meshCutter = new MeshCutter()

// const geometry = new THREE.ConeGeometry(.5, 1, 3)
// // const geometry = new THREE.BoxGeometry()
// // const geometry = new THREE.PlaneGeometry()
// // const geometry = new THREE.CylinderGeometry()
// const geometry = new THREE.TorusGeometry( 1, .4, 3, 3 );
// // const geometry = new THREE.TorusKnotGeometry()
// geometry.scale(0.5, 0.5, 0.5)
// geometry.rotateX(Math.PI/2)
// geometry.rotateY(Math.PI/2)

const shape = new THREE.Shape();
shape.moveTo( 0,0 );
shape.lineTo( .5, .5 );
shape.lineTo( 0, -1 );
shape.lineTo( -.5, .5 );
shape.lineTo( 0, 0 );
const extrudeSettings = {
  curveSegments: 1,
	steps: 1,
	depth: 1,
	bevelEnabled: false,
};
const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
geometry.translate(0, 0, -.5)

// const positions = [

// ]
// const geometry = new THREE.BufferGeometry()
// geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

// const geometry = indexedGeometry.toNonIndexed()
// geometry.clearGroups()

const material = new THREE.MeshStandardMaterial({
  // const material = new THREE.MeshBasicMaterial({
  // color: 'red',
  wireframe: true,
  side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load('./image/uv_grid_opengl.jpg'),
})
const mesh = new THREE.Mesh(geometry, material)
window.scene.add(mesh)
// mesh.position.y = 1
// mesh.position.z = -6
// mesh.rotation.y = Math.PI/4
mesh.updateMatrixWorld()
window.box = mesh

if (true) {
  window.constant = 0
  // window.constant = (Math.random() - 0.5) * 1
  // window.constant = .5

  // window.plane = new THREE.Plane(new THREE.Vector3(1,0,0).normalize(), constant)
  // window.plane = new THREE.Plane(new THREE.Vector3(0,1,0).normalize(), constant)
  window.plane = new THREE.Plane(new THREE.Vector3(0,0,1).normalize(), constant)
  // window.plane = new THREE.Plane(new THREE.Vector3(1,0,1).normalize(), constant)
  // window.plane = new THREE.Plane(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), constant)

  setTimeout(() => {
    window.output = window.meshCutter.cutByPlane(window.box, window.plane)
    if (window.output.object1) {
      window.scene.add(window.output.object1)
      window.output.object1.position.x += -1 / 1
      window.output.object1.position.z += 2 / 1
      // window.output.object1.updateMatrixWorld()
    }
    if (window.output.object2) {
      window.scene.add(window.output.object2)
      window.output.object2.position.x += 1 / 1
      window.output.object2.position.z += 2 / 1
      // window.output.object2.updateMatrixWorld()
    }
    // window.box.visible = false
    window.box.position.z += -1 / 1
  }, 1000)
}
