class RoleControls {
  constructor(role) {
    this.role = role
    window.role = role ///todo

    updates.push(this)

    this.okey = {}
    this.actkey = ''

    window.addEventListener('keydown', (e) => {
      // console.log(e.key,e.code,e.keyCode)
      this.okey[e.code] = true

      // if (!this.gltf) return
      if (e.code === this.actkey) return
      switch (e.code) {
        case 'KeyJ':
        case 'Numpad4':
          this.role.service.send('attack')
          break
        case 'KeyK':
        case 'Numpad5':
          this.role.service.send('jump')
          break
        case 'KeyI':
        case 'Numpad8':
          this.role.service.send('dash')
          break
      }
      this.actkey = e.code
    })
    window.addEventListener('keyup', (e) => {
      // console.log(e)
      this.okey[e.code] = false
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

    if (this.role.direction.length() > 0) {
      this.role.service.send('run')
      this.role.facing.copy(this.role.direction)
    } else {
      // console.log('111111111111111')
      this.role.service.send('stop')
    }

    if (this.role.service.state.hasTag('canMove')) {
      // change facing
      this.role.gltf.scene.rotation.y = -this.role.facing.angle() + Math.PI / 2
      // move
      this.role.body.position.x += this.role.direction.x
      this.role.body.position.z += this.role.direction.y
    }

    if (this.okey.KeyJ) {
      // code here run after animation finished event, in one tick.
      this.role.service.send('keyJDown')
      // console.log('whirlwind')
    } else {
      this.role.service.send('keyJUp')
    }
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
