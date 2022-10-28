import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class FloatingBox {
  constructor(width = 1, height = 1, depth = 1) {
    this.isGround = true

    updates.push(this)

    this.timeBias = 0
    this.speed = 3.7

    // box

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    // this.mesh.rotation.x = - Math.PI / 2;
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(this.body)

    // floating box

    // this.body.velocity.set(this.speed, 0, 0)
    this.initialPosX = 4
    this.body.position.x = this.initialPosX
    this.body.velocity.x = 7.4
  }

  update(dt, time) {
    this.body.velocity.x += -(this.body.position.x - this.initialPosX) * 0.01
    // this.body.velocity.x = Math.sin(time * 0.001 + this.timeBias) * 20
    // if (this.body.position.x < -20) {
    //   this.body.velocity.set(this.speed, 0, 0)
    // }
    // if (this.body.position.x > 20) {
    //   this.body.velocity.set(-this.speed, 0, 0)
    // }

    // this.body.position.x = Math.sin(time * 0.001) * 10;

    this.mesh.position.copy(this.body.position)
  }
}

export { FloatingBox }
