import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { threeToCannon, ShapeType } from '../lib/three-to-cannon.modern_my.js'
class Level {
  constructor() {}

  load() {
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/level/level.glb',
        // './model/level/level.nav.glb',
        (gltf) => {
          this.gltf = gltf
          this.mesh = this.mesh.children[0]

          // const geometry = new THREE.ConeBufferGeometry(5, 10, 5)
          const geometry = new THREE.ConeGeometry(5, 10, 5)
          const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
          const cone = new THREE.Mesh(geometry, material)
          this.mesh = cone
          this.mesh.visible = false
          // return;

          scene.add(this.mesh)

          // this.mesh.geometry.computeVertexNormals()

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

          // let shape = threeToCannon(this.mesh).shape
          // let shape = threeToCannon(this.mesh, { type: ShapeType.HULL }).shape ///todo: Why no faceNormals, and cause error? three-to-connon not input normal info to new ConvexPolyhedron()?
          // let shape = threeToCannon(this.mesh, { type: ShapeType.MESH }).shape ///todo: not recommended.
          // let shape = new CANNON.Plane()
          this.shape = shape
          this.body = new CANNON.Body({
            mass: 0,
          })
          this.body.addShape(shape)
          this.body.position.set(30, 5, 0)
          // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
          // this.body.addEventListener('collide', (event) => {
          //   console.log('collide Level')
          // })
          world.addBody(this.body)

          this.mesh.position.copy(this.body.position)

          resolve()
        },
        undefined,
        (event) => {
          console.error(event)
          reject()
        }
      )
    })
  }
}

export { Level }
