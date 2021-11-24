import { g } from './global.js'
class Sword {
  constructor() {
    updates.push(this)

    this.owner = null

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.3, 1.2))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('collide', (e) => {
    this.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo?.isEnemy === true && e.body.belongTo !== this.owner) {
        if (this.owner.service.state.hasTag('canDamage')) {
          e.body.belongTo.hit()
        }
      }
    })
  }

  update() {
    if (this.owner.gltf) {
      let tempVec3 = vec3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }
}

export { Sword }
