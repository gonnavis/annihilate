import { g } from './global.js'
class Hill {
  constructor() {
    let pos = new THREE.Vector3(-80, 0, -100)

    const geometry = new THREE.ConeGeometry(120, 80, 8)
    const material = new THREE.MeshPhongMaterial({ color: 0x555555 })
    const cone = new THREE.Mesh(geometry, material)
    this.mesh = cone
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

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
    this.body = new CANNON.Body({
      mass: 0,
    })
    this.body.addShape(shape)
    world.addBody(this.body)

    this.mesh.position.copy(pos)
    this.body.position.copy(pos)
  }
}

export { Hill }
