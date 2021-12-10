import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Shield {
  constructor() {
    this.isWeapon = true
    updates.push(this)

    this.is_hit = false
    this.body = new CANNON.Body({
      mass: 1,
      // type: CANNON.Body.KINEMATIC,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.11, 0.37))
    this.body.addShape(shape)
    world.addBody(this.body)

    // this.body.addEventListener('collide', (event) => {
    //   if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(paladin.service.state.matches)) {
    //     window.robots.forEach((robot) => {
    //       if (event.body === robot.body) {
    //         robot.hit() // todo: refactor: do not check paladin's state at here.
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
