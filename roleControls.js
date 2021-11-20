class RoleControls {
  constructor(role) {
    this.role = role
    window.role = role ///todo

    updates.push(this)

    this.okey = {}
    this.actkey = ''
    this.direction = vec2()
    this.facing = vec2(0, 1)

    window.addEventListener('keydown', (e) => {
      // console.log(e.key,e.code,e.keyCode)
      this.okey[e.code] = true

      // if (!this.gltf) return
      if (e.code === this.actkey) return
      switch (e.code) {
        case 'KeyJ':
        case 'Numpad4':
          this.role.xstateService.send('attack')
          break
        case 'KeyK':
        case 'Numpad5':
          this.role.xstateService.send('jump')
          break
        case 'KeyI':
        case 'Numpad8':
          this.role.xstateService.send('dash')
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
    // if (this.role.xstateService.state.matches('loading')) return

    this.direction.set(0, 0)
    if (this.okey.KeyW || this.okey.ArrowUp) this.direction.add(vec2(0, -1))
    if (this.okey.KeyS || this.okey.ArrowDown) this.direction.add(vec2(0, 1))
    if (this.okey.KeyA || this.okey.ArrowLeft) this.direction.add(vec2(-1, 0))
    if (this.okey.KeyD || this.okey.ArrowRight) this.direction.add(vec2(1, 0))
    this.direction.normalize().multiplyScalar(this.role.speed)
    // console.log(this.direction)

    if (this.role.xstateService.state.hasTag('canMove')) {
      // change facing
      this.role.gltf.scene.rotation.y = -this.facing.angle() + Math.PI / 2 ///formal
      // this.role.gltf.scene.rotation.y = -this.facing.angle()+Math.PI///test
    }

    if (this.direction.length() > 0) {
      this.role.xstateService.send('run')
      this.facing.copy(this.direction)
    } else {
      // console.log('111111111111111')
      this.role.xstateService.send('stop')
    }

    if (this.role.xstateService.state.hasTag('canMove')) {
      this.role.body.position.x += this.direction.x
      this.role.body.position.z += this.direction.y
    }
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
