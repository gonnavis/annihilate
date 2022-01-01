import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Shield {
  constructor() {
    this.isShield = true
    updates.push(this)
    this.owner = null

    this.is_hit = false
    this.collisionFilterGroup = g.GROUP_ENEMY_SHIELD

    // body

    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.DYNAMIC,
      collisionResponse: false,
      //
      collisionFilterGroup: this.collisionFilterGroup,
      collisionFilterMask: g.GROUP_ROLE_ATTACKER,
    })
    this.body.belongTo = this

    let shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.11, 0.37))
    // let shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.11, 0.9))
    // let shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.11, 0.9))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('collide', (event) => {
    //   if (event.body.belongTo?.owner?.service.state.hasTag('canDamage')) {
    //     console.log('blocked')
    //     this.owner.service.send('blocked')
    //   }
    //     if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(paladin.service.state.matches)) {
    //       window.robots.forEach((robot) => {
    //         if (event.body === robot.body) {
    //           robot.hit() // todo: refactor: do not check paladin's state at here.
    //         }
    //       })
    //     }
    // })
  }

  update() {
    if (paladin.gltf) {
      let tempVec3 = new THREE.Vector3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // paladin.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }
}

export { Shield }
