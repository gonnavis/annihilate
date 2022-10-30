import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { SwordBlaster } from './SwordBlaster.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
import { SwordBlink } from './SwordBlink.js'
import { Pop } from './Pop.js'
import { Splash } from './Splash.js'
import * as b3 from '../lib/behavior3js/index.js'
window.b3 = b3

// console.log(SUCCESS);
// console.log(FAILURE);
// console.log(RUNNING);
// console.log(MemSequence);

class Maria {
  constructor(x, y, z) {
    this.isCharacter = true
    this.isRole = true

    updates.push(this)

    this.health = 100
    this.oaction = {}
    this.mixer
    // this.speed = 0.15
    this.speed = 0.11
    // this.speed = 1
    // this.landAttackSpeed = 1.4
    // this.airAttackSpeed = 2.5
    this.attackSpeed = 1.4
    this.airBashSpeed = this.attackSpeed * 5
    // this.attackSpeed = this.landAttackSpeed
    this.chargeAttackCoe = 2
    this.tmpVec3 = new THREE.Vector3()
    this.direction = new THREE.Vector2() // direction may be zero length.
    this.facing = new THREE.Vector2(0, 1) // facing always not zero length.
    this.mass = 80
    this.chargedLevel = 0 // 0: normal/slow combo | 1: fast combo | 2: fast combo & swordBlaster
    this.isAir = false
    this.liftDistance = 3.7
    this.airLiftVelocity = 1.5
    this.climbContactSign = null
    this.whirlwindOneTurnDuration = 0.3

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

    // --- behavior tree

    const maria = this

    class Loading extends b3.Action {
      open() {
        // console.log('open Loading')
      }
      tick() {
        // console.log('tick Loading')
        if (maria.isLoaded) {
          console.log('SUCCESS Loading')
          return b3.SUCCESS
        } else {
          // console.log('RUNNING Loading')
          return b3.RUNNING
        }
      }
      // start() {
      //   console.log('start Loading')
      // }
    }
    class Idle extends b3.Action {
      // enter() {
      //   console.log('enter Idle')
      // }
      // open() {
      //   console.log('open Idle')
      // }
      tick(tick) {
        // console.log('tick Idle')

        const {target, blackboard, tree} = tick;
        const prevTick = blackboard.get('prevTick', tree.id)

        if (blackboard.get('idlePrevTick') !== prevTick) {
          blackboard.set('idle', false)
        }

        // console.log(window.allKey.KeyJ)
        // if (window.allKey.KeyJ) {
          // console.log('RUNNING Idle')
        //   return b3.RUNNING
        // } else {
        // console.log('RUNNING Idle')
        // return b3.RUNNING
        // }

        // console.log('tick.test', tick.test) // undefined
        // tick.test = 1;
        //
        // console.log('blackboard.test', blackboard.test) // 1
        // blackboard.test = 1;

        if (!blackboard.get('idle')) {
          maria.fadeToAction('idle')
          
          maria.chargedLevel = 0
          maria.sword.material.emissive.setScalar(0)
          maria.sword.material.color.setRGB(1, 1, 1)
        }

        blackboard.set('idle', true)
        blackboard.set('idlePrevTick', tick)
        
        console.log('SUCCESS Idle')
        return b3.SUCCESS
      }
      // close() {
      //   console.log('close Idle')
      // }
      // exit() {
      //   console.log('exit Idle')
      // }
      // start() {
      //   console.log('start Idle')
        
      //   maria.fadeToAction('idle')

      //   maria.chargedLevel = 0
      //   maria.sword.material.emissive.setScalar(0)
      //   maria.sword.material.color.setRGB(1, 1, 1)
      // }
    }
    class Run extends b3.Action {
      open() {
        // console.log('open Run')
      }
      tick(tick) {
        // console.log('tick Run')

        const {target, blackboard, tree} = tick;
        const prevTick = blackboard.get('prevTick', tree.id)

        if (blackboard.get('runPrevTick') !== prevTick) {
          blackboard.set('run', false)
        }

        if (window.allKey.KeyW || window.allKey.KeyS || window.allKey.KeyA || window.allKey.KeyD) {
          if (!blackboard.get('run')) {
            maria.fadeToAction('running')
          }

          const directionLengthSq = maria.direction.lengthSq()
          if (directionLengthSq > 0) {
            // change facing
            maria.facing.copy(maria.direction)
          } // end if here to set velocity 0 when stop, but because linearDamping not 1, will no obvious effect.
          maria.mesh.rotation.y = -maria.facing.angle() + Math.PI / 2

          maria.body.position.x += maria.direction.x
          maria.body.position.z += maria.direction.y
            
          blackboard.set('run', true)
          blackboard.set('runPrevTick', tick)

          console.log('SUCCESS Run')
          return b3.SUCCESS
        } else {
          // console.log('FAILURE Run')
          return b3.FAILURE
        }
        // return b3.RUNNING
      }
      // start() {
      //   console.log('start Run')
      //   maria.fadeToAction('running')
      // }
    }
    class Jump extends b3.Action {
      open() {
        // console.log('open Jump')
      }
      tick() {
        // console.log('tick Jump')
        // console.log('BT check tickKey')
        // if (window.tickKey.KeyK) {
        if (window.allKey.KeyK) {
          // if (!maria.isAir) {
          //   maria.body.velocity.y = 5.2
          // } else {
          // }

          // console.log('jump 1')
          return b3.RUNNING
        } else {
          // if (maria.altitude > 0.0037) {
          if (maria.altitude > 0.01) {
            // console.log('jump 2')
            return b3.RUNNING
          } else {
            // console.log('Jump FAILURE')
            return b3.FAILURE
          }
        }
        // return b3.RUNNING
      }
      // start() {
      //   console.log('start Jump')
      //   maria.body.velocity.y = 5.2
      //   maria.fadeToAction('jump') // TODO: Mesh pos y do not move.
      //   // maria.body.velocity.set(0, 0, 0) // For climb jump -> double jump clear velocity, thus can jump back to start wall, when roleControls move by change position.
      // }
    }
    class Fist extends b3.Action {
      tick(tick) {
        // console.log('tick Fist')

        const {target, blackboard, tree} = tick;
        const prevTick = blackboard.get('prevTick', tree.id)

        if (blackboard.get('fistPrevTick') !== prevTick) {
          blackboard.set('fist', false)
        }

        const doFist = () => {
          if (!blackboard.get('fist')) {
            // maria.oaction['fist'].timeScale = maria.attackSpeed
            maria.oaction['fist'].timeScale = 0.3
            maria.fadeToAction('fist', 0)
          }
            
          blackboard.set('fist', true)
          blackboard.set('fistPrevTick', tick)

          console.log('SUCCESS Fist')
          return b3.SUCCESS
        }

        if (maria.isAnimFinished) {
          if (blackboard.get('prepareFist')) {
            doFist()
          } else {
            return b3.FAILURE
          }
        } else if (blackboard.get('fist')) {
          blackboard.set('prepareFist', false)
          doFist();
        } else {
          // console.log('FAILURE Fist')
          return b3.FAILURE
        }
      }
    }
    class Punch extends b3.Action {
      open() {
        // console.log('open Punch')
      }
      tick(tick) {
        // console.log('tick Punch')

        const {target, blackboard, tree} = tick;
        const prevTick = blackboard.get('prevTick', tree.id)

        if (blackboard.get('punchPrevTick') !== prevTick) {
          blackboard.set('punch', false)
        }

        if (maria.isAnimFinished) {
          return b3.FAILURE
        } else if (window.tickKey.KeyJ || blackboard.get('punch')) {
          if (!blackboard.get('punch')) {
            // maria.oaction['punch'].timeScale = maria.attackSpeed
            maria.oaction['punch'].timeScale = 0.3
            maria.fadeToAction('punch', 0)
          } else {
            if (window.tickKey.KeyJ) {
              blackboard.set('prepareFist', true)
            }
          }
            
          blackboard.set('punch', true)
          blackboard.set('punchPrevTick', tick)

          console.log('SUCCESS Punch')
          return b3.SUCCESS
        } else {
          // console.log('FAILURE Punch')
          return b3.FAILURE
        }
      }
      // start() {
      //   console.log('start Punch')
      //   maria.oaction['punch'].timeScale = maria.punchSpeed
      //   maria.fadeToAction('punch', 0)
      // }
    }
    class WaitAnimFinished extends b3.Action {
      tick() {
        // console.log('tick WaitAnimFinished')
        if (maria.isAnimFinished) {
          // console.log('anim finished')
          return b3.SUCCESS
        } else {
          return b3.RUNNING
        }
      }
    }

    window.target = {}
    window.blackboard = new b3.Blackboard()

    window.tree = new b3.BehaviorTree()
    // the tree -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    tree.root = new b3.MemSequence({children:[
      new Loading(),
      new b3.Runnor({child:
        new b3.Priority({children:[
          new Fist(), // note: Fist need before Punch
          new Punch(),
          // new Jump(),
          new Run(),
          new Idle(),
        ]}),
      }),
    ]})
    // end: the tree-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // setInterval(() => {
    //   tree.tick(target, blackboard)
    //   console.log('-----------------------------')
    // }, 1000)

    // let count = 0;
    // function step() {
    //   tree.tick(target, blackboard)
    //   console.log('-----------------------------')
    //   count++;
    //   if (count < 10) setTimeout(step, 1000);
    // }
    // step();

    // function step() {
    //   tree.tick(target, blackboard)
    //   // console.log('-----------------------------')
    //   requestAnimationFrame(step)
    // }
    // requestAnimationFrame(step)

    // --- end: behavior tree

    let physicsMaterial = new CANNON.Material({
      friction: 0,
    })
    this.body = new CANNON.Body({
      // material: physicsMaterial,
      mass: this.mass,
      // material: physicsMaterial,
      collisionFilterGroup: g.GROUP_ROLE, // NOTE: What's my group.
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ENEMY_ATTACKER | g.GROUP_TRIGGER, // NOTE: I want to collide with which group(s), but they may not want to collide with me.
    })
    this.body.belongTo = this

    // this.bodyRadius = 0.25 // formal
    this.bodyRadius = 0.5 // temporarily increased for climb state animation.
    this.bodyHeight = 1.65
    this.bodyHeightHalf = this.bodyHeight / 2
    // this.bodyHeight = 10
    this.bodyCylinderHeight = this.bodyHeight - this.bodyRadius * 2
    let sphereShape = new CANNON.Sphere(this.bodyRadius)
    let cylinderShape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyCylinderHeight, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // this.body.linearDamping = 1
    // this.body.angularDamping = 1
    this.body.fixedRotation = true
    this.body.addShape(sphereShape, new CANNON.Vec3(0, this.bodyCylinderHeight / 2, 0))
    this.body.addShape(sphereShape, new CANNON.Vec3(0, -this.bodyCylinderHeight / 2, 0))
    this.body.addShape(cylinderShape)

    this.body.position.set(x, y, z) ///formal
    // this.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(this.body)
    this.body.addEventListener('collide', (event) => {
      // console.log(event.contact.rj.x)
      // console.log(event.contact)
      // console.log(event.contact.ni.x, event.contact.ni.y, event.contact.ni.z)
      // debugger
      if (event.body.belongTo.isScene) {
        // if (event.contact.ni.x === 1 && event.contact.ni.y === 0 && event.contact.ni.z === 0) {
        if (Math.abs(event.contact.ni.x) === 1 && event.contact.ni.y === 0 && event.contact.ni.z === 0) {
          // this.climbContactSign = event.contact.rj.x
          this.climbContactSign = event.contact.ni.x
          // this.service.send('climb')
          // this.service.send('climb', { contact: event.contact })
        }
      }
    })
    this.body.addEventListener('beginContact', (event) => {
      // console.log(event)
      // console.log('beginContact', event.body.belongTo?.constructor.name)
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      // if (event.body !== window.greatSword.body && !event.body.isTrigger) {
      // if (!event.body.belongTo?.isAttacker && !event.body.belongTo?.isTrigger) {
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
      // if (!event.body.belongTo?.isAttacker && !event.body.belongTo?.isTrigger) {
      // if (event.body.belongTo?.isGround) {
      //   this.setAir(true) // todo(ok): Use raycaster to check height, judge if really air. Then don't need use beginContact/endContact to check if air?
      // note: Can't only depend on endContact to set isAir = true, because when contact enemy, will often endContact with ground ( lift a little ).
      // }
      // if (event.body === window.ground.body) console.log(222)
    })
  }

  update(dt) {
    this.isAnimFinished = false

    // console.log('tick')
    // console.log(this.body.velocity.x.toFixed(1), this.body.linearFactor.x, this.body.force.x, this.body.invMass)

    if (false && this.service.state.matches('climb')) {
      // console.log(this.body.mass, this.body.velocity.x, this.body.velocity.y, this.body.velocity.z)
      // // this.body.inertia.set(0, 0, 0)
      // this.body.linearDamping = 1
      // this.body.velocity.set(0, 0, 0)

      this.body.position.y -= Math.min(dt, g.MAX_DT) // TODO√: Fix switch browser dt too big, go through ground bug.
    }

    // console.log(this.body.position.y.toFixed(1))

    // console.log(Math.round(this.getAltitude()))
    let result = this.getAltitude(100)
    if (result.body) {
      maria.altitude = this.body.position.y - this.bodyHeightHalf - result.hitPointWorld.y
      // console.log(Math.round(this.body.position.y - result.hitPointWorld.y), result.body.belongTo)
    } else {
      maria.altitude = Infinity
    }
    if (maria.altitude > 0.37) {
      this.setAir(true)
      // this.service.send('air')
    } else {
      // NOTE: Check isAir to prevent immediate idle after jump.
      // NOTE: Check maria.altitude < 0.0037 too prevent sometimes not land bug.
      // if (this.isAir || maria.altitude < 0.0037) this.service.send('land')
      // this.service.send('land')
      this.setAir(false)
      this.body.mass = this.mass
    }
    // console.log(this.isAir, maria.altitude.toFixed(1), result.body?.belongTo?.constructor.name)
    // console.log(this.isAir, maria.altitude, result.body?.belongTo?.constructor.name)

    // if (this.isAir) console.log('isAir')
    // else console.log('-')

    if (false && this.service.state.matches('loading')) return
    if (!this.mesh) return

    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodyHeightHalf, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z
    this.mixer.update(dt)
    

    // need after `this.isAnimFinished = false`
    tree.tick(this, blackboard)
  }

  hit(collideEvent) {
    // console.log('hit()')
    // this.health-=50
    // console.log(this.health)
    // if(this.health<=0){
    //   this.service.send('dead')
    // }else{
    // this.service.send('hit', { collideEvent })
    // }
  }

  knockDown(collideEvent) {
    this.hit(collideEvent)
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
          // this.mesh.scale.setScalar(1)
          // this.mesh.scale.setScalar(2.7)
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
          this.mixer.addEventListener('finished', (event) => {
            // console.log('finished ------------------------------------------------')
            // if (this.action_act === this.oaction.punchStart) {
            //   this.service.send('whirlwind')
            // } else {
            // this.service.send('finish')
            // }
            this.isAnimFinished = true
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

          this.swordTipDelegate = new THREE.Object3D()
          this.swordDelegate.add(this.swordTipDelegate)
          this.swordTipDelegate.position.z = 70

          //

          // this.service.send('loaded')
          this.isLoaded = true
          resolve()

          if (callback) callback()
        },
        undefined,
        (event) => {
          // console.error(event)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration = 0.1) {
    console.log('fadeToAction:', name)
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
