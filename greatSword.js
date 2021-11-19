//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class GreatSword {
  constructor() {
    let s = this
    this.owner = null

    s.is_hit = false
    s.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.belongTo = this
    s.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 2))
    s.body.addShape(shape)
    world.addBody(s.body)

    s.body.addEventListener('collide', (e) => {
      // console.log('greatSword collide', e.body.belongTo)
      if (e.body.belongTo?.isEntity === true && e.body.belongTo !== this.owner) {
        // console.log(1111111111)
        if (this.owner.xstateService.state.hasTag('canDamage')) {
          e.body.belongTo.hit()
        }
      }
    })

    function update() {
      if (s.owner.gltf) {
        let tempVec3 = vec3() ///todo: performance
        let tempQuat = new THREE.Quaternion() ///todo: performance
        // s.owner.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
        s.owner.swordDelegate.getWorldPosition(tempVec3)
        s.owner.swordDelegate.getWorldQuaternion(tempQuat)
        s.body.position.copy(tempVec3)
        s.body.quaternion.copy(tempQuat)
      }
    }
    updates.push(update)
  }
}

export { GreatSword }