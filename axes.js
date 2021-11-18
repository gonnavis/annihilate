//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Axes {
  constructor() {
    let s = this

    s.is_hit = false
    s.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.3, 1))
    s.body.addShape(shape)
    world.addBody(s.body)

    s.body.addEventListener('collide', (e) => {
      // if (['attack', 'prepareFist', 'fist', 'prepareStrike', 'strike', 'jumpAttack', 'dashAttack'].some(role.xstateService.state.matches)) {
      if (role.xstateService.state.hasTag('canDamage')) {
        window.enemys.forEach((enemy) => {
          if (e.body === enemy.body) {
            enemy.hit() // todo: refactor: do not check role's state at here.
          }
        })
      }
    })

    function update() {
      if (role.gltf) {
        let tempVec3 = vec3() ///todo: performance
        let tempQuat = new THREE.Quaternion() ///todo: performance
        // role.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
        role.swordDelegate.getWorldPosition(tempVec3)
        role.swordDelegate.getWorldQuaternion(tempQuat)
        s.body.position.copy(tempVec3)
        s.body.quaternion.copy(tempQuat)
      }
    }
    updates.push(update)
  }
}

export { Axes }
