//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Shield {
  constructor() {
    let s = this

    s.is_hit = false
    s.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.7, 0.3, 1))
    s.body.addShape(shape)
    world.addBody(s.body)

    // s.body.addEventListener('collide', (e) => {
    //   if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(role.xstateService.state.matches)) {
    //     window.enemys.forEach((enemy) => {
    //       if (e.body === enemy.body) {
    //         enemy.hit() // todo: refactor: do not check role's state at here.
    //       }
    //     })
    //   }
    // })

    function update() {
      if (role.gltf) {
        let tempVec3 = vec3() ///todo: performance
        let tempQuat = new THREE.Quaternion() ///todo: performance
        // role.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
        role.shieldDelegate.getWorldPosition(tempVec3)
        role.shieldDelegate.getWorldQuaternion(tempQuat)
        s.body.position.copy(tempVec3)
        s.body.quaternion.copy(tempQuat)
      }
    }
    updates.push(update)
  }
}

export { Shield }
