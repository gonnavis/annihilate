import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Splash } from './Splash.js'

class GreatSword {
  constructor() {
    this.isWeapon = true

    updates.push(this)

    this.owner = null

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.DYNAMIC,
      collisionResponse: false,
      // NOTE:
      // Set mass 0, so not affected by gravity.
      // Set type DYNAMIC, so not default to Static, so can trigger `collide` event.
      // Set collisionResponse false, so can go trough other bodies, not bounce off.
      //
      // Above are all about getting `contact` information which only exist in `collide` event.
      // If not need `contact` information, simply use STATIC or DYNAMIC with `beginContact` event is OK.
      //
      // TODO: collide trigger more times than beginContact? How to check if first collide?
      collisionFilterGroup: g.GROUP_ROLE_WEAPON,
      collisionFilterMask: g.GROUP_ENEMY | g.GROUP_ENEMY_WEAPON,
    })
    this.body.belongTo = this
    let shape = new CANNON.Box(new CANNON.Vec3(0.19, 0.19, 0.74))
    // let shape = new CANNON.Box(new CANNON.Vec3(0.5 * 3, 0.5 * 3, 2 * 3))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('beginContact', (e) => {
    this.body.addEventListener('collide', (e) => {
      // console.log('greatSword collide', e.body.belongTo)
      // if (e.body.belongTo?.isEnemy === true && e.body.belongTo !== this.owner) {
      // console.log(1111111111)
      if (this.owner.service.state.hasTag('canDamage')) {
        // debugger
        if (e.body.belongTo.isEnemy) {
          if (this.owner.service.state.hasTag('knockDown')) {
            e.body.belongTo.knockDown()
            new Splash(e)
            if (this.owner.service.state.matches('jumpBash')) {
              e.body.velocity.y = -e.body.position.y * 10
            }
          } else {
            e.body.belongTo.hit()
            new Splash(e)
            // console.log(e.contact)

            // if (this.owner.service.state.matches('launch')) {
            if (this.owner.service.state.hasTag('canLaunch') && !e.body.belongTo.isAir) {
              // console.log(111)
              // e.body.velocity.y += 30
              // NOTE: Direct change position instead of velocity, to prevent friction between enemy herd cause not lift.
              gsap.to(e.body.position, {
                duration: 0.3,
                y: e.body.position.y + 3.7,
                onComplete: () => {
                  // let posY = e.body.position.y
                  // gsap.to(e.body.position, {
                  //   duration: 0.3,
                  //   y: posY,
                  // })
                  // e.body.velocity.y = 0 // Prevent too fast drop. Because cannonjs will accumulate drop velocity when direct change position.
                  // e.body.velocity.y = 3.7
                  e.body.velocity.y = 0
                },
              })
              e.body.belongTo.isAir = true // todo: refactor.
              // console.log('set isAir true')
            }
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
