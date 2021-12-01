import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Box {
  constructor(width = 1, height = 1, depth = 1) {
    this.isGround = true

    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    // this.mesh.rotation.x = - Math.PI / 2;
    this.mesh.position.copy(pos)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    this.body = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    // this.body.position.set(0,0,0)
    this.body.position.copy(pos)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // this.body.addEventListener("collide", (event) => {
    //   console.log('collide floor')
    // })
    world.addBody(this.body)
  }
}

export { Box }
