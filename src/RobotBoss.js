import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { Splash } from './Splash.js'
import { RobotBossHadouken } from './RobotBossHadouken.js'
import { RobotBossWeakness } from './RobotBossWeakness.js'

class RobotBoss {
  constructor({ position }) {
    this.isCharacter = true
    this.isEnemy = true
    this.isMassive = true

    updates.push(this)

    // this.health = 100
    this.oaction = {}
    this.mixer
    this.isAir = false
    this.position = position
    this.initialPosition = this.position.clone()

    // for RoleControls.js
    this.direction = vec2() // direction may be zero length.
    this.facing = vec2(0, 1) // facing always not zero length.
    this.speed = 0.04

    // for Ai.js
    this.detectorRadius = 22

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'robotBoss',
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
              // attack: { target: 'attack' },
              attack: { target: 'hadouken' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
            },
            tags: ['canFacing'],
          },
          weak: {
            entry: 'playWeak',
            on: {
              hit: { target: 'hit' }, // TODO: Hit will into idle and restore shield before 10s.
            },
            after: {
              10000: { target: 'idle' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'hadouken' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
            },
            tags: ['canMove', 'canFacing'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              finish: { target: 'idle' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
            },
          },
          hadouken: {
            entry: 'playHadouken',
            exit: 'exitHadouken',
            on: {
              finish: { target: 'idle' },
              weak: { target: 'weak' },
            },
            tags: ['canMove', 'canFacing'],
          },
          hit: {
            entry: ['decreaseHealth', 'playHit'],
            always: [{ target: 'dead', actions: 'dead', cond: 'isDead' }],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          dead: {
            type: 'final',
          },
        },
      },
      {
        actions: {
          decreaseHealth: assign({ health: (context, event) => context.health - (g.isDamage ? 10 : 0) }),

          playIdle: () => {
            this.fadeToAction('idle', 0.2)

            this.shield.visible = true
          },
          playWeak: () => {
            this.shield.visible = false
          },
          playRun: () => {
            this.fadeToAction('running', 0.2)
            // this.fadeToAction('walking', 0.2)
          },
          playAttack: () => {
            this.fadeToAction('dance', 0.2)
          },
          playHadouken: () => {
            this.hadouken.start()

            this.timeoutHadouken = setTimeout(() => {
              this.service.send('finish')
            }, 7000)
          },
          exitHadouken: () => {
            clearTimeout(this.timeoutHadouken)
            this.hadouken.stop()
          },
          playHit: (context, event, o) => {
            this.fadeToAction('jump', 0.2)

            new Splash(event.collideEvent)
          },
          dead: () => {
            this.fadeToAction('death', 0.2)
            this.body.collisionFilterMask = g.GROUP_SCENE
            setTimeout(() => {
              this.body.velocity.set(0, 0, 0)
            }, 0)

            // let interval
            // setTimeout(() => {
            //   interval = setInterval(() => {
            //     // this.mesh.position.y-=.001
            //     this.body.velocity.set(0, 0, 0) // continuously clear velocity, otherwise may not cleared.
            //     this.body.collisionResponse = false
            //     this.body.position.y -= 0.0005
            //     // console.log('interval')
            //     setTimeout(() => {
            //       clearInterval(interval)
            //       // },5000)
            //     }, 2000)
            //   })
            // }, 2000)
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
      if (state.changed) console.log('robotBoss: state:', state.value)
      // if (state.changed) console.log(state.value,state)
      // this.currentState = state.value
      ///currentState === this.service.state.value
    })

    // Start the service
    this.service.start()
    // => 'pending'

    // this.service.send( 'idle' )
    // => 'resolved'

    this.mass = 50 * 3.8 * 3.8 * 3.8
    this.bodyRadius = 0.6 * 3.8
    this.body = new CANNON.Body({
      mass: this.mass,
      collisionFilterGroup: g.GROUP_ENEMY,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ROLE_ATTACKER,
    })
    this.body.belongTo = this
    let shape = new CANNON.Sphere(this.bodyRadius)
    // let shape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, 3, 8)
    // let shape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, 5, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(shape)
    this.body.position.copy(this.position)
    world.addBody(this.body)

    this.body.addEventListener('beginContact', (event) => {
      if (!event.body.belongTo?.isAttacker && !event.body.belongTo?.isTrigger) {
        this.service.send('land')
        this.isAir = false
        // this.body.mass = this.mass
      }
    })

    // setInterval(() => {
    //   this.service.send('attack')
    // }, 3000)

    //

    this.hadouken = new RobotBossHadouken({
      owner: this,
    })

    this.weakness = new RobotBossWeakness({
      owner: this,
    })
  }

  update(dt) {
    if (this.service.state.value === 'loading') return
    this.mixer.update(dt)
    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodyRadius, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z

    // if (!window.role?.gltf) return
    // if (this.service.state.value !== 'dead') {
    //   {
    //     // look at role
    //     let vec2_diff = vec2(role.mesh.position.x - this.mesh.position.x, role.mesh.position.z - this.mesh.position.z)
    //     let angle = vec2_diff.angle()
    //     // console.log(angle)
    //     this.mesh.rotation.y = -angle + Math.PI / 2
    //   }
    // }
  }

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
        './model/RobotExpressive/RobotExpressive.glb',
        (gltf) => {
          // console.log('robotBoss loaded')
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
          this.mesh.scale.set(1, 1, 1)
          // mesh.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.mesh)
          gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action
            if (['jump', 'punch', 'dance'].includes(name)) {
              action.loop = THREE.LoopOnce
            }
            if (['death'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
            this.oaction.dance.timeScale = 3
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (event) => {
            // console.log('finished')
            this.service.send('finish')
          })

          //

          this.shield = new THREE.Mesh(
            new THREE.IcosahedronGeometry(this.bodyRadius * 1.2, 2),
            new THREE.MeshBasicMaterial({
              color: 0xffff00,
              transparent: true,
              opacity: 0.3,
            })
          )
          this.shield.position.y = this.bodyRadius
          this.mesh.add(this.shield)

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

export { RobotBoss }
