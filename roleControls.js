class RoleControls {
  constructor(role) {
    let s = this
    s.role = role
    window.role = role ///todo
    s.okey = {}
    s.actkey = ''
    s.direction = vec2()
    s.facing = vec2(0, 1)

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

    updates.push(function update(dt) {
      // if (s.role.xstateService.state.matches('loading')) return

      s.direction.set(0, 0)
      if (s.okey.KeyW || s.okey.ArrowUp) s.direction.add(vec2(0, -1))
      if (s.okey.KeyS || s.okey.ArrowDown) s.direction.add(vec2(0, 1))
      if (s.okey.KeyA || s.okey.ArrowLeft) s.direction.add(vec2(-1, 0))
      if (s.okey.KeyD || s.okey.ArrowRight) s.direction.add(vec2(1, 0))
      s.direction.normalize().multiplyScalar(s.role.speed)
      // console.log(s.direction)

      if (s.role.xstateService.state.hasTag('canMove')) {
        // change facing
        s.role.gltf.scene.rotation.y = -s.facing.angle() + Math.PI / 2 ///formal
        // s.role.gltf.scene.rotation.y = -s.facing.angle()+Math.PI///test
      }

      if (s.direction.length() > 0) {
        s.role.xstateService.send('run')
        s.facing.copy(s.direction)
      } else {
        // console.log('111111111111111')
        s.role.xstateService.send('stop')
      }

      if (s.role.xstateService.state.hasTag('canMove')) {
        s.role.body.position.x += s.direction.x
        s.role.body.position.z += s.direction.y
      }
    })
  }
  setRole(role) {
    this.role = role
    window.role = role
  }
}

export { RoleControls }
