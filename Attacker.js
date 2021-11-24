//new Attacker(scene, updates, enemy.mesh.position, mesh.position)
class Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    let s = this
    let speed = 1.5
    let movement /*vec3*/ = vec3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed)
    this.isDisposed = false

    let body_size = 2
    s.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.collisionResponse = false
    // let shape = new CANNON.Cylinder(body_size, body_size, 0.3, 8)
    let shape = new CANNON.Cylinder(body_size, body_size, 1.5, 8)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) ///Why cannon-es not need this rotate?
    s.body.addShape(shape)
    s.body.position.copy(owner.body.position)
    // s.body.position.y += 0.5
    world.addBody(s.body)

    s.body.addEventListener('collide', (e) => {
      if (e.body === role.body) {
        role.hit()
      }
      window.enemys.forEach((enemy) => {
        if (e.body === enemy.body && e.body !== owner.body) {
          enemy.hit()
        }
      })
    })

    this.update = () => {
      s.body.position.x += movement.x
      s.body.position.z += movement.z
    }
    updates.push(this.update)

    setTimeout(() => {
      if (!this.isDisposed) this.dispose()
    }, 2000)

    attackers.push(this)
  }

  dispose() {
    world.removeBody(this.body)
    updates.splice(updates.indexOf(this.update), 1)
    attackers.splice(attackers.indexOf(this), 1)

    this.isDisposed = true
  }
}

export { Attacker }
