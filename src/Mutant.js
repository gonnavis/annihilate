import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { Splash } from './Splash.js'

class Mutant {
  constructor({ position }) {
    this.isCharacter = true
    this.isEnemy = true

    updates.push(this)

    this.health = 100
    this.oaction = {}
    this.mixer
    this.attackSpeed = 0.5
    this.tmpVec3 = new THREE.Vector3()
    this.isAir = false
    this.airLiftVelocity = 1.5
    this.position = position
    this.initialPosition = this.position.clone()

    // for RoleControls.js
    this.direction = new THREE.Vector2() // direction may be zero length.
    this.facing = new THREE.Vector2(0, 1) // facing always not zero length.
    // this.speed = 0.15
    this.speed = 0.04

    // for Ai.js
    this.detectorRadius = 10

    // pseudo shadow
    // const geometry = new THREE.CircleGeometry(1.7, 32)
    // const material = new THREE.ShaderMaterial({
    //   transparent: true,
    //   vertexShader: `
    //     varying vec2 vUv;
    //     void main(){
    //       vUv = uv;
    //       gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);
    //     }
    //   `,
    //   fragmentShader: `
    //     varying vec2 vUv;
    //     void main(){
    //       // gl_FragColor = vec4(0,0,0,(1.-length(vUv*2.-1.))*.5);
    //       gl_FragColor = vec4(0,0,0,smoothstep(.0,.9,1.-length(vUv*2.-1.))*.3);
    //     }
    //   `,
    // })
    // this.shadow = new THREE.Mesh(geometry, material) // pseudo shadow
    // this.shadow.rotation.x = -Math.PI / 2
    // this.shadow.position.y = 0.01
    // this.shadow.renderOrder = 1 // need same as position.y order of all pseudo shadows
    // scene.add(this.shadow)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'mutant',
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
              attack: { target: 'attackStartWithCharge' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
            tags: ['canFacing'],
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attackStartWithCharge' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
            tags: ['canMove', 'canFacing'],
          },
          attackStartWithCharge: {
            entry: 'playAttackStart',
            on: {
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },

            initial: 'withCharge',
            states: {
              withCharge: {
                on: {
                  finish: { target: '#mutant.charging' },
                  keyJUp: { target: 'noCharge' },
                },
              },
              noCharge: {
                on: {
                  finish: { target: '#mutant.attack' },
                },
              },
            },
          },
          charging: {
            entry: 'playCharging',
            exit: 'exitCharging',
            on: {
              keyJUp: { target: 'attack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              finish: { target: 'charged1' },
            },
          },
          charged1: {
            entry: 'playCharged1',
            exit: 'exitCharged1',
            on: {
              keyJUp: { target: 'chargeAttack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          chargeAttack: {
            entry: 'playChargeAttack',
            on: {
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
              finish: { target: 'idle' },
            },
            tags: ['canDamage'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],

            initial: 'main',
            states: {
              main: {
                on: {
                  finish: { target: '#mutant.idle' },
                  attack: { target: 'prepareNext' },
                },
              },
              prepareNext: {
                on: {
                  finish: { target: '#mutant.fist' },
                },
              },
            },
          },
          fist: {
            entry: 'playFist',
            on: {
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
            // tags: ['canDamage'], // TODO: Add fist body.

            initial: 'main',
            states: {
              main: {
                on: {
                  finish: { target: '#mutant.idle' },
                  attack: { target: 'prepareNext' },
                },
              },
              prepareNext: {
                on: {
                  finish: { target: '#mutant.strikeStart' },
                },
              },
            },
          },
          strikeStart: {
            entry: 'playStrikeStart',
            on: {
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
          },
          strike: {
            // top down strike
            entry: 'playStrike',
            on: {
              finish: { target: 'strikeEnd' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strikeEnd: {
            entry: 'playStrikeEnd',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'dash' },
            },
          },
          jumpAttackStart: {
            entry: ['playJumpAttackStart'],
            on: {
              finish: { target: 'jumpAttack' },
              hit: { target: 'hit' },
              // dash: { target: 'dash' },
            },
          },
          jumpAttack: {
            entry: ['playJumpAttack'],
            on: {
              finish: { target: 'jumpAttackEnd' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
            },
            tags: ['canDamage'],
          },
          jumpAttackEnd: {
            entry: ['playJumpAttackEnd'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
            },
          },
          jump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttackStart' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove', 'canFacing'],
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttackStart' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove', 'canFacing'],
          },
          hit: {
            entry: ['playHit'],
            on: {
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' }, // todo: knockDown only when hit.
              finish: { target: 'idle' },
              dead: { target: 'dead' },
            },
          },
          airHit: {
            // todo
          },
          knockDown: {
            entry: ['playKnockDown'],
            on: {
              finish: { target: 'idle' },
              dead: { target: 'dead' },
            },
          },
          dash: {
            entry: 'entryDash',
            after: {
              300: { target: 'idle' },
            },
            on: {
              attack: { target: 'dashAttack' },
            },
          },
          dashAttack: {
            entry: 'playDashAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              knockDown: { target: 'knockDown' },
            },
            tags: ['canDamage'],
          },
          jumpDash: {
            entry: 'entryJumpDash',
            on: {
              land: { target: 'idle' },
            },
            exit: 'exitJumpDash',
          },
          dead: {
            entry: 'playDead',
            type: 'final',
          },
        },
      },
      {
        actions: {
          playCharging: () => {
            // charging hint
            let to = { t: 0 }
            this.tweenCharging = gsap.to(to, {
              duration: 0.5,
              t: 1,
              onUpdate: () => {
                let chargeHintIntensity = to.t ** 2 * 0.5
                this.mesh.traverseVisible((child) => {
                  if (child.material) {
                    child.material.emissive.setRGB(0, chargeHintIntensity, chargeHintIntensity)
                  }
                })
              },
              onComplete: () => {
                this.service.send('finish')
              },
            })
          },
          exitCharging: () => {
            this.tweenCharging.kill()
            this.mesh.traverseVisible((child) => {
              if (child.material) {
                child.material.emissive.setScalar(0)
              }
            })
          },
          playCharged1: () => {
            this.mesh.traverseVisible((child) => {
              if (child.material) {
                child.material.emissive.setScalar(0.7)
              }
            })
          },
          exitCharged1: () => {
            this.mesh.traverseVisible((child) => {
              if (child.material) {
                child.material.emissive.setScalar(0)
              }
            })
          },
          entryDash: () => {
            this.fadeToAction('dash', 0.2)
            this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(15)
            this.body.velocity.x = this.tmpVec3.x
            // this.body.velocity.y = 0
            this.body.velocity.z = this.tmpVec3.z
          },
          entryJumpDash: () => {
            this.fadeToAction('dash', 0.2)
            this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(11)
            this.body.velocity.x = this.tmpVec3.x
            // this.body.velocity.y = 0
            this.body.velocity.z = this.tmpVec3.z
          },
          playIdle: () => {
            this.fadeToAction('idle', 0.2)
          },
          playRun: () => {
            this.fadeToAction('running', 0.2)
          },
          playAttackStart: () => {
            this.oaction['punchStart'].timeScale = this.attackSpeed
            this.fadeToAction('punchStart')
          },
          playAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0.2)
          },
          playChargeAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0.2)

            this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(20)
            this.body.velocity.x = this.tmpVec3.x // TODO: Use gsap position, to prevent combine with pop?
            // this.body.velocity.y = 0
            this.body.velocity.z = this.tmpVec3.z
          },
          playDashAttack: () => {
            this.fadeToAction('punch', 0.2)
            let to = { t: 0 }
            let _rotationY = this.mesh.rotation.y
            gsap.to(to, {
              duration: 0.5,
              t: -Math.PI * 2,
              onUpdate: () => {
                // console.log(to.t)
                this.mesh.rotation.y = _rotationY + to.t
              },
            })
          },
          playFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed
            this.fadeToAction('fist', 0.2)
          },
          playStrikeStart: () => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed
            this.fadeToAction('jumpAttackStart')
          },
          playStrike: () => {
            this.oaction['jumpAttack'].timeScale = this.attackSpeed
            this.fadeToAction('jumpAttack', 0.2)
            // this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(15)
            // console.log(this.tmpVec3)
            // this.body.velocity.x = this.tmpVec3.x
            // this.body.velocity.y = 30
            // this.body.velocity.z = this.tmpVec3.z
            // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            // setTimeout(() => {
            //   // this.body.velocity.y -= downVelocity
            //   this.body.velocity.y = -this.body.position.y * 5
            // }, 200)
          },
          playStrikeEnd: () => {
            this.oaction['jumpAttackEnd'].timeScale = this.attackSpeed
            this.fadeToAction('jumpAttackEnd', 0)
          },
          playJumpAttackStart: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttackStart')

            this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(5.5)
            // console.log(this.tmpVec3)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.y = 20
            this.body.velocity.z = this.tmpVec3.z
          },
          playJumpAttack: (context, event, o) => {
            this.fadeToAction('jumpAttack', 0.2)

            // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            // this.body.velocity.y -= downVelocity
            this.body.velocity.y = -this.body.position.y * 1.85
          },
          playJumpAttackEnd: (context, event, o) => {
            this.oaction['jumpAttackEnd'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttackEnd')
          },
          jump: () => {
            this.body.velocity.y = 7.41
          },
          playJump: () => {
            this.fadeToAction('jump', 0.2)
          },
          playHit: (context, event, o) => {
            this.fadeToAction('hit', 0.2)

            new Splash(event.collideEvent)

            if (this.isAir) {
              this.body.velocity.y = this.airLiftVelocity
            }
            // console.log('playHit', this.body.mass, this.isAir)
          },
          playKnockDown: (context, event, o) => {
            // this.oaction['knockDown'].timeScale = 2
            this.fadeToAction('knockDown', 0.2)

            new Splash(event.collideEvent)
          },
          playDead: (context, event, o) => {
            // this.oaction['knockDown'].timeScale = 2
            this.fadeToAction('knockDown', 0.2)

            new Splash(event.collideEvent)

            // this.body.collisionResponse = false
            this.body.collisionFilterMask = g.GROUP_SCENE
            setTimeout(() => {
              this.body.velocity.set(0, 0, 0)
            }, 0)
          },
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('mutant: state:', state.value)
      // console.log(state)
      // if (state.changed) console.log(state)
      // this.currentState = state.value
      ///currentState === this.service.state.value
    })

    // Start the service
    this.service.start()
    // => 'pending'

    // this.service.send( 'idle' )
    // => 'resolved'

    let physicsMaterial = new CANNON.Material({
      friction: 0,
    })
    this.mass = 100
    this.body = new CANNON.Body({
      mass: this.mass,
      // material: physicsMaterial,
      collisionFilterGroup: g.GROUP_ENEMY,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ROLE_ATTACKER,
    })
    this.body.belongTo = this

    this.bodyRadius = 0.5 // Cover the shoulders.
    this.bodyHeight = 1.65
    // this.bodyHeight = 10
    this.bodyCylinderHeight = this.bodyHeight - this.bodyRadius * 2
    let sphereShape = new CANNON.Sphere(this.bodyRadius)
    let cylinderShape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyCylinderHeight, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.fixedRotation = true
    this.body.addShape(sphereShape, new CANNON.Vec3(0, this.bodyCylinderHeight / 2, 0))
    this.body.addShape(sphereShape, new CANNON.Vec3(0, -this.bodyCylinderHeight / 2, 0))
    this.body.addShape(cylinderShape)

    this.body.position.copy(this.position) ///formal
    // this.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(this.body)
    // this.body.addEventListener('collide', (event) => {
    this.body.addEventListener('beginContact', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      // if (event.body !== window.axes.body) {
      ///todo: Is cannon.js has collision mask?
      // todo: refactor: window.ground

      // if (!event.body.isTrigger) {
      // if (event.body === window.ground.body) {
      if (!event.body.belongTo?.isAttacker && !event.body.belongTo?.isTrigger) {
        this.service.send('land')
        this.isAir = false
      }
      // }
    })
  }

  update(dt) {
    if (this.service.state.matches('loading')) return
    // console.log(this.isAir, this.body.mass)

    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodyHeight / 2, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z
    this.mixer.update(dt)
  }

  hit(collideEvent) {
    // console.log('hit()')
    if (g.isDamage) this.health -= 17 // need decrease in playHit().
    // todo: Add hit2 state to prevent multiple hits in one attack?
    //   Or use beginContact instead of collide event?
    //   Both?
    // console.log(this.health)
    this.service.send('hit', { collideEvent })
    if (this.health <= 0) {
      this.service.send('dead', { collideEvent })
    }
  }

  knockDown(collideEvent) {
    // console.log('knockDown()')
    if (g.isDamage) this.health -= 17 // todo: Merge with hit(). // need decrease in playKnockDown().
    // console.log(this.health)
    this.service.send('knockDown', { collideEvent })
    if (this.health <= 0) {
      this.service.send('dead', { collideEvent })
    }
  }

  load(callback) {
    return new Promise((resolve, reject) => {
      var loader = new GLTFLoader()
      loader.load(
        './model/mutant/a.gltf',
        // '/_3d_model/mixamo/Mutant/a/a.gltf',
        (gltf) => {
          // console.log(gltf.animations)
          this.gltf = gltf
          this.mesh = this.gltf.scene

          this.rightEquipDelegate = new THREE.Object3D()
          this.rightEquipDelegate.rotation.x = 1.3
          this.rightEquipBone = this.mesh.getObjectByName('KnifeTip')
          this.rightEquipBone.add(this.rightEquipDelegate)

          this.mesh.traverse((child) => {
            child.castShadow = true
            child.receiveShadow = true
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/mutant/a.jpg')
              // child.material.map = new THREE.TextureLoader().load('/_3d_model/mixamo/Mutant/a/a.jpg')
              child.material.map.flipY = false
              child.material.map.encoding = THREE.sRGBEncoding
              child.material.skinning = true
            }
          })
          scene.add(this.mesh)
          this.mesh.scale.setScalar(1)
          // this.mesh.scale.setScalar(2.7)
          // this.mesh.scale.set(.7,.7,.7)
          // this.mesh.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.mesh)
          this.gltf.animations.forEach((animation) => {
            // let name = animation.name.toLowerCase()
            let name = animation.name
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action
            // if ([].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }
            if (['jump', 'punch', 'punchStart', 'fist', 'jumpAttack', 'jumpAttackStart', 'jumpAttackEnd', 'dash', 'hit', 'knockDown'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (event) => {
            this.service.send('finish')
          })
          this.service.send('loaded')
          resolve()

          if (callback) callback()
        },
        undefined,
        (event) => {
          console.error(event)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration = 0.1) {
    let nextAction = this.oaction[name]

    if (duration > 0) {
      // fade
      nextAction.reset()
      nextAction.play()
      this.action_act.crossFadeTo(nextAction, duration)
      // Note: If action_act loopOnce, need crossFade before finished. Or clampWhenFinished.
      this.action_act = nextAction
    } else {
      // not fade
      this.action_act.stop()
      nextAction.reset().play()
      this.action_act = nextAction
    }
  }
}

export { Mutant }
