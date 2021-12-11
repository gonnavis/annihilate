import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { geometryToShape } from '../lib/cannon-es/three-conversion-utils_my.js'

class TorusKnot {
  constructor({ position }) {
    this.isGround = true

    // mesh

    const bufferGeometry = new THREE.TorusKnotGeometry()
    // let scale = 1
    // bufferGeometry.scale(scale, scale, scale)
    const material = new THREE.MeshPhongMaterial({ color: 0x555555 })
    this.mesh = new THREE.Mesh(bufferGeometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    // cannon

    const shape = geometryToShape(bufferGeometry)

    this.body = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    world.addBody(this.body)

    this.mesh.position.copy(position)
    this.body.position.copy(position)

    window.updates.push(this)
  }

  update(dt, time) {
    this.mesh.position.copy(this.body.position)
    this.mesh.quaternion.copy(this.body.quaternion)
  }
}

export { TorusKnot }
