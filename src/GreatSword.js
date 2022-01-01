import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class GreatSword extends Attacker {
  constructor() {
    super()

    this.isCollideShield = false
    this.isCollideBody = false
    this.collideShieldEvent = null
    this.collideBodyEvent = null

    // body

    this.body.collisionFilterGroup = g.GROUP_ROLE_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ENEMY | g.GROUP_ENEMY_ATTACKER | g.GROUP_ENEMY_SHIELD

    let shape = new CANNON.Box(new CANNON.Vec3(0.19, 0.19, 0.74))
    // let shape = new CANNON.Box(new CANNON.Vec3(0.5 * 3, 0.5 * 3, 2 * 3))
    this.body.addShape(shape)
    world.addBody(this.body)
  }

  update() {
    // console.log('update')
    // console.log(this.collidings.length)

    // NOTE: update() run one tick after collide(). Keep this order, do not run update() after world.step() in index.js.

    if (this.owner.gltf) {
      let tempVec3 = new THREE.Vector3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }

    // TODO: update() run one tick after collide(), not good. But do not run update() after world.step() in index.js.
    // TODO: Check collideShieldEvent & collideBodyEvent's contact position to judge if real blocked.
    // if (this.isCollideShield && (!this.collideBodyEvent || this.collideShieldEvent.body === this.collideBodyEvent.body)) { // TODO: Prevent shield help other enemies block.
    if (this.isCollideShield) {
      // debugger
      let event = this.collideShieldEvent
      event.body.belongTo.owner.service.send('blocked')
    } else if (this.isCollideBody) {
      // debugger
      let event = this.collideBodyEvent
      // console.log('enemy body')
      if (this.owner.service.state.hasTag('knockDown')) {
        event.body.belongTo.knockDown(event)
        if (this.owner.service.state.matches('jumpBash')) {
          event.body.velocity.y = -event.body.position.y * 10
        }
      } else {
        event.body.belongTo.hit(event)
        // console.log(event.contact)
        // debugger

        // if (this.owner.service.state.matches('launch')) {
        if (this.owner.service.state.hasTag('canLaunch') && !event.body.belongTo.isAir && !event.body.belongTo.isMassive) {
          // TODO: If enemy not real hit, such as paladin blocked, do not launch?
          // console.log(111)
          // event.body.velocity.y += 30
          // NOTE: Direct change position instead of velocity, to prevent friction between enemy herd cause not lift.
          gsap.to(event.body.position, {
            duration: 0.3,
            y: event.body.position.y + 3.7,
            onComplete: () => {
              // let posY = event.body.position.y
              // gsap.to(event.body.position, {
              //   duration: 0.3,
              //   y: posY,
              // })
              // event.body.velocity.y = 0 // Prevent too fast drop. Because cannonjs will accumulate drop velocity when direct change position.
              // event.body.velocity.y = 3.7
              event.body.velocity.y = 0
            },
          })
          event.body.belongTo.isAir = true // todo: refactor.
          // console.log('set isAir true')
        }
      }
    }

    // restore
    this.isCollideShield = false
    this.isCollideBody = false
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // console.log('greatSword collide', event.body.belongTo)
    // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
    // console.log(1111111111)
    if (this.owner.service.state.hasTag('canDamage')) {
      // console.log('collide')
      // debugger

      // debugger
      if (event.body.belongTo.isShield) {
        // console.log('shield')
        this.isCollideShield = true
        this.collideShieldEvent = { ...event }
      } else if (event.body.belongTo.isEnemy) {
        // console.log('body')
        this.isCollideBody = true
        this.collideBodyEvent = { ...event }
      }
    }
    // }
  }
}

export { GreatSword }
