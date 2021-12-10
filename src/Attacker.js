import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Splash } from './Splash.js'

class Attacker {
  constructor() {
    this.isAttacker = true

    updates.push(this)

    this.owner = null

    // this.is_hit = false
    this.collidings = []

    // default to GreatSword settings.
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
      // TODO: collide trigger more times than beginContact? How to check if first collide? Yes, so need to filter collide events. Or use beginContact for real hit, collide for splash.
      collisionFilterGroup: g.GROUP_ROLE_WEAPON, // !!! replace in subClass
      collisionFilterMask: g.GROUP_ENEMY | g.GROUP_ENEMY_WEAPON, // !!! replace in subClass
    })
    this.body.belongTo = this

    // this.body.addEventListener('beginContact', (event) => {
    //   if (this.owner.service.state.hasTag('canDamage')) {
    //     console.log('beginContact')
    //   }
    // })

    this.body.addEventListener('collide', (event) => {
      let isBeginCollide = !this.collidings.includes(event.body)
      if (isBeginCollide) this.collidings.push(event.body)

      this.collide(event, isBeginCollide)
    })

    this.body.addEventListener('endContact', (event) => {
      let index = this.collidings.indexOf(event.body)
      this.collidings.splice(index, 1)

      this.endContact(event)

      // console.log('endContact')
      // if (this.owner.service.state.hasTag('canDamage')) {
      //   console.log('endContact')
      // }
    })
  }

  update() {
    // console.log(this.collidings.length)
  }

  collide(event, isBeginCollide) {}

  endContact(event) {}
}

export { Attacker }
