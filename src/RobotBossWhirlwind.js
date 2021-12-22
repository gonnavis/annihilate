import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class RobotBossWhirlwind extends Attacker {
  constructor({ owner }) {
    let num = 5
    super({ num })

    this.owner = owner

    this.num = num
    this.meshes = []

    this.width = 2
    this.height = 1
    this.depth = this.owner.detectorRadius

    this.translateY = -this.owner.bodyRadius + this.height / 2
    this.translateZ = this.depth / 2

    this.startTime = 0

    let geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth) // todo: reuse geometry & material
    for (let i = 0, i3 = 0; i < geometry.attributes.position.count; i += 1, i3 += 3) {
      if (geometry.attributes.position.array[i3 + 2] > 0) {
        geometry.attributes.position.array[i3 + 0] *= 3
      }
    }
    geometry.translate(0, this.translateY, this.translateZ) // mark
    let material = new THREE.MeshStandardMaterial({
      color: 'magenta',
      transparent: true,
      opacity: 0.5,
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
    })

    this.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER

    for (let i = 0; i < num; i++) {
      // body

      this.bodies[i].collisionFilterGroup = g.GROUP_NO_COLLIDE
      this.bodies[i].collisionFilterMask = g.GROUP_ROLE

      let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2))
      this.bodies[i].addShape(shape, new CANNON.Vec3(0, this.translateY, this.translateZ))
      setTimeout(() => {
        world.addBody(this.bodies[i])
      }, 0)

      // mesh

      let mesh = new THREE.Mesh(geometry, material)
      mesh.visible = false
      this.meshes.push(mesh)
      // this.mesh.castShadow = true
      // this.mesh.receiveShadow = true
      setTimeout(() => {
        // setTimeout 0 to prevent show and blink at world center.
        window.scene.add(mesh)
      }, 0)

      //
    }
  }

  update(dt, time) {
    if (this.owner.service.state.matches('loading')) return

    for (let i = 0; i < this.num; i++) {
      this.bodies[i].position.copy(this.owner.body.position)
      // this.bodies[i].quaternion.copy(this.owner.mesh.quaternion)
      // this.bodies[i].quaternion.setFromEuler(0, Math.sin(time * 0.001) + this.meshes[i].rotation.y, 0) // random_effect
      let sign = i === 0 ? 1 : -1
      let rotY = -(time - this.startTime) * 0.0005 + ((Math.PI * 2) / 5) * i
      rotY += this.startRotY
      rotY -= 0.41887902047863906 // 0.41887902047863906 = (Math.PI * 2) / 5 / 3 // avoid immediately hit role on start
      this.bodies[i].quaternion.setFromEuler(0, rotY, 0)

      this.meshes[i].position.copy(this.bodies[i].position)
      this.meshes[i].quaternion.copy(this.bodies[i].quaternion)
    }
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

  start() {
    this.startTime = performance.now()
    this.startRotY = this.owner.mesh.rotation.y

    setTimeout(() => {
      // NOTE: setTimeout 0 to prevent unwanted hit if prev frame body rotation just collide role.

      // this.bodies.forEach((body, i) => {
      //   world.addBody(this.bodies[i])
      //   scene.add(this.meshes[i])
      //   body.collidings.length = 0
      // })
      this.bodies.forEach((body) => {
        body.collisionFilterGroup = this.collisionFilterGroup
        body.collidings.length = 0
      })
      this.meshes.forEach((mesh) => {
        mesh.visible = true
      })
    }, 0)
  }

  stop() {
    // this.bodies.forEach((body, i) => {
    //   world.removeBody(this.bodies[i])
    //   scene.remove(this.meshes[i])
    //   body.collidings.length = 0
    // })
    this.bodies.forEach((body) => {
      body.collisionFilterGroup = g.GROUP_NO_COLLIDE
      body.collidings.length = 0
    })
    this.meshes.forEach((mesh) => {
      mesh.visible = false
    })
  }

  dispose() {
    // world.removeBody(this.bodies[i])
    // scene.remove(this.mesh) // TODO: dispose geometry material.
  }
}

export { RobotBossWhirlwind }
