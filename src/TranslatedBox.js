import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { geometryToShape } from '../lib/cannon-es/three-conversion-utils_my.js'

class TranslatedBox {
  constructor({ position }) {
    this.isGround = true

    let width = 5
    let height = 1
    let depth = 0.5

    // mesh

    const bufferGeometry = new THREE.BoxGeometry(width, height, depth)

    // let scale = 1
    // bufferGeometry.scale(scale, scale, scale)

    bufferGeometry.translate(width / 2, 0, 0) // mark

    const material = new THREE.MeshPhongMaterial({ color: 0x555555 })
    this.mesh = new THREE.Mesh(bufferGeometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    // cannon

    // const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
    const shape = geometryToShape(bufferGeometry)

    this.body = new CANNON.Body({
      mass: 0,
      // mass: 10,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this

    this.body.addShape(shape, new CANNON.Vec3(width / 2, 0, 0)) // mark
    // https://stackoverflow.com/questions/42599326/how-to-group-object-bodies-parent-child-in-cannon-js
    // https://github.com/schteppe/cannon.js/issues/232

    world.addBody(this.body)

    this.mesh.position.copy(position)
    this.body.position.copy(position)

    window.updates.push(this)
  }

  update(dt, time) {
    this.body.quaternion.setFromEuler(0, time * 0.001, 0)

    this.mesh.position.copy(this.body.position)
    this.mesh.quaternion.copy(this.body.quaternion)
  }
}

export { TranslatedBox }
