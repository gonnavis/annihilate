import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class HandKnife extends Attacker {
  constructor() {
    super()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE

    let shape = new CANNON.Box(new CANNON.Vec3(0.11, 0.11, 0.45))
    this.body.addShape(shape)
    world.addBody(this.body)
  }

  update() {
    if (this.owner.gltf) {
      let tempVec3 = new THREE.Vector3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      this.owner.rightEquipDelegate.getWorldPosition(tempVec3)
      this.owner.rightEquipDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // if (event.body.belongTo?.isRole === true && event.body.belongTo !== this.owner) {
    if (this.owner.service.state.hasTag('canDamage')) {
      event.body.belongTo.hit(event) // TODO: Sometimes still hit twice after check isBeginCollide.
    }
    // }
  }
}

export { HandKnife }
