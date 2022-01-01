import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class Grenade extends Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    super()

    this.owner = owner
    let speed = 0.11
    this.movement /*vec3*/ = new THREE.Vector3().subVectors(target, owner.body.position).normalize().multiplyScalar(speed) // TODO: parabola.
    this.stopTime = 0

    // fsm

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'grenade',
        initial: 'move',
        states: {
          move: {
            on: {
              collide: { target: 'stop' },
              rebound: { target: 'rebound' },
            },
            after: {
              5000: { target: 'dispose' },
            },
          },
          stop: {
            entry: 'entryStop',
            after: {
              1500: { target: 'explode' },
            },
          },
          explode: {
            entry: 'entryExplode',
          },
          rebound: {
            entry: 'entryRebound',
            after: {
              5000: { target: 'dispose' },
            },
          },
          dispose: {
            entry: 'entryDispose',
          },
        },
      },
      {
        actions: {
          entryStop: () => {
            // TODO: Raycast ground and repos to prevent sink.
            this.stopTime = performance.now()
          },
          entryDispose: () => {
            this.dispose()
          },
          entryExplode: () => {
            this.mesh.material.emissive.setScalar(0)
            // window.maria.sword.material.emissive.setScalar(0)
            this.dispose()
            this.explode()
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
      // if (state.changed) console.log('grenade: state:', state.value)
    })

    this.service.start()

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_SCENE | g.GROUP_ROLE_ATTACKER

    this.radius = 0.18
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

    window.grenades.push(this)
  }

  update(dt) {
    if (this.service.state.matches('move') || this.service.state.matches('rebound')) {
      this.body.position.x += this.movement.x * dt * 60
      this.body.position.y += this.movement.y * dt * 60
      this.body.position.z += this.movement.z * dt * 60
      this.mesh.position.copy(this.body.position)
    } else if (this.service.state.matches('stop')) {
      let freq = performance.now() - this.stopTime
      freq = freq ** 1.6
      freq *= 0.00057
      let intensity = Math.sin(freq)
      intensity = Math.max(0, intensity)
      this.mesh.material.emissive.setScalar(intensity)
      // window.maria.sword.material.emissive.setScalar(intensity)
    }
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // console.log(event.body)
    // event.body.belongTo.hit()
    if (event.body.belongTo.isGround) {
      this.service.send('collide')
    } else if (event.body.belongTo.isAttacker && event.body.belongTo.owner.service.state.hasTag('canDamage')) {
      this.service.send('rebound')
    } else if (event.body.belongTo.isEnemy) {
      event.body.belongTo.hit(event)
    }
  }

  explode() {
    // body
    this.explodeRadius = 3
    this.explodeHeight = 0.1
    this.explodeBody = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.DYNAMIC,
      collisionResponse: false,
      // NOTE: See Attacker.js NOTE.
      collisionFilterGroup: g.GROUP_ENEMY_ATTACKER,
      collisionFilterMask: g.GROUP_ROLE,
    })
    this.explodeBody.belongTo = this
    let shape = new CANNON.Cylinder(this.explodeRadius, this.explodeRadius, this.explodeHeight, 8)
    this.explodeBody.addShape(shape)
    this.explodeBody.position.copy(this.body.position)
    world.addBody(this.explodeBody)

    this.explodeBody.addEventListener('collide', (event) => {
      event.body.belongTo.hit(event)
    })

    // mesh

    let geometry = new THREE.CylinderGeometry(this.explodeRadius, this.explodeRadius, this.explodeHeight, 32) // todo: reuse geometry & material
    let material = new THREE.MeshStandardMaterial({
      color: 'cyan',
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
    })
    this.explodeMesh = new THREE.Mesh(geometry, material)
    this.explodeMesh.castShadow = true
    this.explodeMesh.receiveShadow = true
    window.scene.add(this.explodeMesh)
    this.explodeMesh.position.copy(this.explodeBody.position)

    //

    setTimeout(() => {
      world.removeBody(this.explodeBody)
      scene.remove(this.explodeMesh)
    }, 300)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh) // TODO: dispose geometry material.
    updates.splice(updates.indexOf(this), 1)
    window.grenades.splice(window.grenades.indexOf(this), 1)
  }
}

export { Grenade }
