import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Bullet } from './Bullet.js'
import { Grenade } from './Grenade.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { Splash } from './Splash.js'

class Parrot {
  constructor({ position }) {
    this.isCharacter = true
    this.isEnemy = true

    updates.push(this)

    // this.health = 100
    this.oaction = {}
    this.mixer
    this.position = position
    this.initialPosition = this.position.clone()

    // for RoleControls.js
    this.direction = new THREE.Vector2() // direction may be zero length.
    this.facing = new THREE.Vector2(0, 1) // facing always not zero length.
    this.speed = 0.06

    // for Ai.js
    this.detectorRadius = 12

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'parrot',
        context: {
          health: 100,
          // health: Infinity,
        },
        initial: 'loading',
        states: {
          loading: {
            on: {
              loaded: { target: 'idle' },
            },
          },
          idle: {
            entry: 'playIdle',
            on: {
              run: { target: 'run' },
              attack: { target: 'attack' },
              grenade: { target: 'grenade' },
              hit: { target: 'hit' },
            },
            tags: ['canFacing'],
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attack' },
              grenade: { target: 'grenade' },
              hit: { target: 'hit' },
            },
            tags: ['canMove', 'canFacing'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          grenade: {
            entry: 'playGrenade',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          hit: {
            entry: ['decreaseHealth', 'playHit'],
            always: [{ target: 'dead', cond: 'isDead' }],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          dead: {
            entry: 'playDead',
            type: 'final',
          },
        },
      },
      {
        actions: {
          decreaseHealth: assign({ health: (context, event) => context.health - 35 }),

          playIdle: () => {
            this.fadeToAction('parrot_A_', 0.2)
          },
          playRun: () => {
            this.body.velocity.set(0, 0, 0)
          },
          playAttack: () => {
            // this.fadeToAction('dance', 0.2)
            if (g.isAttack && window.role.gltf && this.gltf) new Bullet(scene, updates, this, new THREE.Vector3(window.role.mesh.position.x, window.role.mesh.position.y + window.role.bodyHeightHalf, window.role.mesh.position.z))
            this.service.send('finish')
          },
          playGrenade: () => {
            if (g.isAttack && window.role.gltf && this.gltf) new Grenade(scene, updates, this, new THREE.Vector3(window.role.mesh.position.x, window.role.mesh.position.y, window.role.mesh.position.z))
            this.service.send('finish')
          },
          playHit: (context, event, o) => {
            // this.fadeToAction('jump', 0.2)

            new Splash(event.collideEvent)

            gsap.to(this.body.position, {
              duration: 0.15,
              y: this.initialPosition.y + 0.37,
              onComplete: () => {
                gsap.to(this.body.position, {
                  duration: 0.15,
                  y: this.initialPosition.y,
                  onComplete: () => {
                    this.service.send('finish')
                  },
                })
              },
            })
          },
          playDead: () => {
            // this.fadeToAction('death', 0.2)
            this.action_act.stop()
            gsap.to(this.mesh.rotation, {
              duration: 0.5,
              x: Math.PI,
            })

            this.body.mass = this.mass
            this.body.collisionFilterMask = g.GROUP_SCENE
            // setTimeout(() => {
            //   this.body.velocity.set(0, 0, 0)
            // }, 0)
          },
        },
        guards: {
          isDead(context) {
            return context.health <= 0
          },
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('parrot: state:', state.value)
      // if (state.changed) console.log(state.value,state)
      // this.currentState = state.value
      ///currentState === this.service.state.value
    })

    // Start the service
    this.service.start()
    // => 'pending'

    // this.service.send( 'idle' )
    // => 'resolved'

    this.mass = 20
    this.bodySize = 0.59
    this.body = new CANNON.Body({
      mass: this.mass,
      collisionFilterGroup: g.GROUP_ENEMY,
      // collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ROLE_ATTACKER,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE_ATTACKER, // TODO: air ground?
    })
    this.body.belongTo = this
    let shape = new CANNON.Sphere(this.bodySize)
    // let shape = new CANNON.Cylinder(this.bodySize, this.bodySize, 3, 8)
    // let shape = new CANNON.Cylinder(this.bodySize, this.bodySize, 5, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.fixedRotation = true
    this.body.addShape(shape)
    this.body.position.copy(this.position)
    world.addBody(this.body)

    // this.attack()
    // setInterval(this.attack.bind(this), 6000)
  }

  update(dt) {
    if (this.service.state.value === 'loading') return
    this.mixer.update(dt)
    this.mesh.position.set(this.body.position.x, this.body.position.y - 0.37, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z

    // if (!window.role?.gltf) return
    // if (this.service.state.value !== 'dead') {
    //   {
    //     // look at role
    //     let vec2_diff = new THREE.Vector2(role.mesh.position.x - this.mesh.position.x, role.mesh.position.z - this.mesh.position.z)
    //     let angle = vec2_diff.angle()
    //     // console.log(angle)
    //     this.mesh.rotation.y = -angle + Math.PI / 2
    //   }
    // }
  }

  // attack() {
  //   // console.log('attack')
  //   this.service.send('attack')
  //   setTimeout(() => {
  //     this.service.send('grenade')
  //   }, 3000)
  // }

  hit(collideEvent) {
    // console.log('hit function')
    this.service.send('hit', { collideEvent })
  }

  knockDown(collideEvent) {
    this.hit(collideEvent)
  }

  load() {
    return new Promise((resolve, reject) => {
      var loader = new GLTFLoader()
      loader.load(
        './model/Parrot/Parrot.glb',
        (gltf) => {
          // console.log('parrot loaded')
          // console.log(gltf)
          this.gltf = gltf
          this.mesh = this.gltf.scene

          this.mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          window.scene.add(this.mesh)
          this.mesh.scale.setScalar(0.022)
          // mesh.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.mesh)
          gltf.animations.forEach((animation) => {
            let name = animation.name
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action
            // if (['jump', 'punch', 'dance'].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }
            // if (['death'].includes(name)) {
            //   action.loop = THREE.LoopOnce
            //   action.clampWhenFinished = true
            // }
            // this.oaction.dance.timeScale = 3
          })
          this.action_act = this.oaction['parrot_A_']
          this.action_act.play()
          this.mixer.addEventListener('finished', (event) => {
            this.service.send('finish')
          })

          this.body.mass = 0 // TODO: Fix hit by jumpBash ( velocity changed ) bug.
          this.body.position.copy(this.position)
          this.body.velocity.set(0, 0, 0)

          this.service.send('loaded')
          resolve()
        },
        undefined,
        (event) => {
          console.error(event)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration) {
    // console.log(name)
    // previousAction = this.action_act;
    // activeAction = this.oaction[ name ];

    // if ( previousAction !== activeAction ) {
    //   previousAction.fadeOut( duration );
    // }

    // activeAction
    //   .reset()
    //   .setEffectiveTimeScale( 1 )
    //   .setEffectiveWeight( 1 )
    //   .fadeIn( duration )
    //   .play();

    this.action_act.stop()
    this.oaction[name].reset().play()
    this.action_act = this.oaction[name]
  }
}

export { Parrot }
