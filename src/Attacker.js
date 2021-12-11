import { g } from './global.js'

// import * as THREE from '../lib/three.js/build/three.module.js'
// import { Splash } from './Splash.js'

class Attacker {
  constructor({ num = 1 } = {}) {
    this.isAttacker = true

    updates.push(this)

    this.owner = null
    this.num = num
    this.bodies = []

    for (let i = 0; i < this.num; i++) {
      // default to GreatSword settings.
      let body = new CANNON.Body({
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
        collisionFilterGroup: g.GROUP_ROLE_ATTACKER, // !!! replace in subClass
        collisionFilterMask: g.GROUP_ENEMY | g.GROUP_ENEMY_ATTACKER | g.GROUP_ENEMY_SHIELD, // !!! replace in subClass
      })
      body.belongTo = this
      this.bodies.push(body)

      // this.is_hit = false
      body.collidings = []

      // this.body.addEventListener('beginContact', (event) => {
      //   if (this.owner.service.state.hasTag('canDamage')) {
      //     console.log('beginContact')
      //   }
      // })

      body.addEventListener('collide', (event) => {
        let isBeginCollide = !body.collidings.includes(event.body)
        if (isBeginCollide) body.collidings.push(event.body)

        this.collide(event, isBeginCollide)
      })

      body.addEventListener('endContact', (event) => {
        let index = body.collidings.indexOf(event.body)
        body.collidings.splice(index, 1)

        this.endContact(event)

        // console.log('endContact')
        // if (this.owner.service.state.hasTag('canDamage')) {
        //   console.log('endContact')
        // }
      })
    }

    this.body = this.bodies[0]
  }

  update() {
    // console.log(this.body.collidings.length)
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return
  }

  endContact(event) {}
}

export { Attacker }
