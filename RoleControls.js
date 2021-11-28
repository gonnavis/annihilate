import { g } from './global.js'

import * as THREE from './lib/three.js/build/three.module.js'
class RoleControls {
  constructor(role) {
    this.role = role
    window.role = role ///todo

    updates.push(this)

    this.holdKey = {}
    this.tickKey = {}
    this.seqKey = [] // sequentialKey
    this.timeoutSeqKey = null
    // this.actkey = ''

    window.addEventListener('keydown', (e) => {
      // console.log('repeat', e.repeat, e.code)

      // if (e.repeat) return
      // console.log(e.key, e.code, e.keyCode)

      if (this.holdKey[e.code]) return // Prevent: keyD -> keyJ long press -> keyD up, cause double attack bug.
      // e.prepeat & if (e.code === this.actkey) return, both not work.

      this.holdKey[e.code] = true
      this.tickKey[e.code] = true

      // console.log(performance.now())
      clearTimeout(this.timeoutSeqKey)
      if (this.role.service.state.matches('block')) {
        if (e.code === 'KeyJ') {
          if (this.seqKey.length === 2 && this.seqKey[0] === 'KeyS' && this.seqKey[1] === 'KeyD') {
            console.log('hadouken')
            this.role.service.send('hadouken')
          } else if (this.seqKey.length === 3 && this.seqKey[0] === 'KeyD' && this.seqKey[1] === 'KeyS' && this.seqKey[2] === 'KeyD') {
            console.log('shoryuken')
            this.role.service.send('shoryuken')
          }
          this.seqKey.length = 0
        } else if (e.code === 'KeyK') {
          if (this.seqKey.length === 2 && this.seqKey[0] === 'KeyS' && this.seqKey[1] === 'KeyA') {
            console.log('ajejebloken')
            this.role.service.send('ajejebloken')
          }
          this.seqKey.length = 0
        } else {
          this.seqKey.push(e.code)
        }
        this.timeoutSeqKey = setTimeout(() => {
          this.seqKey.length = 0
        }, 300)
      }

      // if (!this.gltf) return
      // if (e.code === this.actkey) return
      // this.actkey = e.code

      // console.log(Object.fromEntries(Object.entries(this.holdKey).filter((n) => n[1])))
      // console.log(
      //   Object.entries(this.holdKey)
      //     .filter((n) => n[1])
      //     .map((n) => n[0])
      // )

      // console.log(this.seqKey)
    })
    window.addEventListener('keyup', (e) => {
      // console.log(e)
      this.holdKey[e.code] = false

      switch (e.code) {
        case 'KeyJ':
        case 'Numpad4':
          this.role.service.send('keyJUp')
          break
        case 'KeyU':
        case 'Numpad7':
          this.role.service.send('keyUUp')
          break
        case 'KeyL':
        case 'Numpad6':
          this.role.service.send('keyLUp')
          this.seqKey.length = 0
          break
      }
      // this.actkey = ''
    })
  }

  update(dt) {
    // console.log('update')
    // if (this.role.service.state.matches('loading')) return

    if (this.tickKey.KeyJ && this.tickKey.KeyK && this.tickKey.KeyL) {
      // console.log('pop')
      this.role.pop?.pop() // Whether need use: this.role.service.send('pop') ?
    } else {
      switch (
        Object.keys(this.tickKey)[0] // note: The order of Object.keys may not by added order, but should no big problem.
      ) {
        case 'KeyJ':
        case 'Numpad4':
          this.role.service.send('attack')
          // console.log('---keydown J')
          break
        case 'KeyK':
        case 'Numpad5':
          this.role.service.send('jump')
          break
        case 'KeyI':
        case 'Numpad8':
          this.role.service.send('dash')
          break
        case 'KeyU':
        case 'Numpad7':
          this.role.service.send('bash')
          break
        case 'KeyL':
        case 'Numpad6':
          this.role.service.send('block')
          break
      }
    }

    this.role.direction.set(0, 0)
    if (this.holdKey.KeyW || this.holdKey.ArrowUp) this.role.direction.add(vec2(0, -1))
    if (this.holdKey.KeyS || this.holdKey.ArrowDown) this.role.direction.add(vec2(0, 1))
    if (this.holdKey.KeyA || this.holdKey.ArrowLeft) this.role.direction.add(vec2(-1, 0))
    if (this.holdKey.KeyD || this.holdKey.ArrowRight) this.role.direction.add(vec2(1, 0))
    this.role.direction.normalize().multiplyScalar(this.role.speed)
    // console.log(this.role.direction)
    let directionLengthSq = this.role.direction.lengthSq()

    if (directionLengthSq > 0) {
      this.role.service.send('run')
    } else {
      // console.log('111111111111111')
      this.role.service.send('stop')
    }

    if (this.role.service.state.hasTag('canMove')) {
      // change facing
      if (directionLengthSq > 0) {
        this.role.facing.copy(this.role.direction)
      }
      this.role.mesh.rotation.y = -this.role.facing.angle() + Math.PI / 2
      // move
      this.role.body.position.x += this.role.direction.x
      this.role.body.position.z += this.role.direction.y
    }

    // if (this.holdKey.KeyJ) {
    //   // code here run after animation finished event, in one tick.
    //   this.role.service.send('keyJDown')
    //   // console.log('whirlwind')
    // } else {
    //   this.role.service.send('keyJUp')
    // }

    // restore
    this.tickKey = {}
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
