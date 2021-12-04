import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Catapult {
  constructor(width = 1, height = 1, depth = 1) {
    this.isGround = true

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    this.mesh.geometry.rotateX(Math.PI / 2)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    this.body = new CANNON.Body({
      // mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // this.body.addEventListener("collide", (event) => {
    //   console.log('collide floor')
    // })
    world.addBody(this.body)

    //

    window.updates.push(this)

    setInterval(() => {
      this.launch()
    }, 5000)
  }

  update() {
    this.mesh.quaternion.copy(this.body.quaternion)
  }

  launch() {
    this.body.angularVelocity.set(-15, 0, 0)
    setTimeout(() => {
      this.body.angularVelocity.set(0, 0, 0)
      gsap.to(this.body.quaternion, {
        duration: 1,
        x: -0.7071067811865475,
        y: 0,
        z: 0,
        w: 0.7071067811865476,
      })
    }, 300)
  }
}

export { Catapult }
