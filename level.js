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
        // './model/level/level.nav.glb',
        function (gltf) {
          s.gltf = gltf
          s.mesh = s.gltf.scene.children[0]

          // const geometry = new THREE.ConeBufferGeometry(5, 10, 5)
          const geometry = new THREE.ConeGeometry(5, 10, 5)
          const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
          const cone = new THREE.Mesh(geometry, material)
          s.mesh = cone
          s.mesh.visible = false
          // return;

          scene.add(s.mesh)

          // s.mesh.geometry.computeVertexNormals()

          let vertices = []
          geometry.vertices.forEach((vertex) => {
            vertices.push(new CANNON.Vec3(vertex.x, vertex.y, vertex.z))
          })
          let faces = []
          geometry.faces.forEach((face) => {
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
          s.body.name = 'level'
          s.body.addShape(shape)
          s.body.position.set(30, 5, 0)
          // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
          // s.body.addEventListener('collide', function (event) {
          //   console.log('collide Level')
          // })
          world.addBody(s.body)

          s.mesh.position.copy(s.body.position)

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
