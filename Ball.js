import { g } from './global.js'

import * as THREE from './lib/three.js/build/three.module.js'
class Ball {
  constructor(radius = 1) {
    this.radius = radius

    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(this.radius), new THREE.MeshStandardMaterial({ color: 0x555555 }))
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Sphere(this.radius)
    this.body = new CANNON.Body({
      mass: 1,
      collisionFilterGroup: -1,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    // this.body.addEventListener("collide", (event) => {
    //   console.log('collide floor')
    // })
    world.addBody(this.body)

    window.updates.push(this)
  }

  update() {
    this.mesh.position.copy(this.body.position)
  }

  hit() {}

  knockDown() {}
}

export { Ball }
