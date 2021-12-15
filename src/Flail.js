import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class Flail extends Attacker {
  constructor({ delegate }) {
    super()

    this.delegate = delegate

    this.tmpVec3 = new THREE.Vector3()
    this.tmpQuat = new THREE.Quaternion()

    // body

    // this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    // this.body.collisionFilterMask = g.GROUP_ROLE

    this.size = 0.2
    let shape = new CANNON.Box(new CANNON.Vec3(this.size, this.size, this.size))
    this.body.addShape(shape)
    world.addBody(this.body)

    // mesh

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2),
      new THREE.MeshStandardMaterial({
        color: 'gray',
      })
    )
    window.scene.add(this.mesh)

    // sphere chain

    this.N = window.world.solver.iterations
    // this.N = 5
    {
      this.spheres = []

      const size = 0.05
      const dist = size * 2 + 0.01
      const mass = 1

      // world.solver.iterations = N // To be able to propagate force throw the chain of N spheres, we need at least N solver iterations.

      const sphereShape = new CANNON.Sphere(size)

      let previous
      for (let i = 0; i < this.N; i++) {
        // Create a new body
        const sphereBody = new CANNON.Body({ mass: i === 0 ? 0 : mass })
        sphereBody.addShape(sphereShape)
        sphereBody.position.set(0, dist * (this.N - i), 0)
        // sphereBody.velocity.x = -i
        sphereBody.linearDamping = 0.9
        // sphereBody.angularDamping = 0.99
        window.world.addBody(sphereBody)

        // Connect this body to the last one added
        if (previous) {
          let maxForce = 1e6 // https://pmndrs.github.io/cannon-es/docs/classes/distanceconstraint.html
          // let maxForce = 1e100
          const distanceConstraint = new CANNON.DistanceConstraint(sphereBody, previous, dist, maxForce)
          world.addConstraint(distanceConstraint)
        }

        this.spheres.push(sphereBody)

        // Keep track of the lastly added body
        previous = sphereBody

        // mesh
        sphereBody.mesh = new THREE.Mesh(
          new THREE.SphereGeometry(size),
          new THREE.MeshStandardMaterial({
            color: 'gray',
          })
        )
        window.scene.add(sphereBody.mesh)
      }
    }

    // const distanceConstraint = new CANNON.DistanceConstraint(this.body, this.spheres[this.N - 1], this.size * 2)
    // world.addConstraint(distanceConstraint)
  }

  update() {
    if (this.owner.gltf) {
      this.delegate.getWorldPosition(this.tmpVec3)
      // this.delegate.getWorldQuaternion(this.tmpQuat)
      // this.tmpVec3.x += 0.3
      // this.tmpVec3.x -= 0.8
      this.spheres[0].position.copy(this.tmpVec3)
      // this.body.quaternion.copy(this.tmpQuat)

      this.body.position.copy(this.spheres[this.N - 1].position)
      this.mesh.position.copy(this.body.position)

      this.spheres.forEach((sphere) => {
        sphere.mesh.position.copy(sphere.position)
      })
    }
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
    if (this.owner.service.state.hasTag('canDamage')) {
      event.body.belongTo.hit(event)
    }
    // }
  }
}

export { Flail }
