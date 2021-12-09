import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Splash {
  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(0.1, 0.1),
      new THREE.MeshStandardMaterial({
        color: 'red',
      })
    )
    scene.add(this.mesh)

    // let shape = new CANNON.Box(.5,.5,.5)
    // // let physicsMaterial = new CANNON.Material({
    // //   friction: 0,
    // // })
    // this.body = new CANNON.Body({
    //   // material: physicsMaterial,
    //   mass: 0,
    //   collisionFilterGroup: g.GROUP_SCENE,
    // })
    // this.body.belongTo = this
    // this.body.addShape(shape)
    // this.body.position.set(0, 0, 0)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // // this.body.addEventListener("collide", (event) => {
    // //   console.log('collide floor')
    // // })
    // world.addBody(this.body)
  }
}

export { Splash }
