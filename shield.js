//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Shield {
  constructor() {
    let s = this

    updates.push(this)

    s.is_hit = false
    s.body = new CANNON.Body({
      mass: 1,
      // type: CANNON.Body.KINEMATIC,
    })
    s.body.belongTo = this
    s.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.7, 0.3, 1))
    s.body.addShape(shape)
    world.addBody(s.body)

    // s.body.addEventListener('collide', (e) => {
    //   if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(paladin.xstateService.state.matches)) {
    //     window.enemys.forEach((enemy) => {
    //       if (e.body === enemy.body) {
    //         enemy.hit() // todo: refactor: do not check paladin's state at here.
    //       }
    //     })
    //   }
    // })
  }

  update() {
    let s = this
    if (paladin.gltf) {
      let tempVec3 = vec3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // paladin.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldQuaternion(tempQuat)
      s.body.position.copy(tempVec3)
      s.body.quaternion.copy(tempQuat)
    }
  }
}

export { Shield }
