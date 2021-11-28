import { g } from './global.js'

import * as THREE from './lib/three.js/build/three.module.js'
import { SwordBlaster } from './SwordBlaster.js'
import { GLTFLoader } from './lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { SwordBlink } from './SwordBlink.js'

class Maria {
  constructor(x, y, z) {
    this.isCharacter = true
    this.isRole = true

    updates.push(this)

    this.health = 100
    this.oaction = {}
    this.mixer
    // this.speed = 0.15
    this.speed = 0.3
    // this.attackSpeed = 1.2
    this.attackSpeed = 1.4
    this.chargeAttackCoe = 2
    this.tmpVec3 = new THREE.Vector3()
    this.direction = vec2() // direction may be zero length.
    this.facing = vec2(0, 1) // facing always not zero length.
    this.mass = 80
    this.chargedLevel = 0 // 0: normal/slow combo | 1: fast combo | 2: fast combo & swordBlaster

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
        id: 'maria',
        context: {
          health: 100,
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
              attack: { target: 'attackStartWithCharge' },
              bash: { target: 'bashStart' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              blocked: { target: 'blocked' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attackStartWithCharge' },
              bash: { target: 'bashStart' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // blocked: { target: 'blocked' }, // Note: Can block when running or in other states? No, more by intended operation, less by luck.
            },
            tags: ['canMove'],
          },
          bashStart: {
            entry: 'playBashStart',
            on: {
              finish: { target: 'whirlwind' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              keyUUp: { target: 'bashStartNotWhirlwind' },
            },
          },
          bashStartNotWhirlwind: {
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },

          attackStartWithCharge: {
            entry: 'playAttackStart',
            on: {
              finish: { target: 'charging' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              keyJUp: { target: 'attackStart' },
            },
          },
          charging: {
            on: {
              keyJUp: { target: 'attack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            after: {
              500: { target: 'charged1' },
            },
          },
          charged1: {
            entry: 'playCharged1',
            on: {
              keyJUp: { target: 'chargeAttack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            after: {
              500: { target: 'charged2' },
            },
          },
          charged2: {
            entry: 'playCharged2',
            on: {
              keyJUp: { target: 'chargeAttack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          chargeAttack: {
            entry: 'playChargeAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              attack: { target: 'prepareChargeFist' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          prepareChargeFist: {
            on: {
              finish: { target: 'chargeFistStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          chargeFistStart: {
            entry: 'playChargeFistStart',
            on: {
              finish: { target: 'chargeFist' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          chargeFist: {
            entry: 'playChargeFist',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              attack: { target: 'prepareChargeStrike' },
            },
            tags: ['canDamage'],
          },
          prepareChargeStrike: {
            on: {
              finish: { target: 'chargeStrikeStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          chargeStrikeStart: {
            entry: 'playChargeStrikeStart',
            on: {
              finish: { target: 'chargeStrike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          chargeStrike: {
            entry: 'playChargeStrike',
            on: {
              finish: { target: 'chargeStrikeEnd' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'knockDown'],
          },
          chargeStrikeEnd: {
            entry: 'playChargeStrikeEnd',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },

          attackStart: {
            on: {
              // finish: { target: 'whirlwind' },
              finish: { target: 'attack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // keyJUp: { target: 'attackStartNotWhirlwind' },
            },
          },
          attackStartNotWhirlwind: {
            on: {
              finish: { target: 'attack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          attack: {
            entry: 'playAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              attack: { target: 'prepareFist' },
              dash: { target: 'dash' },

              // whirlwind: { target: 'whirlwind' },
            },
            tags: ['canDamage'],
          },
          prepareFist: {
            on: {
              finish: { target: 'fistStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          fistStart: {
            entry: 'playFistStart',
            on: {
              finish: { target: 'fist' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          fist: {
            entry: 'playFist',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              attack: { target: 'prepareStrike' },
            },
            tags: ['canDamage'],
          },
          prepareStrike: {
            on: {
              finish: { target: 'strikeStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strikeStart: {
            entry: 'playStrikeStart',
            on: {
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          strike: {
            entry: 'playStrike',
            on: {
              finish: { target: 'strikeEnd' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'knockDown'],
          },
          strikeEnd: {
            entry: 'playStrikeEnd',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          jumpAttackStartWithCharge: {
            entry: ['playJumpAttackStartWithCharge'],
            on: {
              finish: { target: 'jumpChargeAttack' },
              hit: { target: 'hit' },
              // dash: { target: 'dash' },

              keyJUp: { target: 'jumpAttackStart' },
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
          jumpChargeAttack: {
            entry: ['playJumpChargeAttack'],
            on: {
              finish: { target: 'jumpAttackEnd' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          jumpAttack: {
            entry: ['playJumpAttack'],
            on: {
              finish: { target: 'jumpAttackEnd' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
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
              attack: { target: 'jumpAttackStartWithCharge' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttackStartWithCharge' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          hit: {
            entry: ['playHit'],
            on: {
              hit: { target: 'hit' },
              finish: { target: 'idle' },
            },
          },
          blocked: {
            entry: ['playBlocked'],
            on: {
              finish: { target: 'idle' },
            },
          },
          dash: {
            entry: 'playDash',
            on: {
              attack: { target: 'dashAttack' },
            },
            after: {
              300: { target: 'idle' },
            },
          },
          dashAttack: {
            entry: 'playDashAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
            tags: ['canDamage'],
          },
          jumpDash: {
            entry: 'playJumpDash',
            on: {
              land: { target: 'idle' },
            },
            exit: 'exitJumpDash',
          },
          whirlwind: {
            entry: 'playWhirlwind',
            exit: 'exitWhirlwind',
            on: {
              // keyJDown: { target: 'whirlwind' },
              // finish: { target: 'idle' },
              // finish: { target: 'attack' },
              keyUUp: { target: 'attack' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
        },
      },
      {
        actions: {
          playDash: () => {
            this.oaction['dash'].timeScale = 2
            this.fadeToAction('dash')

            // force change facing
            if (this.direction.lengthSq() > 0) {
              this.facing.copy(this.direction)
            }
            // console.log(this.facing)
            this.mesh.rotation.y = -this.facing.angle() + Math.PI / 2

            // move

            // move use velocity, will affected by restitution, so ground or air different.
            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(60)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.z = this.tmpVec3.z

            // // move use initial pos + absolute bias, can't use, will cause big problem.
            // // Related to world.defaultContactMaterial.contactEquationRelaxation.
            // let to = { t: 0 }
            // let _posX = this.body.position.x
            // let _posZ = this.body.position.z
            // this.tweenDash = gsap.to(to, {
            //   duration: 0.3,
            //   t: 1,
            //   // ease: 'none',
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     this.body.position.x = _posX + this.facing.x * to.t * 50
            //     this.body.position.z = _posZ + this.facing.y * to.t * 50
            //   },
            //   // onComplete: () => {
            //   //   this.service.send('finish')
            //   // },
            // })

            // // move use per frame delta. Same problem as initial pos + absolute bias, why?
            // let to = { t: 0 }
            // this.tweenDash = gsap.to(to, {
            //   duration: 0.3,
            //   t: 1,
            //   // ease: 'none',
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     this.body.position.x += this.facing.x * 3
            //     this.body.position.z += this.facing.y * 3
            //   },
            //   // onComplete: () => {
            //   //   this.service.send('finish')
            //   // },
            // })
          },
          playJumpDash: () => {
            this.fadeToAction('dash', 0)

            // change facing
            this.mesh.rotation.y = -this.facing.angle() + Math.PI / 2
            // move
            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(30)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.z = this.tmpVec3.z
          },
          playIdle: () => {
            this.fadeToAction('idle')

            this.chargedLevel = 0
            this.sword.material.emissive.setScalar(0)
            this.sword.material.color.setRGB(1, 1, 1)
          },
          playRun: () => {
            this.fadeToAction('running')
          },
          playBashStart: () => {
            this.oaction['punchStart'].timeScale = this.attackSpeed
            this.fadeToAction('punchStart')
          },
          playAttackStart: () => {
            this.oaction['punchStart'].timeScale = this.attackSpeed
            this.fadeToAction('punchStart')
          },
          playAttack: () => {
            // if (roleControls.okey.KeyJ) {
            //   // todo: refactor: not access roleControls here.
            //   this.service.send('whirlwind')
            // } else {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0)
            // }
          },
          playCharged1: () => {
            this.chargedLevel = 1
            this.sword.material.emissive.setScalar(0.3)

            this.swordBlink.blink(1)
          },
          playCharged2: () => {
            this.chargedLevel = 2
            maria.sword.material.color.setRGB(0, 1, 1)

            this.swordBlink.blink(2)
          },
          playChargeAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('punch', 0)

            if (this.chargedLevel === 2) {
              let swordBlaster = new SwordBlaster(this, 1)
            }
          },
          playDashAttack: () => {
            this.oaction['dashAttack'].timeScale = this.attackSpeed
            this.fadeToAction('dashAttack')

            // setTimeout(() => {
            //   this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(70)
            //   this.body.velocity.x = this.tmpVec3.x
            //   this.body.velocity.z = this.tmpVec3.z
            // }, 100)

            // let to = { t: 0 }
            // let _rotationY = this.mesh.rotation.y
            // gsap.to(to, {
            //   duration: 0.5,
            //   t: -Math.PI * 2,
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     this.mesh.rotation.y = _rotationY + to.t
            //   },
            // })
          },
          playFistStart: () => {
            this.oaction['fistStart'].timeScale = this.attackSpeed
            this.fadeToAction('fistStart')
          },
          playChargeFistStart: () => {
            this.oaction['fistStart'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('fistStart')
          },
          playFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed
            this.fadeToAction('fist', 0)
          },
          playChargeFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('fist', 0)

            if (this.chargedLevel === 2) {
              let swordBlaster = new SwordBlaster(this, 2)
            }
          },
          playStrikeStart: () => {
            this.oaction['strikeStart'].timeScale = this.attackSpeed
            this.fadeToAction('strikeStart')
          },
          playChargeStrikeStart: () => {
            this.oaction['strikeStart'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('strikeStart')
          },
          playStrike: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0)
          },
          playChargeStrike: () => {
            this.oaction['strike'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('strike', 0)

            if (this.chargedLevel === 2) {
              let swordBlaster = new SwordBlaster(this, 3)
            }
          },
          playStrikeEnd: () => {
            this.oaction['strikeEnd'].timeScale = this.attackSpeed
            this.fadeToAction('strikeEnd', 0)
          },
          playChargeStrikeEnd: () => {
            this.oaction['strikeEnd'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('strikeEnd', 0)
          },
          playJumpAttackStartWithCharge: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed * 0.6
            this.fadeToAction('jumpAttackStart')

            // this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(10)
            // this.body.velocity.x = this.tmpVec3.x
            // this.body.velocity.y = 20
            // this.body.velocity.z = this.tmpVec3.z

            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          playJumpAttackStart: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed * 4
            // this.fadeToAction('jumpAttackStart')

            this.body.mass = this.mass

            // this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(10)
            // this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.y = 20
            // this.body.velocity.z = this.tmpVec3.z
          },
          playJumpAttack: (context, event, o) => {
            this.oaction['jumpAttack'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttack')

            this.body.velocity.y = -this.body.position.y * 5
          },
          playJumpChargeAttack: (context, event, o) => {
            this.oaction['jumpAttack'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttack')

            this.body.mass = this.mass
            this.body.velocity.y = -this.body.position.y * 5
          },
          playJumpAttackEnd: (context, event, o) => {
            this.oaction['jumpAttackEnd'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttackEnd')
          },
          jump: () => {
            this.body.velocity.y = 20
          },
          playJump: () => {
            this.fadeToAction('jump')
          },
          playHit: () => {
            this.oaction['hit'].timeScale = 3
            this.fadeToAction('hit')
          },
          playBlocked: () => {
            this.fadeToAction('impact')
          },
          playWhirlwind: () => {
            this.fadeToAction('whirlwind', 0)

            // console.log(111)
            let to = { t: 0 }
            let _rotationY = this.mesh.rotation.y
            this.tweenWhirlwind = gsap.to(to, {
              duration: 0.3,
              t: Math.PI * 2,
              repeat: Infinity,
              ease: 'none',
              onUpdate: () => {
                // console.log(to.t)
                this.mesh.rotation.y = _rotationY + to.t
              },
              // onComplete: () => {
              //   this.service.send('finish')
              // },
            })
          },
          exitWhirlwind: () => {
            this.tweenWhirlwind.kill()
          },
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      if (state.changed) console.log('maria: state:', state.value)
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
    this.body = new CANNON.Body({
      mass: this.mass,
      // material: physicsMaterial,
      collisionFilterGroup: g.GROUP_ROLE,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ENEMY_WEAPON,
    })
    this.body.belongTo = this

    this.bodyRadius = 1
    this.bodyHeight = 4.5
    // this.bodyHeight = 10
    this.bodyCylinderHeight = this.bodyHeight - this.bodyRadius * 2
    let sphereShape = new CANNON.Sphere(this.bodyRadius)
    let cylinderShape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyCylinderHeight, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(sphereShape, new CANNON.Vec3(0, this.bodyCylinderHeight / 2, 0))
    this.body.addShape(sphereShape, new CANNON.Vec3(0, -this.bodyCylinderHeight / 2, 0))
    this.body.addShape(cylinderShape)

    this.body.position.set(x, y, z) ///formal
    // this.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(this.body)
    // this.body.addEventListener('collide', (event) => {
    this.body.addEventListener('beginContact', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      if (event.body !== window.greatSword.body && !event.body.isTrigger) {
        ///todo: Is cannon.js has collision mask?
        // todo: refactor: window.ground
        this.service.send('land')
      }
    })
  }

  update(dt) {
    if (this.service.state.matches('loading')) return

    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodyHeight / 2, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z
    this.mixer.update(dt)
  }

  hit() {
    // console.log('hit()')
    // this.health-=50
    // console.log(this.health)
    // if(this.health<=0){
    //   this.service.send('dead')
    // }else{
    this.service.send('hit')
    // }
  }

  load(callback) {
    return new Promise((resolve, reject) => {
      var loader = new GLTFLoader()
      loader.load(
        './model/maria/all.gltf',
        (gltf) => {
          // console.log(gltf.animations)
          this.gltf = gltf
          this.mesh = this.gltf.scene

          this.mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              child.material = new THREE.MeshStandardMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/maria/maria_diffuse.jpg')
              child.material.map.flipY = false
              child.material.map.encoding = THREE.sRGBEncoding
              child.material.skinning = true
            }
          })

          scene.add(this.mesh)
          this.mesh.scale.setScalar(2.7)
          // this.mesh.scale.set(.7,.7,.7)
          // this.mesh.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.mesh)
          this.gltf.animations.forEach((animation) => {
            // let name = animation.name.toLowerCase()
            let name = animation.name
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action

            // if (['jump', 'punch', 'fist', 'jumpattack', 'dodge', 'hit'].includes(name)) {
            // if ([].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }

            if (['punch', 'punchStart', 'fist', 'fistStart', 'jumpAttack', 'jumpAttackStart', 'jumpAttackEnd', 'strike', 'strikeStart', 'strikeEnd', 'hit', 'impact', 'jump', 'dashAttack', 'dash', 'whirlwind'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (e) => {
            // console.log('finished ------------------------------------------------')
            // if (this.action_act === this.oaction.punchStart) {
            //   this.service.send('whirlwind')
            // } else {
            this.service.send('finish')
            // }
          })

          //

          this.swordDelegate = new THREE.Object3D()

          // this.swordDelegate.position.x = -28.34566578619436 // -0.765333 / maria.swordBone.getWorldScale(new THREE.Vector3()).x
          this.swordDelegate.position.x = -26.34566578619436
          // this.swordDelegate.position.y = -0.9035928499267991 // -0.024397 / maria.swordBone.getWorldScale(new THREE.Vector3()).y
          this.swordDelegate.position.y = 7.096407150073201
          // this.swordDelegate.position.z = 52.96816695583054 // 1.43014 / maria.swordBone.getWorldScale(new THREE.Vector3()).z
          this.swordDelegate.position.z = 46.96816695583054

          this.swordDelegate.rotation.x = -0.14150082377618828 // -8.1074*THREE.Math.DEG2RAD
          // this.swordDelegate.rotation.x = -0.21150082377618826
          // this.swordDelegate.rotation.y = -0.5987526531891747 // -34.306*THREE.Math.DEG2RAD
          this.swordDelegate.rotation.y = -0.5387526531891745
          // this.swordDelegate.rotation.z = 0.4663257961941049 // 26.7185*THREE.Math.DEG2RAD
          this.swordDelegate.rotation.z = -0.6

          this.swordBone = this.mesh.getObjectByName('sword_joint')
          this.swordBone.add(this.swordDelegate)

          this.sword = this.mesh.getObjectByName('Maria_sword')

          this.swordBlink = new SwordBlink()
          // scene.add(swordBlink.mesh)
          this.swordDelegate.add(this.swordBlink.mesh)

          //

          this.service.send('loaded')
          resolve()

          if (callback) callback()
        },
        undefined,
        (e) => {
          console.error(e)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration = 0.1) {
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

    let nextAction = this.oaction[name]

    if (duration > 0) {
      // fade
      nextAction.reset()
      // nextAction.stop()
      nextAction.play()
      // nextAction.enabled = true
      // nextAction.setEffectiveTimeScale(1)
      // nextAction.setEffectiveWeight(1)
      // nextAction.time = 0
      this.action_act.crossFadeTo(nextAction, duration)
      // Note: If action_act loopOnce, need crossFade before finished. Or clampWhenFinished.
      this.action_act = nextAction
    } else {
      // not fade
      this.action_act.stop()
      // this.action_act.paused = true
      nextAction.reset().play()
      this.action_act = nextAction
    }
  }

  setFacing(x, z) {
    this.facing.set(x, z)
    this.mesh.rotation.set(0, this.facing.angle() - Math.PI / 2, 0)
  }
}

export { Maria }
