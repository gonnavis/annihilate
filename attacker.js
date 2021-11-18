//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    let s = this
    let movement /*vec3*/ = vec3().subVectors(target, owner.body.position).normalize().multiplyScalar(1.5)
    this.isDisposed = false
    this.isCollideShield = false
    this.isCollideRole = false

    let body_size = 2
    // s.is_hit = false
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
    s.body.position.y += .5
    world.addBody(s.body)

    s.body.addEventListener('collide', (e) => {
      // if(!window.a){
      //   console.log('aaa')
      //   window.a=e
      // }

      // console.log(a===e)

      // if (!s.is_hit && e.body === role.body) { // used stateMachine, should not need is_hit.
      if (e.body === shield.body) {
        // Don't dispose attacker at here, because collide event will fire multiple times in one tick, and shield/role fire order based on the order they added to world.
        // We want shield collide event always fire first, so use vars `isCollideShield` and `isCollideRole`.
        ///todo: No, shield collide event always fire first is wrong, need check real colliding point.
        this.isCollideShield = true
        console.log('shield', performance.now())
      } else if (e.body === role.body) {
        this.isCollideRole = true
        console.log('role', performance.now())
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

      if (this.isCollideShield && role.xstateService.state.matches('idle')) {
        // Note: Can block when running or in other states? No, more by intended operation, less by luck.
        role.xstateService.send('blocked')
        setTimeout(() => {
          // setTimeout to prevent cannon-es error log: Cannot read properties of undefined (reading 'wakeUpAfterNarrowphase').
          if (!this.isDisposed) this.dispose()
        }, 0)
      } else if (this.isCollideRole) {
        // s.is_hit = true
        // console.log('asdf')
        role.hit()
      }

      // restore
      this.isCollideShield = false
      this.isCollideRole = false
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
