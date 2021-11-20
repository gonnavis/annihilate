class Ai {
  constructor(role, target, distance = 3) {
    this.role = role
    this.target = target
    this.distance = distance

    updates.push(this)

    this.okey = {}
    this.actkey = ''
    this.direction = vec2(0, 0)
    this.facing = vec2(0, 1)
  }

  update(dt) {
    // if (this.role.xstateService.state.matches('loading')) return

    this.direction.x = this.target.body.position.x - this.role.body.position.x
    this.direction.y = this.target.body.position.z - this.role.body.position.z
    // console.log(this.direction)

    if (this.direction.length() > this.distance) {
      this.role.xstateService.send('run')
      this.facing.copy(this.direction)
    } else {
      // this.role.xstateService.send('stop')
      this.role.xstateService.send('attack')
    }

    if (this.role.xstateService.state.hasTag('canMove')) {
      // change facing
      this.role.gltf.scene.rotation.y = -this.facing.angle() + Math.PI / 2 ///formal
      // this.role.gltf.scene.rotation.y = -this.facing.angle()+Math.PI///test
    }

    this.direction.normalize().multiplyScalar(this.role.speed)
    if (this.role.xstateService.state.hasTag('canMove')) {
      this.role.body.position.x += this.direction.x
      this.role.body.position.z += this.direction.y
    }
  }
  setRole(role) {
    this.role = role
  }
  setTarget(target) {
    this.target = target
  }
  setDistance(distance) {
    this.distance = distance
  }
}

export { Ai }
