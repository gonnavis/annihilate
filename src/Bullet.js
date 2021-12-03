import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Bullet {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    this.isWeapon = true

    updates.push(this)

    this.owner = owner
    let speed = 0.5
    this.movement /*vec3*/ = vec3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed)

    // fsm

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'attacker',
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
            this.body.collisionFilterGroup = g.GROUP_ROLE_WEAPON
            this.body.collisionFilterMask = g.GROUP_ENEMY
          },
        },
      }
    )
    this.service = interpret(this.fsm).onTransition((state) => {
      if (state.changed) console.log('bullet: state:', state.value)
    })

    this.service.start()

    // body

    this.radius = 0.3
    // this.radius = 3
    this.body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_ENEMY_WEAPON,
      collisionFilterMask: g.GROUP_ROLE | g.GROUP_ROLE_WEAPON,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    this.body.position.copy(owner.body.position)
    world.addBody(this.body)

    this.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo.isRole) {
        e.body.belongTo.hit()
      } else if (e.body.belongTo.isWeapon && e.body.belongTo.owner.service.state.hasTag('canDamage')) {
        this.service.send('rebound')
      } else if (e.body.belongTo.isEnemy) {
        e.body.belongTo.hit()
      }
    })

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
    this.body.position.x += this.movement.x
    this.body.position.y += this.movement.y
    this.body.position.z += this.movement.z
    this.mesh.position.copy(this.body.position)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh) // TODO: dispose geometry material.
    updates.splice(updates.indexOf(this), 1)
    window.bullets.splice(window.bullets.indexOf(this), 1)
  }
}

export { Bullet }
