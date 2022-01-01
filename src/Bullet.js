import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class Bullet extends Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    super()

    this.owner = owner
    let speed = 0.18
    this.movement /*vec3*/ = new THREE.Vector3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed)

    // fsm

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'bullet',
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
      // if (state.changed) console.log('bullet: state:', state.value)
    })

    this.service.start()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE | g.GROUP_ROLE_ATTACKER

    this.radius = 0.11
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    this.body.position.copy(owner.body.position)
    world.addBody(this.body)

    // mesh

    let geometry = new THREE.IcosahedronGeometry(this.radius, 2) // todo: reuse geometry & material
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

    window.bullets.push(this)
  }

  update(dt) {
    this.body.position.x += this.movement.x * dt * 60
    this.body.position.y += this.movement.y * dt * 60
    this.body.position.z += this.movement.z * dt * 60
    this.mesh.position.copy(this.body.position)
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    if (event.body.belongTo.isRole) {
      event.body.belongTo.hit(event)
    } else if (event.body.belongTo.isAttacker && event.body.belongTo.owner.service.state.hasTag('canDamage')) {
      this.service.send('rebound')
    } else if (event.body.belongTo.isEnemy) {
      event.body.belongTo.hit(event)
    }
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh) // TODO: dispose geometry material.
    updates.splice(updates.indexOf(this), 1)
    window.bullets.splice(window.bullets.indexOf(this), 1)
  }
}

export { Bullet }
