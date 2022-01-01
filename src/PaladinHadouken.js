import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class PaladinHadouken extends Attacker {
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
        id: 'paladinHadouken',
        initial: 'move',
        states: {
          move: {
            on: {
              rebound: { target: 'rebound' },
            },
            after: {
              1500: { target: 'revert' },
            },
          },
          revert: {
            entry: 'entryRevert',
            on: {
              rebound: { target: 'rebound' },
            },
            after: {
              1500: { target: 'dispose' },
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
          entryRevert: () => {
            this.movement.multiplyScalar(-1)
            this.body.quaternion.setFromEuler(0, this.rotationY, -Math.PI / 4)
          },
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
      // if (state.changed) console.log('paladinHadouken: state:', state.value)
    })

    this.service.start()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE | g.GROUP_ROLE_ATTACKER

    this.width = 0.1
    this.height = 0.8
    this.depth = 3

    let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2))
    this.body.addShape(shape)
    this.body.position.copy(owner.body.position)
    this.body.position.y -= 0.6
    world.addBody(this.body)

    // mesh

    let geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth) // todo: reuse geometry & material
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

    // this.body.quaternion.setFromEuler(0, -this.owner.facing.angle() + (Math.PI / 2) * 3, 0)

    this.rotationY = -this.owner.facing.angle()
    this.body.quaternion.setFromEuler(0, this.rotationY, Math.PI / 4)
  }

  update(dt) {
    this.body.position.x += this.movement.x * dt * 60
    this.body.position.z += this.movement.y * dt * 60
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
    updates.splice(updates.indexOf(this), 1)
  }
}

export { PaladinHadouken }
