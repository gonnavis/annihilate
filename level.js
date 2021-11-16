import { threeToCannon, ShapeType } from './lib/three-to-cannon.modern_my.js'
class Level {
  constructor() {
    let s = this
  }

  load(callback) {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        // './model/level/level.glb',
        './model/level/level.nav.glb',
        function (gltf) {
          s.gltf = gltf
          s.mesh = s.gltf.scene.children[0]
          // s.mesh.material = new THREE.MeshPhongMaterial()
          s.mesh.geometry.computeVertexNormals() // for level.nav can receiveShadow.
          s.mesh.material.shadowSide = THREE.FrontSide // need used with `light.shadow.bias` ( plane's shadow )

          // const geometry = new THREE.ConeBufferGeometry(5, 10, 5)
          // const geometry = new THREE.ConeGeometry(5, 10, 5)
          // const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
          // const cone = new THREE.Mesh(geometry, material)
          // s.mesh = cone
          // return;

          // s.mesh.visible = false

          // s.mesh.rotation.y = Math.PI / 2
          s.mesh.scale.setScalar(10)
          s.mesh.castShadow = true
          s.mesh.receiveShadow = true
          scene.add(s.mesh)

          // s.mesh.geometry.computeVertexNormals()

          let tempGeometry = new THREE.Geometry().fromBufferGeometry(s.mesh.geometry)
          s.tempGeometry = tempGeometry
          tempGeometry.rotateY(s.mesh.rotation.y)
          tempGeometry.scale(10, 10, 10)
          tempGeometry.computeVertexNormals()
          tempGeometry.computeFaceNormals()

          let vertices = []
          tempGeometry.vertices.forEach((vertex) => {
            vertices.push(new CANNON.Vec3(vertex.x, vertex.y, vertex.z))
          })
          let faces = []
          tempGeometry.faces.forEach((face) => {
            faces.push([face.a, face.b, face.c])
          })
          // console.log(vertices)
          // console.log(faces)
          let shape = new CANNON.ConvexPolyhedron({ vertices, faces })

          // let shape = threeToCannon(s.mesh).shape
          // let shape = threeToCannon(s.mesh, { type: ShapeType.HULL }).shape ///todo: Why no faceNormals, and cause error? three-to-connon not input normal info to new ConvexPolyhedron()?
          // let shape = threeToCannon(s.mesh, { type: ShapeType.MESH }).shape ///todo: not recommended.
          // let shape = new CANNON.Plane()
          s.shape = shape
          s.body = new CANNON.Body({
            mass: 0,
          })
          s.body.addShape(shape)
          s.body.position.set(0, 0, 0)
          // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
          // s.body.addEventListener('collide', function (event) {
          //   console.log('collide Level')
          // })
          world.addBody(s.body)

          s.mesh.position.copy(s.body.position)

          resolve()
        },
        callback,
        function (e) {
          console.error(e)
          reject()
        }
      )
    })
  }
}

export { Level }
