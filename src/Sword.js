import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class Sword extends Attacker {
  constructor() {
    super()

    this.tmpVec3 = new THREE.Vector3()
    this.tmpQuat = new THREE.Quaternion()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE

    let shape = new CANNON.Box(new CANNON.Vec3(0.11, 0.11, 0.45))
    this.body.addShape(shape)
    world.addBody(this.body)
  }

  update() {
    if (this.owner.gltf) {
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(this.tmpVec3)
      this.owner.swordDelegate.getWorldPosition(this.tmpVec3)
      this.owner.swordDelegate.getWorldQuaternion(this.tmpQuat)
      this.body.position.copy(this.tmpVec3)
      this.body.quaternion.copy(this.tmpQuat)
    }
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
    if (this.owner.service.state.hasTag('canDamage')) {
      event.body.belongTo.hit(event)
    }
    // }
  }
}

export { Sword }
