class Shield {
  constructor() {
    updates.push(this)

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 1,
      // type: CANNON.Body.KINEMATIC,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.7, 0.3, 1))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('collide', (e) => {
    //   if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(paladin.service.state.matches)) {
    //     window.enemys.forEach((enemy) => {
    //       if (e.body === enemy.body) {
    //         enemy.hit() // todo: refactor: do not check paladin's state at here.
    //       }
    //     })
    //   }
    // })
  }

  update() {
    if (paladin.gltf) {
      let tempVec3 = vec3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // paladin.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldPosition(tempVec3)
      paladin.shieldDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }
}

export { Shield }
