import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class RobotBossWeakness {
  constructor({ owner }) {
    this.owner = owner

    this.radius = 1
    this.height = 1

    this.translateY = -this.owner.bodyRadius + this.height / 2
    this.translateZ = 10

    // body

    let shape = new CANNON.Cylinder(this.radius, this.radius, this.height, 6)
    this.body = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_ENEMY_SHIELD,
      collisionFilterMask: g.GROUP_ROLE_ATTACKER,
    })
    this.body.belongTo = this

    this.body.addShape(shape, new CANNON.Vec3(0, this.translateY, this.translateZ))
    // this.body.position.set(0,0,0)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    this.body.addEventListener('collide', (event) => {
      if (event.body.belongTo.owner.service.state.hasTag('canDamage')) {
        this.owner.service.send('weak')
      }
    })

    world.addBody(this.body)

    // mesh

    let geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8)
    geometry.translate(0, this.translateY, this.translateZ)
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 'red',
      })
    )
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    window.scene.add(this.mesh)

    //

    window.updates.push(this)
  }

  update(dt, time) {
    if (this.owner.service.state.matches('loading')) return

    this.body.position.copy(this.owner.body.position)
    this.body.quaternion.copy(this.owner.mesh.quaternion)
    // this.body.quaternion.setFromEuler(0, Math.sin(time * 0.001) + this.meshes[i].rotation.y, 0) // random_effect
    // this.body.quaternion.setFromEuler(0, Math.sin(time * 0.001 + i * Math.PI) * 0.8 + this.owner.mesh.rotation.y, 0)

    this.mesh.position.copy(this.body.position)
    this.mesh.quaternion.copy(this.body.quaternion)
  }
}

export { RobotBossWeakness }
