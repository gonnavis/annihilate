import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

//new Hadouken(scene, updates, robot.mesh.position, mesh.position)
class Hadouken extends Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    super()

    this.owner = owner
    let speed = 0.18
    // this.movement /*vec3*/ = new THREE.Vector3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed)
    // NOTE: Use Vector2 to prevent too slow when role on top of robot.
    // this.movement = new THREE.Vector2(target.x - owner.body.position.x, target.z - owner.body.position.z).normalize().multiplyScalar(speed)
    this.movement = new THREE.Vector2().copy(this.owner.facing).normalize().multiplyScalar(speed)

    // fsm

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'hadouken',
        initial: 'move',
        states: {
          move: {
            on: {
              rebound: { target: 'rebound' },
            },
            after: {
              2000: { target: 'dispose' },
            },
          },
          rebound: {
            entry: 'entryRebound',
            after: {
              2000: { target: 'dispose' },
            },
          },
          dispose: {
            entry: 'entryDispose',
          },
        },
      },
      {
        actions: {
          entryDispose: () => {
            this.dispose()
          },
          entryRebound: () => {
            this.movement.multiplyScalar(-1)
            this.body.collisionFilterGroup = g.GROUP_ROLE_ATTACKER
            this.body.collisionFilterMask = g.GROUP_ENEMY
          },
        },
      }
    )
    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('hadouken: state:', state.value)
    })

    this.service.start()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE | g.GROUP_ROLE_ATTACKER

    this.radius = 0.8
    // this.height = 0.11
    this.height = 0.4 // Increase hadouken height for more easily rebound.
    let shape = new CANNON.Cylinder(this.radius, this.radius, this.height, 8)
    // let shape = new CANNON.Cylinder(this.radius, this.radius, 1.5, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) ///Why cannon-es not need this rotate?
    this.body.addShape(shape)
    this.body.position.copy(owner.body.position)
    // this.body.position.y += 1
    // this.body.position.y += 0.5
    world.addBody(this.body)

    // mesh

    let geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32) // todo: reuse geometry & material
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

    window.hadoukens.push(this)
  }

  update(dt) {
    this.body.position.x += this.movement.x * dt * 60
    this.body.position.z += this.movement.y * dt * 60
    this.mesh.position.copy(this.body.position)
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
    updates.splice(updates.indexOf(this), 1)
    window.hadoukens.splice(window.hadoukens.indexOf(this), 1)
  }
}

export { Hadouken }
