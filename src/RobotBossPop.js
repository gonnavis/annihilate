import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class RobotBossPop extends Attacker {
  constructor({ owner }) {
    super()

    this.owner = owner

    this.tmpVec3 = new THREE.Vector3()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE

    this.radius = 5
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    // window.world.addBody(this.body)

    // mesh

    let geometry = new THREE.SphereGeometry(this.radius)
    let material = new THREE.MeshBasicMaterial({
      color: 'red',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.5,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    // this.owner.mesh.add(this.mesh)
    window.scene.add(this.mesh)

    this.mesh.visible = false

    // //

    // this.body.position.x = this.owner.body.position.x
    // this.body.position.z = this.owner.body.position.z
    // this.body.position.y = this.owner.body.position.y
    // // this.body.position.y = this.owner.body.position.y + this.height / 2

    // this.body.quaternion.setFromEuler(0, -this.owner.facing.angle() + (Math.PI / 2) * 3, this.angle)

    // // this.target.set(this.body.position.x, this.owner.body.position.y + this.height / 2, this.body.position.z - 50)
    // this.launch()
  }

  update() {
    this.body.position.copy(this.owner.body.position)
    this.body.position.y -= this.owner.bodyRadius
    // this.body.position.y -= 5
    this.mesh.position.copy(this.body.position)
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // push away
    this.tmpVec3.x = event.body.position.x - this.owner.body.position.x
    this.tmpVec3.y = 0
    this.tmpVec3.z = event.body.position.z - this.owner.body.position.z
    this.tmpVec3.normalize().multiplyScalar(12)
    // event.body.velocity.x += this.tmpVec3.x // TODO: Mass more big, distance more long? Use gsap position instead? Or, set absolute value?
    // event.body.velocity.z += this.tmpVec3.z
    event.body.velocity.x = this.tmpVec3.x
    event.body.velocity.z = this.tmpVec3.z

    // damage
    event.body.belongTo.knockDown(event)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh)
    // this.isDisposed = true
  }

  pop() {
    window.world.addBody(this.body)
    setTimeout(() => {
      window.world.removeBody(this.body)
      this.body.collidings.length = 0
      // }, 0)
    }, 300)

    let to = { t: 0, tv: 1 }
    gsap.to(to, {
      duration: 0.2,
      // duration: 3,
      t: 1,
      tv: 0,
      onStart: () => {
        this.mesh.visible = true
        this.mesh.scale.setScalar(0)
        this.mesh.material.opacity = 0.5
      },
      onUpdate: () => {
        this.mesh.scale.setScalar(to.t)
        this.mesh.material.opacity = 0.5 * to.tv
      },
      onComplete: () => {
        this.mesh.visible = false
      },
    })
  }
}

export { RobotBossPop }
