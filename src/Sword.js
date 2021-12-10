import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Splash } from './Splash.js'

class Sword {
  constructor() {
    this.isWeapon = true
    updates.push(this)

    this.owner = null

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.DYNAMIC,
      collisionResponse: false,
      // NOTE: See GreatSword.js NOTE.
      collisionFilterGroup: g.GROUP_ROLE_WEAPON,
      collisionFilterMask: g.GROUP_ENEMY,
    })
    this.body.belongTo = this
    let shape = new CANNON.Box(new CANNON.Vec3(0.11, 0.11, 0.45))
    this.body.addShape(shape)
    world.addBody(this.body)

    this.body.addEventListener('collide', (event) => {
      // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
      if (this.owner.service.state.hasTag('canDamage')) {
        event.body.belongTo.hit()
        new Splash(event)
      }
      // }
    })
  }

  update() {
    if (this.owner.gltf) {
      let tempVec3 = vec3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }
}

export { Sword }
