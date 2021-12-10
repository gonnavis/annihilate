import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class SwordBlaster extends Attacker {
  constructor(owner, type) {
    super()

    this.owner = owner
    this.type = type

    this.width = 0.185
    this.height = 2.96 * 2
    this.depth = 1.85 * 2

    if (this.type === 1) {
      this.angle = -Math.PI / 5
    } else if (this.type === 2) {
      this.angle = Math.PI / 5
    } else {
      this.angle = 0
    }

    this.target = new THREE.Vector3(this.owner.facing.x, 0, this.owner.facing.y).normalize().multiplyScalar(18.5).add(this.owner.body.position) // vec3

    // body

    this.body.collisionFilterGroup = g.GROUP_ROLE_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ENEMY

    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2))
    this.body.addShape(shape)

    // mesh

    // let geometry = new THREE.PlaneBufferGeometry(this.depth, this.height) // todo: reuse geometry & material
    // geometry.rotateX(Math.PI / 2)
    // geometry.rotateZ(Math.PI / 2)
    let geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth) // todo: reuse geometry & material
    let material = new THREE.MeshBasicMaterial({
      color: 'cyan',
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    this.mesh = new THREE.Mesh(geometry, material)

    //

    this.body.position.x = this.owner.body.position.x
    this.body.position.z = this.owner.body.position.z
    this.body.position.y = this.owner.body.position.y
    // this.body.position.y = this.owner.body.position.y + this.height / 2

    this.body.quaternion.setFromEuler(0, -this.owner.facing.angle() + (Math.PI / 2) * 3, this.angle)

    // this.target.set(this.body.position.x, this.owner.body.position.y + this.height / 2, this.body.position.z - 50)
    this.launch()
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
    if (this.type === 3) {
      event.body.belongTo.knockDown(event)
    } else {
      event.body.belongTo.hit(event)
    }
    // }
  }

  launch() {
    gsap.to(this.body.position, {
      duration: 0.3,
      // duration: 3,
      x: this.target.x,
      y: this.target.y,
      z: this.target.z,
      ease: 'none',
      onStart: () => {
        // add body and mesh here to prevent occur at world center and hit enemies there.
        world.addBody(this.body)
        scene.add(this.mesh)
      },
      onUpdate: () => {
        this.mesh.position.copy(this.body.position)
        this.mesh.quaternion.copy(this.body.quaternion)
      },
      onComplete: () => {
        this.dispose()
      },
    })
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh)
    // this.isDisposed = true
  }
}

export { SwordBlaster }
