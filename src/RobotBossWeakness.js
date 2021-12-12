import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class RobotBossWeakness {
  constructor({ owner }) {
    this.owner = owner

    this.radius = 1
    this.height = 0.1

    this.translateY = -this.owner.bodyRadius + this.height / 2
    this.translateZ = 10
    this.rotSapn = (Math.PI * 2) / 3

    this.bodies = []
    this.meshes = []

    let shape = new CANNON.Cylinder(this.radius, this.radius, this.height, 6)

    let geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 8)
    geometry.translate(0, this.translateY, this.translateZ)
    let material = new THREE.MeshStandardMaterial({
      color: 'red',
    })

    for (let i = 0; i < 3; i++) {
      // body
      let body = new CANNON.Body({
        mass: 0,
        collisionFilterGroup: g.GROUP_ENEMY_SHIELD,
        collisionFilterMask: g.GROUP_ROLE_ATTACKER,
      })
      body.belongTo = this
      body.addShape(shape, new CANNON.Vec3(0, this.translateY, this.translateZ))
      // body.position.set(0,0,0)
      // body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
      body.quaternion.setFromEuler(0, i * this.rotSapn, 0)
      body.addEventListener('collide', (event) => {
        console.log('--collide')
        // if (event.body.belongTo.owner.service.state.hasTag('canDamage')) {
        if (['airChargeBash', 'airChargeBashEnd'].some(event.body.belongTo.owner.service.state.matches)) {
          this.owner.service.send('weak')
        }
      })
      world.addBody(body)
      this.bodies.push(body)

      // mesh
      let mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.y = i * this.rotSapn
      mesh.castShadow = true
      mesh.receiveShadow = true
      window.scene.add(mesh)
      this.meshes.push(mesh)
    }

    //

    window.updates.push(this)
  }

  update(dt, time) {
    if (this.owner.service.state.matches('loading')) return

    for (let i = 0; i < 3; i++) {
      let body = this.bodies[i]
      let mesh = this.meshes[i]

      body.position.copy(this.owner.body.position)
      // body.quaternion.copy(this.owner.mesh.quaternion)
      // body.quaternion.setFromEuler(0, Math.sin(time * 0.001) + this.meshes[i].rotation.y, 0) // random_effect
      // body.quaternion.setFromEuler(0, Math.sin(time * 0.001 + i * Math.PI) * 0.8 + this.owner.mesh.rotation.y, 0)

      mesh.position.copy(body.position)
      // mesh.quaternion.copy(this.body.quaternion)
    }
  }
}

export { RobotBossWeakness }
