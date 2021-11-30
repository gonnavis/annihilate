import { g } from './global.js'

import * as THREE from './lib/three.js/build/three.module.js'
class GreatSword {
  constructor() {
    this.isWeapon = true
    
    updates.push(this)

    this.owner = null

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_ROLE_WEAPON,
      collisionFilterMask: g.GROUP_ENEMY,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 2))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('collide', (e) => {
    this.body.addEventListener('beginContact', (e) => {
      // console.log('greatSword collide', e.body.belongTo)
      // if (e.body.belongTo?.isEnemy === true && e.body.belongTo !== this.owner) {
      // console.log(1111111111)
      if (this.owner.service.state.hasTag('canDamage')) {
        if (this.owner.service.state.hasTag('knockDown')) {
          e.body.belongTo.knockDown()
        } else {
          e.body.belongTo.hit()

          // if (this.owner.service.state.matches('launch')) {
          if (this.owner.service.state.hasTag('canLaunch') && !e.body.belongTo.isAir) {
            e.body.velocity.y += 25
            e.body.belongTo.isAir = true // todo: refactor.
            console.log('set isAir true')
          }
        }
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

export { GreatSword }
