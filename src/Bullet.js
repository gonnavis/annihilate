import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Bullet {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    this.isWeapon = true

    updates.push(this)

    this.owner = owner
    let speed = 0.5
    this.movement /*vec3*/ = vec3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed)
    this.isDisposed = false

    this.radius = 0.3
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_ENEMY_WEAPON,
      collisionFilterMask: g.GROUP_ROLE,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    this.body.position.copy(owner.body.position)
    world.addBody(this.body)

    this.body.addEventListener('beginContact', (e) => {
      e.body.belongTo.hit()
    })

    // mesh

    let geometry = new THREE.IcosahedronGeometry(this.radius, 2) // todo: reuse geometry & material
    let material = new THREE.MeshStandardMaterial({
      color: 'cyan',
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    setTimeout(() => {
      // setTimeout 0 to prevent show and blink at world center.
      window.scene.add(this.mesh)
    }, 0)

    //

    setTimeout(() => {
      if (!this.isDisposed) this.dispose()
    }, 2000)

    window.bullets.push(this)
  }

  update(dt) {
    this.body.position.x += this.movement.x
    this.body.position.y += this.movement.y
    this.body.position.z += this.movement.z
    this.mesh.position.copy(this.body.position)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh) // TODO: dispose geometry material.
    updates.splice(updates.indexOf(this), 1)
    window.bullets.splice(window.bullets.indexOf(this), 1)

    this.isDisposed = true
  }
}

export { Bullet }
