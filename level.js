import { threeToCannon, ShapeType } from './lib/three-to-cannon.modern_my.js'
class Level {
  constructor() {
    let s = this
  }

  load() {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/level/level.glb',
        function (gltf) {
          s.gltf = gltf
          scene.add(s.gltf.scene)

          // s.gltf.scene.children[0].geometry.computeVertexNormals()

          // let shape = threeToCannon(s.gltf.scene.children[0]).shape
          // let shape = threeToCannon(s.gltf.scene.children[0], { type: ShapeType.HULL }).shape ///todo: Why no faceNormals, and cause error? three-to-connon not input normal info to new ConvexPolyhedron()?
          let shape = threeToCannon(s.gltf.scene.children[0], {type: ShapeType.MESH}).shape ///todo: not recommended.
          // let shape = new CANNON.Plane()
          s.shape = shape
          s.body = new CANNON.Body({
            mass: 0,
          })
          s.body.addShape(shape)
          s.body.position.set(30, 0, 0)
          // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
          // s.body.addEventListener('collide', function (event) {
          //   console.log('collide Level')
          // })
          world.addBody(s.body)

          s.gltf.scene.position.copy(s.body.position)

          resolve()
        },
        undefined,
        function (e) {
          console.error(e)
          reject()
        }
      )
    })
  }
}

export { Level }
