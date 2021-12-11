import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class RobotBossHadouken extends Attacker {
  constructor({ owner }) {
    super()

    this.owner = owner

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE

    this.width = 0.5
    this.height = 2
    this.depth = 20

    this.translateY = -this.owner.bodyRadius + this.height / 2
    this.translateZ = this.depth / 2

    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2))
    this.body.addShape(shape, new CANNON.Vec3(0, this.translateY, this.translateZ))
    world.addBody(this.body)

    // mesh

    let geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth) // todo: reuse geometry & material

    geometry.translate(0, this.translateY, this.translateZ) // mark

    let material = new THREE.MeshStandardMaterial({
      color: 'cyan',
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    // setTimeout(() => {
    // setTimeout 0 to prevent show and blink at world center.
    window.scene.add(this.mesh)
    // }, 0)

    //
  }

  update(dt, time) {
    if (this.owner.service.state.matches('loading')) return

    this.body.position.copy(this.owner.body.position)
    // this.body.quaternion.copy(this.owner.mesh.quaternion)
    this.body.quaternion.setFromEuler(0, Math.sin(time * 0.001), 0)

    this.mesh.position.copy(this.body.position)
    this.mesh.quaternion.copy(this.body.quaternion)
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // console.log(event.body.belongTo.constructor.name)
    if (event.body.belongTo.isRole) {
      event.body.belongTo.hit(event)
    } else if (event.body.belongTo.isAttacker && event.body.belongTo.owner.service.state.hasTag('canDamage')) {
      this.service.send('rebound')
    } else if (event.body.belongTo.isEnemy) {
      event.body.belongTo.hit(event) // TODO: Why robot still hit twice after check isBeginCollide?
    }
    // if (this.owner.service.state.hasTag('canDamage')) {
    // event.body.belongTo.hit()
    // }
    // if (event.body === role.body) {
    //   role.hit()
    // }
    // window.robots.forEach((robot) => {
    //   if (event.body === robot.body && event.body !== owner.body) {
    //     robot.hit()
    //   }
    // })
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh) // TODO: dispose geometry material.
  }
}

export { RobotBossHadouken }
