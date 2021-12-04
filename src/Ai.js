import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Ai {
  constructor(role, target, distance = 1) {
    this.role = role
    this.target = target
    this.distance = distance

    this.enabled = true

    this.isAttack = true

    updates.push(this)

    this.direction = vec2(0, 0)
    this.facing = vec2(0, 1)
  }

  update(dt) {
    if (!this.enabled) {
      this.role.service.send('stop')
      return
    }

    // if (this.role.service.state.matches('loading')) return

    this.direction.x = this.target.body.position.x - this.role.body.position.x
    this.direction.y = this.target.body.position.z - this.role.body.position.z
    // console.log(this.direction)

    if (this.direction.length() > this.distance) {
      this.role.service.send('run')
      this.facing.copy(this.direction)
    } else {
      if (this.isAttack) {
        if (g.isAttack) {
          this.role.service.send('attack')
        } else {
          this.role.service.send('stop')
        }
      } else {
        this.role.service.send('stop')
      }
    }

    if (this.role.service.state.hasTag('canMove')) {
      // change facing
      this.role.mesh.rotation.y = -this.facing.angle() + Math.PI / 2 ///formal
      // this.role.mesh.rotation.y = -this.facing.angle()+Math.PI///test
    }

    this.direction.normalize().multiplyScalar(this.role.speed)
    if (this.role.service.state.hasTag('canMove')) {
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
