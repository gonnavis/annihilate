//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    let s = this
    let movement /*vec3*/ = vec3().subVectors(target, owner).normalize().multiplyScalar(0.5)

    let body_size = 2
    s.is_hit = false
    s.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.collisionResponse = 0
    let shape = new CANNON.Cylinder(body_size, body_size, 0.3, 8)
    s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    s.body.addShape(shape)
    s.body.position.copy(owner)
    world.addBody(s.body)

    s.body.addEventListener('collide', (e) => {
      // if(!window.a){
      //   console.log('aaa')
      //   window.a=e
      // }

      // console.log(a===e)

      if (!s.is_hit && e.body === role.body) {
        s.is_hit = true
        // console.log('asdf')
        role.hit()
      }
    })

    function update() {
      s.body.position.x += movement.x
      s.body.position.z += movement.z
    }
    updates.push(update)

    setTimeout(() => {
      world.remove(s.body)
      updates.splice(updates.indexOf(update), 1)
    }, 2000)
  }
}

export { Attacker }
