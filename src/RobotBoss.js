import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { Splash } from './Splash.js'
import { RobotBossHadouken } from './RobotBossHadouken.js'
import { RobotBossWhirlwind } from './RobotBossWhirlwind.js'
import { RobotBossPop } from './RobotBossPop.js'
import { RobotBossWeakness } from './RobotBossWeakness.js'

class RobotBoss {
  constructor({ position }) {
    this.isCharacter = true
    this.isEnemy = true
    this.isMassive = true // TODO: Do not move by pop.

    updates.push(this)

    // this.health = 100
    this.oaction = {}
    this.mixer
    this.isAir = false
    this.position = position
    this.initialPosition = this.position.clone()
    this.isWeak = false
    this.hadoukenDuration = 7000
    this.whirlwindDuration = 7000

    // for RoleControls.js
    this.direction = new THREE.Vector2() // direction may be zero length.
    this.facing = new THREE.Vector2(0, 1) // facing always not zero length.
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
              bash: { target: 'whirlwind' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
              dash: { target: 'weak' },
            },
            tags: ['canFacing'],
          },
          pop: {
            // TODO: pop can hit. But be careful not to enter idle state after hit finish before pop complete. Use var isPop instead of pop state?
            entry: 'playPop',
            on: {
              popComplete: { target: 'idle' },
            },
          },
          weak: {
            entry: 'playWeak',
            on: {
              hit: { target: 'hit' }, // TODO√: Hit will into idle and restore shield before stopWeak.
              stopWeak: { target: 'pop' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'hadouken' },
              bash: { target: 'whirlwind' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
              dash: { target: 'weak' },
            },
            tags: ['canMove', 'canFacing'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              finish: { target: 'idle' },
              // hit: { target: 'hit' },
              weak: { target: 'weak' },
              dash: { target: 'weak' },
            },
          },
          hadouken: {
            entry: 'playHadouken',
            exit: 'exitHadouken',
            on: {
              finish: { target: 'idle' },
              weak: { target: 'weak' },
              dash: { target: 'weak' },
            },
            tags: ['canMove', 'canFacing'],
          },
          whirlwind: {
            entry: 'playWhirlwind',
            exit: 'exitWhirlwind',
            on: {
              finish: { target: 'idle' },
              weak: { target: 'weak' },
              dash: { target: 'weak' },
            },
            tags: ['canMove', 'canFacing'],
          },
          hit: {
            entry: ['decreaseHealth', 'playHit'],
            always: [{ target: 'dead', actions: 'dead', cond: 'isDead' }],
            on: {
              finish: [{ target: 'weak', cond: 'isWeak' }, { target: 'pop' }],
              hit: { target: 'hit' },
              stopWeak: { target: 'pop' },
            },
          },
          dead: {
            type: 'final',
          },
        },
      },
      {
        actions: {
          decreaseHealth: assign({ health: (context, event) => context.health - (g.isDamage ? 5 : 0) }),

          playIdle: () => {
            // console.log('playIdle', performance.now())
            this.fadeToAction('idle', 0.2)

            this.shield.visible = true

            this.face.morphTargetInfluences[this.EXPRESSION.ANGRY] = 0
            this.face.morphTargetInfluences[this.EXPRESSION.SURPRISED] = 0
            this.face.morphTargetInfluences[this.EXPRESSION.SAD] = 0

            clearTimeout(this.timeoutStopWeak) // NOTE: Prevent show shiled bug when too fast into next weak.
          },
          playPop: () => {
            this.pop.pop()
          },
          playWeak: () => {
            // console.log('playWeak', performance.now())
            this.fadeToAction('idle', 0.2)

            this.face.morphTargetInfluences[this.EXPRESSION.ANGRY] = 0
            this.face.morphTargetInfluences[this.EXPRESSION.SURPRISED] = 1
            this.face.morphTargetInfluences[this.EXPRESSION.SAD] = 1

            this.shield.visible = false

            this.isWeak = true
            // clearTimeout(this.timeoutStopWeak) // NOTE: Can't clearTimeout here. Hit will reenter weak and reset timeout.
            this.timeoutStopWeak = setTimeout(() => {
              this.isWeak = false
              this.weakness.restore()
              this.ai.service.send('restore')
              this.service.send('stopWeak')
            }, 7000)
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

            this.face.morphTargetInfluences[this.EXPRESSION.ANGRY] = 1
            this.face.morphTargetInfluences[this.EXPRESSION.SURPRISED] = 0
            this.face.morphTargetInfluences[this.EXPRESSION.SAD] = 0

            this.timeoutHadouken = setTimeout(() => {
              this.service.send('finish')
            }, this.hadoukenDuration)
          },
          exitHadouken: () => {
            clearTimeout(this.timeoutHadouken)
            this.hadouken.stop()
          },
          playWhirlwind: () => {
            this.whirlwind.start()

            this.face.morphTargetInfluences[this.EXPRESSION.ANGRY] = 1
            this.face.morphTargetInfluences[this.EXPRESSION.SURPRISED] = 0
            this.face.morphTargetInfluences[this.EXPRESSION.SAD] = 0

            this.timeoutWhirlwind = setTimeout(() => {
              this.service.send('finish')
            }, this.whirlwindDuration)
          },
          exitWhirlwind: () => {
            clearTimeout(this.timeoutWhirlwind)
            this.whirlwind.stop()
          },
          playHit: (context, event, o) => {
            this.fadeToAction('jump', 0.2)

            new Splash(event.collideEvent)
          },
          dead: () => {
            // console.log('dead', performance.now())
            this.fadeToAction('death', 0.2)
            this.body.collisionFilterMask = g.GROUP_SCENE
            setTimeout(() => {
              this.body.velocity.set(0, 0, 0)
            }, 0)

            clearTimeout(this.timeoutStopWeak) // NOTE: Prevent restore weakness after dead.

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
          isWeak: () => {
            return this.isWeak
          },
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      if (state.changed) console.log('robotBoss: state:', state.value, performance.now().toFixed(2))
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
    this.body.fixedRotation = true
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

    this.whirlwind = new RobotBossWhirlwind({
      owner: this,
    })

    this.pop = new RobotBossPop({
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
    //     let vec2_diff = new THREE.Vector2(role.mesh.position.x - this.mesh.position.x, role.mesh.position.z - this.mesh.position.z)
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

          // expressions

          this.face = this.mesh.getObjectByName('Head_4')
          const expressions = Object.keys(this.face.morphTargetDictionary)
          this.EXPRESSION = {}
          for (let i = 0; i < expressions.length; i++) {
            this.EXPRESSION[expressions[i].toUpperCase()] = i
          }

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
