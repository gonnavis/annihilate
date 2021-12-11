import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Geometry } from '../lib/three.js/examples/jsm/deprecated/Geometry.js'
// import { mergeVertices } from '../lib/three.js/examples/jsm/utils/BufferGeometryUtils.js'
class Hill {
  constructor() {
    this.isGround = true

    // let pos = new THREE.Vector3(-0, 0, -0)
    let pos = new THREE.Vector3(-30, 0, -37)

    const bufferGeometry = new THREE.ConeGeometry(45, 30, 8)
    // let bufferGeometry = new THREE.BoxGeometry(6, 6, 6)
    // bufferGeometry = mergeVertices(bufferGeometry, 2)
    // bufferGeometry.computeVertexNormals()
    const geometry = new Geometry().fromBufferGeometry(bufferGeometry)
    geometry.mergeVertices()
    const material = new THREE.MeshPhongMaterial({ color: 0x555555 })
    const cone = new THREE.Mesh(bufferGeometry, material)
    this.mesh = cone
    this.mesh.receiveShadow = true
    scene.add(this.mesh)
    // console.log(bufferGeometry)
    // console.log(geometry)

    let vertices = []
    geometry.vertices.forEach((vertex) => {
      vertices.push(new CANNON.Vec3(vertex.x, vertex.y, vertex.z))
    })
    // for (let i = 0; i < bufferGeometry.attributes.position.array.length; ) {
    //   let x = bufferGeometry.attributes.position.array[i++]
    //   let y = bufferGeometry.attributes.position.array[i++]
    //   let z = bufferGeometry.attributes.position.array[i++]
    //   vertices.push(new CANNON.Vec3(x, y, z))
    // }
    // console.log(vertices)

    let faces = []
    geometry.faces.forEach((face) => {
      faces.push([face.a, face.b, face.c])
    })
    // for (let i = 0; i < bufferGeometry.index.array.length; ) {
    //   let a = bufferGeometry.index.array[i++]
    //   let b = bufferGeometry.index.array[i++]
    //   let c = bufferGeometry.index.array[i++]
    //   faces.push([a, b, c])
    // }
    // console.log(faces)

    // console.log(vertices)
    // console.log(faces)
    let shape = new CANNON.ConvexPolyhedron({ vertices, faces })
    this.body = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    world.addBody(this.body)

    this.mesh.position.copy(pos)
    this.body.position.copy(pos)
  }
}

export { Hill }
