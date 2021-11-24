class RoleControls {
  constructor(role) {
    this.role = role
    window.role = role ///todo

    updates.push(this)

    this.okey = {}
    this.actkey = ''

    window.addEventListener('keydown', (e) => {
      // console.log('repeat', e.repeat, e.code)

      // if (e.repeat) return
      // console.log(e.key, e.code, e.keyCode)

      if (this.okey[e.code]) return // Prevent: keyD -> keyJ long press -> keyD up, cause double attack bug.
      // e.prepeat & if (e.code === this.actkey) return, both not work.

      this.okey[e.code] = true

      // if (!this.gltf) return
      // if (e.code === this.actkey) return
      switch (e.code) {
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
      }
      this.actkey = e.code
    })
    window.addEventListener('keyup', (e) => {
      // console.log(e)
      this.okey[e.code] = false

      switch (e.code) {
        case 'KeyJ':
        case 'Numpad4':
          this.role.service.send('keyJUp')
          break
        case 'KeyU':
        case 'Numpad7':
          this.role.service.send('keyUUp')
          break
      }
      this.actkey = ''
    })
  }

  update(dt) {
    // if (this.role.service.state.matches('loading')) return

    this.role.direction.set(0, 0)
    if (this.okey.KeyW || this.okey.ArrowUp) this.role.direction.add(vec2(0, -1))
    if (this.okey.KeyS || this.okey.ArrowDown) this.role.direction.add(vec2(0, 1))
    if (this.okey.KeyA || this.okey.ArrowLeft) this.role.direction.add(vec2(-1, 0))
    if (this.okey.KeyD || this.okey.ArrowRight) this.role.direction.add(vec2(1, 0))
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

    // if (this.okey.KeyJ) {
    //   // code here run after animation finished event, in one tick.
    //   this.role.service.send('keyJDown')
    //   // console.log('whirlwind')
    // } else {
    //   this.role.service.send('keyJUp')
    // }
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
