import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class SwordBlaster {
  constructor(owner, type) {
    this.isWeapon = true
    this.owner = owner
    this.type = type

    // updates.push(this)

    this.width = 0.5
    this.height = 8 * 2
    this.depth = 5 * 2

    if (this.type === 1) {
      this.angle = -Math.PI / 5
    } else if (this.type === 2) {
      this.angle = Math.PI / 5
    } else {
      this.angle = 0
    }

    this.target = new THREE.Vector3(this.owner.facing.x, 0, this.owner.facing.y).normalize().multiplyScalar(50).add(this.owner.body.position) // vec3

    this.body = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_ROLE_WEAPON,
      collisionFilterMask: g.GROUP_ENEMY,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2))
    this.body.addShape(shape)

    this.body.addEventListener('beginContact', (e) => {
      // if (e.body.belongTo?.isEnemy === true && e.body.belongTo !== this.owner) {
      if (this.type === 3) {
        e.body.belongTo.knockDown()
      } else {
        e.body.belongTo.hit()
      }
      // }
    })

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

  // update() {}
}

export { SwordBlaster }
