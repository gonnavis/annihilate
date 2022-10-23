import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class RoleControls {
  // TODO: RoleControls should update before role, otherwise role.mesh.position will delay one frame after role.body.position.
  constructor(role) {
    this.role = role
    window.role = role ///todo

    updates.push(this)

    window.allKey = {}
    this.holdKey = {}
    window.tickKey = {}
    this.seqKey = [] // sequentialKey
    this.timeoutSeqKey = null
    // this.actkey = ''
    this.prevTime = 0

    window.addEventListener('keydown', (event) => {
      // console.log('repeat', event.repeat, event.code)

      // if (event.repeat) return
      // console.log(event.key, event.code, event.keyCode)

      if (this.holdKey[event.code]) return // Prevent: keyD -> keyJ long press -> keyD up, cause double attack bug.
      // event.prepeat & if (event.code === this.actkey) return, both not work.

      window.allKey[event.code] = true
      this.holdKey[event.code] = true
      window.tickKey[event.code] = true
      console.log('set tickKey')

      clearTimeout(this.timeoutSeqKey)
      if (false && this.role.service.state.matches('block')) {
        let now = performance.now()
        // console.log(now - this.prevTime)
        this.prevTime = now
        if (event.code === 'KeyJ' || event.code === 'Numpad4') {
          if (this.seqKey.length === 2 && (this.seqKey[0] === 'KeyS' || this.seqKey[0] === 'ArrowDown') && (this.seqKey[1] === 'KeyD' || this.seqKey[1] === 'ArrowRight')) {
            // console.log('-- hadouken')
            // this.role.service.send('hadouken')
          } else if (this.seqKey.length === 3 && (this.seqKey[0] === 'KeyD' || this.seqKey[0] === 'ArrowRight') && (this.seqKey[1] === 'KeyS' || this.seqKey[1] === 'ArrowDown') && (this.seqKey[2] === 'KeyD' || this.seqKey[2] === 'ArrowRight')) {
            // console.log('-- shoryuken')
            // this.role.service.send('shoryuken')
          }
          this.seqKey.length = 0
        } else if (event.code === 'KeyK' || event.code === 'Numpad5') {
          if (this.seqKey.length === 2 && (this.seqKey[0] === 'KeyS' || this.seqKey[0] === 'ArrowDown') && (this.seqKey[1] === 'KeyA' || this.seqKey[1] === 'ArrowLeft')) {
            // console.log('-- ajejebloken')
            // this.role.service.send('ajejebloken')
          }
          this.seqKey.length = 0
        } else {
          this.seqKey.push(event.code)
        }
        this.timeoutSeqKey = setTimeout(() => {
          this.seqKey.length = 0
        }, 150)
        // console.log(this.seqKey)
      }

      // if (!this.gltf) return
      // if (event.code === this.actkey) return
      // this.actkey = event.code

      // console.log(Object.fromEntries(Object.entries(this.holdKey).filter((n) => n[1])))
      // console.log(
      //   Object.entries(this.holdKey)
      //     .filter((n) => n[1])
      //     .map((n) => n[0])
      // )
    })
    window.addEventListener('keyup', (event) => {
      // console.log(event)
      window.allKey[event.code] = false
      this.holdKey[event.code] = false

      switch (event.code) {
        case 'KeyJ':
        case 'Numpad4':
          // this.role.service.send('keyJUp')
          break
        case 'KeyU':
        case 'Numpad7':
          // this.role.service.send('keyUUp')
          break
        case 'KeyL':
        case 'Numpad6':
          // this.role.service.send('keyLUp')
          this.seqKey.length = 0
          break
        case 'KeyO':
        case 'Numpad9':
          // this.role.service.send('keyOUp')
          this.seqKey.length = 0
          break
        // case 'KeyA':
        // case 'ArrowLeft':
        //   console.log('keyAUp')
        //   // this.role.body.velocity.set(0, 0, 0)
        //   break
        // case 'KeyD':
        // case 'ArrowRight':
        //   console.log('keyDUp')
        //   // this.role.body.velocity.set(0, 0, 0)
        //   break
      }
      // this.actkey = ''
    })
  }

  update(dt) {
    // console.log('update')
    // if (this.role.service.state.matches('loading')) return

    if ((window.tickKey.KeyJ || window.tickKey.Numpad4) && (window.tickKey.KeyK || window.tickKey.Numpad5) && (window.tickKey.KeyL || window.tickKey.Numpad6)) {
      // console.log('pop')
      this.role.pop?.pop() // Whether need use: this.role.service.send('pop') ?
    } else {
      switch (
        Object.keys(window.tickKey)[0] // note: The order of Object.keys may not by added order, but should no big problem.
      ) {
        case 'KeyJ':
        case 'Numpad4':
          // this.role.service.send('attack')
          // console.log('---keydown J')
          break
        case 'KeyK':
        case 'Numpad5':
          // this.role.service.send('jump')
          // this.role.jump()
          break
        case 'KeyI':
        case 'Numpad8':
          // this.role.service.send('dash')
          break
        case 'KeyU':
        case 'Numpad7':
          // this.role.service.send('bash')
          break
        case 'KeyL':
        case 'Numpad6':
          // this.role.service.send('block')
          break
        case 'KeyO':
        case 'Numpad9':
          // this.role.service.send('launch')
          break
      }
    }

    this.role.direction.set(0, 0)
    if (this.holdKey.KeyW || this.holdKey.ArrowUp) this.role.direction.add(new THREE.Vector2(0, -1)) // todo: performance.
    if (this.holdKey.KeyS || this.holdKey.ArrowDown) this.role.direction.add(new THREE.Vector2(0, 1))
    if (this.holdKey.KeyA || this.holdKey.ArrowLeft) this.role.direction.add(new THREE.Vector2(-1, 0))
    if (this.holdKey.KeyD || this.holdKey.ArrowRight) this.role.direction.add(new THREE.Vector2(1, 0))
    this.role.direction.normalize().multiplyScalar(this.role.speed * dt * 60)
    // console.log(this.role.direction)
    let directionLengthSq = this.role.direction.lengthSq()

    if (false && this.role.service.state.hasTag('canMove')) {
      if (directionLengthSq > 0) {
        // change facing
        this.role.facing.copy(this.role.direction)
      } // end if here to set velocity 0 when stop, but because linearDamping not 1, will no obvious effect.
      this.role.mesh.rotation.y = -this.role.facing.angle() + Math.PI / 2

      // move
      // console.log(this.role.direction)

      // move 1: change position
      // Has sink into wall & after stop bounce off wall problem. TODO: Stop & reset position if collide.
      // Has can't adjust velocity problem. For example: Jump to one direction, in the air use roleControls change position to reverse direction, if stop control, role will continue move by initial velocity to initial direction.
      // if (window.role === robot) debugger
      this.role.body.position.x += this.role.direction.x
      this.role.body.position.z += this.role.direction.y

      // // move 2.1: change velocity delta
      // // Has start very slow, then very fast problem.
      // let velocityScale = 5
      // this.role.body.velocity.x += this.role.direction.x * velocityScale
      // this.role.body.velocity.z += this.role.direction.y * velocityScale

      // // move 2.1: change velocity absolute
      // // Has climb hill not slow down problem.
      // // Has break ordinary velocity problem.
      // // May has move slow when collide/slide wall by friction problem.
      // let velocityScale = 70
      // this.role.body.velocity.x = this.role.direction.x * velocityScale
      // this.role.body.velocity.z = this.role.direction.y * velocityScale

      // console.log(this.role.direction)

      // // move 3: apply force
      // // Has start very slow, then very fast problem.
      // let forceScale = 10000 * 3
      // let force = new CANNON.Vec3(this.role.direction.x * forceScale, 0, this.role.direction.y * forceScale)
      // this.role.body.applyForce(force)

      // // Related reading: https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/CharacterControllers.html
      // // Why cannonjs such powerful that can change the position of dynamic body directly?

      // } // end if here to not set velocity 0 when stop.
    }

    // state change must after ```if (this.role.service.state.hasTag('canMove')){ ... real move codes ... }```, for move by velocity stop problem reason.
    if (directionLengthSq > 0) {
      // this.role.service.send('run')
    } else {
      // console.log('111111111111111')
      // this.role.service.send('stop')
    }

    // if (this.holdKey.KeyJ) {
    //   // code here run after animation finished event, in one tick.
    //   this.role.service.send('keyJDown')
    //   // console.log('whirlwind')
    // } else {
    //   this.role.service.send('keyJUp')
    // }

    // restore
    window.tickKey = {}
    console.log('clear tickKey')
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
