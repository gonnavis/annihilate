import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class JumpPoint {
  constructor(radius = 1) {
    this.isTrigger = true

    updates.push(this)

    // body

    this.radius = radius
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_SCENE,
      collisionFilterMask: g.GROUP_ROLE | g.GROUP_ENEMY,
      collisionResponse: false,
    })
    this.body.belongTo = this
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    world.addBody(this.body)

    this.body.addEventListener('beginContact', (event) => {
      // if (event.body.belongTo.isRole) {
      event.body.belongTo.service.send('jumpPoint')
      // event.body.belongTo.body.mass = 0
      // event.body.belongTo.body.velocity.set(0, 0, 0)
      // }
    })

    // mesh

    let geometry = new THREE.IcosahedronGeometry(this.radius, 1) // todo: reuse geometry & material
    let material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
      wireframe: true,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    setTimeout(() => {
      // setTimeout 0 to prevent show and blink at world center.
      window.scene.add(this.mesh)
    }, 0)

    //
  }

  update(dt, time) {
    this.mesh.rotation.x = time * 0.001
    this.mesh.rotation.y = time * 0.001
  }
}

export { JumpPoint }
