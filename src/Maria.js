import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { SwordBlaster } from './SwordBlaster.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { SwordBlink } from './SwordBlink.js'
import { Pop } from './Pop.js'

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
    // this.landAttackSpeed = 1.4
    // this.airAttackSpeed = 2.5
    this.attackSpeed = 1.4
    this.jumpBashSpeed = this.attackSpeed * 5
    // this.attackSpeed = this.landAttackSpeed
    this.chargeAttackCoe = 2
    this.tmpVec3 = new THREE.Vector3()
    this.direction = vec2() // direction may be zero length.
    this.facing = vec2(0, 1) // facing always not zero length.
    this.mass = 80
    this.chargedLevel = 0 // 0: normal/slow combo | 1: fast combo | 2: fast combo & swordBlaster
    this.isAir = false
    this.liftDistance = 10

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
              launch: { target: 'launchStart' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              block: { target: 'block' },
              // blocked: { target: 'blocked' },
            },
          },
          // jumpIdle: {
          //   entry: 'playJumpIdle',
          //   on: {
          //     land: { target: 'idle' },
          //     attack: { target: 'jumpAttack' },
          //     bash: { target: 'jumpBashStartWithCharge' },
          //     hit: { target: 'hit' },
          //     // dash: { target: 'dash' },
          //     // block: { target: 'block' },
          //     // blocked: { target: 'blocked' },
          //   },
          //   tags: ['canMove'],
          // },
          block: {
            entry: 'playBlock',
            on: {
              keyLUp: { target: 'idle' },
              hadouken: { target: 'hadouken' },
              shoryuken: { target: 'shoryuken' },
              ajejebloken: { target: 'ajejebloken' },
              // Caution: Synchronize the state of roleControls' keyLUp/Down, if add more transitions/states below.
              // run: { target: 'run' },
              // attack: { target: 'attackStartWithCharge' },
              // bash: { target: 'bashStart' },
              // jump: { target: 'jump' },
              // hit: { target: 'hit' },
              // dash: { target: 'dash' },
            },
          },
          hadouken: {
            entry: 'playHadouken',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          shoryuken: {
            entry: 'playShoryuken',
            on: {
              finish: { target: 'drop' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'canLaunch'],
          },
          ajejebloken: {
            entry: 'playAjejebloken',
            exit: 'exitAjejebloken',
            on: {
              // finish: { target: 'idle' },
              hit: { target: 'hit' },
              // dash: { target: 'dash' },
            },
            after: {
              2000: { target: 'idle' },
            },
            tags: ['canDamage'],
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attackStartWithCharge' },
              bash: { target: 'bashStart' },
              launch: { target: 'launchStart' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              air: { target: 'drop' },
              block: { target: 'block' },
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
            entry: ['setAirMassZero'],
            exit: ['restoreMass'],
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
            entry: ['playAttack', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              attack: { target: 'prepareFist' },
              dash: { target: 'dash' },

              // whirlwind: { target: 'whirlwind' },
            },
            tags: ['canDamage'],
          },
          launchStart: {
            entry: 'playLauncStart',
            on: {
              finish: { target: 'launchWithJump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              keyOUp: { target: 'launch' },
            },
            tags: ['canDamage', 'canLaunch'],
          },
          launchWithJump: {
            on: {
              finish: { target: 'drop' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'canLaunch'],
          },
          launch: {
            entry: 'playLaunch',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'canLaunch'],
          },
          prepareFist: {
            entry: ['setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'fistStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          fistStart: {
            entry: ['playFistStart', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'fist' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          fist: {
            entry: ['playFist', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              attack: { target: 'prepareStrike' },
            },
            tags: ['canDamage'],
          },
          prepareStrike: {
            entry: ['setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'strikeStart' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strikeStart: {
            entry: ['playStrikeStart', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          strike: {
            entry: ['playStrike', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'strikeEnd' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage', 'knockDown'],
          },
          strikeEnd: {
            entry: ['playStrikeEnd', 'setAirMassZero'],
            exit: ['restoreMass'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          jumpBashStartWithCharge: {
            entry: ['playJumpBashStartWithCharge'],
            on: {
              finish: { target: 'jumpChargeBash' },
              hit: { target: 'hit' },
              // dash: { target: 'dash' },

              keyUUp: { target: 'jumpBashStart' },
            },
          },
          jumpBashStart: {
            entry: ['playJumpBashStart'],
            on: {
              finish: { target: 'jumpBash' },
              hit: { target: 'hit' },
              // dash: { target: 'dash' },
            },
          },
          jumpChargeBash: {
            entry: ['playJumpChargeBash'],
            on: {
              finish: { target: 'jumpBashEnd' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          jumpBash: {
            entry: ['playJumpBash'],
            on: {
              finish: { target: 'jumpBashEnd' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
            },
            tags: ['canDamage', 'knockDown'],
          },
          jumpBashEnd: {
            entry: ['playJumpBashEnd'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              // // dash: { target: 'dash' },
            },
          },
          jump: {
            entry: ['playJump', 'jump'],
            on: {
              finish: { target: 'drop' },
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              // attack: { target: 'attackStartWithCharge' },
              // attack: { target: 'attack' },
              bash: { target: 'jumpBashStartWithCharge' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          jumpDashToDrop: {
            entry: 'setMassZero',
            exit: 'restoreMass',
            on: {
              finish: { target: 'doubleDrop' },
              land: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          drop: {
            entry: ['playDrop'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              bash: { target: 'jumpBashStartWithCharge' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          doubleDrop: {
            entry: ['playDrop'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              bash: { target: 'jumpBashStartWithCharge' },
              // jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              // dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          jumpAttack: {
            entry: 'playJumpAttack',
            exit: 'exitJumpAttack',
            on: {
              finish: { target: 'drop' },
              // todo: hit jumpDash/airDash
              attack: { target: 'prepareJumpFist' },
            },
            tags: ['canDamage'],
          },
          prepareJumpFist: {
            entry: 'playPrepareJumpFist',
            exit: 'exitPrepareJumpFist',
            on: {
              finish: { target: 'jumpFist' },
            },
          },
          jumpFist: {
            entry: 'playJumpFist',
            exit: 'exitJumpFist',
            on: {
              finish: { target: 'drop' },
              attack: { target: 'prepareJumpStrike' },
            },
            tags: ['canDamage'],
          },
          prepareJumpStrike: {
            entry: 'playPrepareJumpStrike',
            exit: 'exitPrepareJumpStrike',
            on: {
              finish: { target: 'jumpStrike' },
            },
          },
          jumpStrike: {
            entry: 'playJumpStrike',
            exit: 'exitJumpStrike',
            on: {
              finish: { target: 'drop' },
            },
            tags: ['canDamage'],
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              finish: { target: 'doubleDrop' },
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              // attack: { target: 'attackStartWithCharge' },
              bash: { target: 'jumpBashStartWithCharge' },
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
          // blocked: {
          //   entry: ['playBlocked'],
          //   on: {
          //     finish: { target: 'idle' },
          //   },
          // },
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
            entry: ['playJumpDash', 'setMassZero'],
            exit: 'restoreMass',
            on: {
              land: { target: 'idle' },
              air: { target: 'jumpDashToDrop' },
              // finish: { target: 'jumpIdle' },
              finish: { target: 'idle' },
            },
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

            // // Move use initial pos + absolute bias, can't use, will cause big problem ( bounce back and up a lot).
            // // Force set to no collide position when onComplete to solve this problem?
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
            // let initialY = this.body.position.y
            // this.tweenDash = gsap.to(to, {
            //   duration: 0.3,
            //   t: 1,
            //   // ease: 'none',
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     this.body.position.x += this.facing.x * 3
            //     // this.body.position.y = initialY
            //     this.body.position.z += this.facing.y * 3
            //   },
            //   // onComplete: () => {
            //   //   this.service.send('finish')
            //   // },
            // })
          },
          playJumpDash: () => {
            this.fadeToAction('jumpIdle', 0)

            // change facing
            this.mesh.rotation.y = -this.facing.angle() + Math.PI / 2
            // move
            // this.body.mass = 0
            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(30)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.y = 0
            this.body.velocity.z = this.tmpVec3.z
            setTimeout(() => {
              this.body.velocity.set(0, 0, 0)
              this.service.send('finish')
            }, 500)
          },
          playIdle: () => {
            this.fadeToAction('idle')

            this.chargedLevel = 0
            this.sword.material.emissive.setScalar(0)
            this.sword.material.color.setRGB(1, 1, 1)
          },
          playJumpIdle: () => {
            this.fadeToAction('jumpIdle', 0.3)
          },
          playDrop: () => {
            this.fadeToAction('jumpIdle', 0.3)
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
          setMassZero: () => {
            this.body.mass = 0
          },
          setAirMassZero: () => {
            if (this.isAir) {
              this.body.mass = 0
              this.body.velocity.set(0, 0, 0)
            }
          },
          restoreMass: () => {
            this.body.mass = this.mass
          },
          playAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0)
          },
          playLauncStart: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0)

            // console.log('- setTimeout')
            this.timeoutLaunchWithJump = setTimeout(() => {
              // console.log('- do timeout')
              // this.body.velocity.y = 30
              gsap.to(this.body.position, {
                duration: 0.3,
                // y: this.body.position.y + 8, // set 8, lower than launched enemy ( 10 ), to let role can has time to air hit enemy.
                y: this.body.position.y + this.liftDistance,
                onComplete: () => {
                  // let posY = this.body.position.y
                  // gsap.to(this.body.position, {
                  //   duration: 3,
                  //   y: posY,
                  // })
                  this.body.velocity.y = 0 // Prevent too fast drop. Because cannonjs will accumulate drop velocity when direct change position.
                },
              })
              this.service.send('finish')
            }, 150)
          },
          playLaunch: () => {
            // console.log('- clearTimeout')
            clearTimeout(this.timeoutLaunchWithJump)
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
          playHadouken: () => {
            this.oaction['punch'].timeScale = this.attackSpeed * this.chargeAttackCoe
            this.fadeToAction('punch', 0)

            let swordBlaster = new SwordBlaster(this, 3)
          },
          playShoryuken: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0)

            setTimeout(() => {
              // this.body.velocity.y += 30
              gsap.to(this.body.position, {
                duration: 0.3,
                y: this.body.position.y + this.liftDistance,
                onComplete: () => {
                  // let posY = this.body.position.y
                  // gsap.to(this.body.position, {
                  //   duration: 3,
                  //   y: posY,
                  // })
                  this.body.velocity.y = 0 // Prevent too fast drop. Because cannonjs will accumulate drop velocity when direct change position.
                },
              })
              // this.setAir(true)
            }, 150)
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
          playJumpBashStartWithCharge: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed * 0.6
            this.fadeToAction('jumpAttackStart')

            // this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(10)
            // this.body.velocity.x = this.tmpVec3.x
            // this.body.velocity.y = 20
            // this.body.velocity.z = this.tmpVec3.z

            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          playJumpBashStart: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.jumpBashSpeed
            // this.fadeToAction('jumpAttackStart')

            this.body.mass = this.mass

            // this.tmpVec3.set(0, 0, 1).applyEuler(this.mesh.rotation).multiplyScalar(10)
            // this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.y = 20
            // this.body.velocity.z = this.tmpVec3.z
          },
          playJumpAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0)

            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
            // this.body.velocity.y = -this.body.position.y * 5
          },
          exitJumpAttack: () => {
            this.body.mass = this.mass
          },
          playPrepareJumpFist: () => {
            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          exitPrepareJumpFist: () => {
            this.body.mass = this.mass
          },
          playJumpFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed
            this.fadeToAction('fist', 0)

            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          exitJumpFist: () => {
            this.body.mass = this.mass
          },
          playPrepareJumpStrike: () => {
            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          exitPrepareJumpStrike: () => {
            this.body.mass = this.mass
          },
          playJumpStrike: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0)

            this.body.mass = 0
            this.body.velocity.set(0, 0, 0)
          },
          exitJumpStrike: () => {
            this.body.mass = this.mass
          },
          playJumpBash: (context, event, o) => {
            this.oaction['jumpAttack'].timeScale = this.jumpBashSpeed
            this.fadeToAction('jumpAttack')

            this.body.velocity.y = -this.body.position.y * 5
          },
          playJumpChargeBash: (context, event, o) => {
            this.oaction['jumpAttack'].timeScale = this.jumpBashSpeed
            this.fadeToAction('jumpAttack')

            this.body.mass = this.mass
            this.body.velocity.y = -this.body.position.y * 5
          },
          playJumpBashEnd: (context, event, o) => {
            this.oaction['jumpAttackEnd'].timeScale = this.jumpBashSpeed
            this.fadeToAction('jumpAttackEnd')
          },
          jump: () => {
            this.body.velocity.y = 20
          },
          playJump: () => {
            this.fadeToAction('jump')

            // this.setAir(true)
          },
          playHit: () => {
            this.oaction['hit'].timeScale = 3
            this.fadeToAction('hit')
          },
          playBlock: () => {
            this.fadeToAction('block')
          },
          // playBlocked: () => {
          //   this.fadeToAction('impact')
          // },
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
          playAjejebloken: () => {
            this.fadeToAction('whirlwind', 0)

            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(0.2)
            gsap.to(
              {},
              {
                duration: 2,
                onUpdate: () => {
                  // todo: use delta time.
                  this.body.position.x += this.tmpVec3.x
                  this.body.position.z += this.tmpVec3.z
                },
              }
            )

            // console.log(111)
            let to = { t: 0 }
            let _rotationY = this.mesh.rotation.y
            this.tweenAjejebloken = gsap.to(to, {
              duration: 0.3,
              t: Math.PI * 2,
              repeat: Infinity,
              ease: 'none',
              onUpdate: () => {
                this.mesh.rotation.y = _rotationY + to.t
              },
              // onComplete: () => {
              //   this.service.send('finish')
              // },
            })
          },
          exitAjejebloken: () => {
            this.tweenAjejebloken.kill()
            this.setFacing(this.facing.x, this.facing.y)
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
      // material: physicsMaterial,
      mass: this.mass,
      // material: physicsMaterial,
      collisionFilterGroup: g.GROUP_ROLE,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ENEMY_WEAPON,
    })
    this.body.belongTo = this

    this.bodyRadius = 0.9
    this.bodyHeight = 4.5
    this.bodyHeightHalf = this.bodyHeight / 2
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
      // console.log('beginContact', event.body.belongTo?.constructor.name)
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      // if (event.body !== window.greatSword.body && !event.body.isTrigger) {
      // if (!event.body.belongTo?.isWeapon && !event.body.belongTo?.isTrigger) {
      // if (event.body.belongTo?.isGround) {
      //   ///todo: Is cannon.js has collision mask?
      //   // todo: refactor: window.ground
      //   this.service.send('land')
      //   this.setAir(false)
      //   this.body.mass = this.mass
      // }
      // if (event.body === window.ground.body) console.log(111)
    })
    this.body.addEventListener('endContact', (event) => {
      // console.log('endContact', event.body.belongTo?.constructor.name)
      // if (!event.body.belongTo?.isWeapon && !event.body.belongTo?.isTrigger) {
      // if (event.body.belongTo?.isGround) {
      //   this.setAir(true) // todo(ok): Use raycaster to check height, judge if really air. Then don't need use beginContact/endContact to check if air?
      // note: Can't only depend on endContact to set isAir = true, because when contact enemy, will often endContact with ground ( lift a little ).
      // }
      // if (event.body === window.ground.body) console.log(222)
    })
  }

  update(dt) {
    // console.log('tick')

    // console.log(this.body.position.y.toFixed(1))

    // console.log(Math.round(this.getAltitude()))
    let result = this.getAltitude(100)
    let altitude
    if (result.body) {
      altitude = this.body.position.y - this.bodyHeightHalf - result.hitPointWorld.y
      // console.log(Math.round(this.body.position.y - result.hitPointWorld.y), result.body.belongTo)
    } else {
      altitude = Infinity
    }
    if (altitude > 1) {
      this.setAir(true)
      this.service.send('air')
    } else {
      // NOTE: Check isAir to prevent immediate idle after jump.
      // NOTE: Check altitude < 0.01 too prevent sometimes not land bug.
      if (this.isAir || altitude < 0.01) this.service.send('land')
      // this.service.send('land')
      this.setAir(false)
      this.body.mass = this.mass
    }
    // console.log(this.isAir, altitude.toFixed(1), result.body?.belongTo?.constructor.name)
    // console.log(this.isAir, altitude, result.body?.belongTo?.constructor.name)

    // if (this.isAir) console.log('isAir')
    // else console.log('-')

    if (this.service.state.matches('loading')) return

    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodyHeightHalf, this.body.position.z)
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

          this.pop = new Pop(this)

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
    this.mesh.rotation.set(0, -this.facing.angle() + Math.PI / 2, 0)
    // todo: add function: this.mesh.rotation.y = -this.facing.angle() + Math.PI / 2.
  }

  setAir(bool) {
    if (bool) {
      this.isAir = true
      // this.attackSpeed = this.airAttackSpeed
    } else {
      this.isAir = false
      // this.attackSpeed = this.landAttackSpeed
    }
  }

  getAltitude(maxDistance) {
    // getHiehgt()
    // todo: doing.
    let result = new CANNON.RaycastResult()
    let option = {
      // skipBackfaces: true,
      // skipBackfaces: false,
      // collisionFilterGroup: g.GROUP_ROLE,
      collisionFilterMask: g.GROUP_SCENE,
    }
    let isHit = world.raycastClosest(this.body.position, new CANNON.Vec3(this.body.position.x, this.body.position.y - maxDistance, this.body.position.z), option, result)
    // if (isHit) {
    // console.log(result)
    // let altitude = this.body.position.y - result.hitPointWorld.y
    // return altitude
    return result
    // }
    // return false
  }

  // jump() {
  //   this.fadeToAction('jump')
  //   this.body.velocity.y = 20
  // }
}

export { Maria }