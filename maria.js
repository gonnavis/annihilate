class Maria {
  constructor(x, y, z) {
    this.isCharacter = true

    updates.push(this)

    this.health = 100
    this.oaction = {}
    this.mixer
    // this.speed = 0.15
    this.speed = 0.3
    // this.attackSpeed = 1.2
    this.attackSpeed = 1.4
    this.tmpVec3 = new THREE.Vector3()
    this.direction = vec2() // direction may be zero length.
    this.facing = vec2(0, 1) // facing always not zero length.

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
              attack: { target: 'attackStart' },
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
              attack: { target: 'attackStart' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // blocked: { target: 'blocked' }, // Note: Can block when running or in other states? No, more by intended operation, less by luck.
            },
            tags: ['canMove'],
          },
          attackStart: {
            entry: 'playAttackStart',
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
            tags: ['canDamage'],
          },
          strike: {
            entry: 'playStrike',
            on: {
              finish: { target: 'strikeEnd' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strikeEnd: {
            entry: 'playStrikeEnd',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
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
              attack: { target: 'jumpAttackStart' },
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
              attack: { target: 'jumpAttackStart' },
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
        },
      },
      {
        actions: {
          playDash: () => {
            this.oaction['dash'].timeScale = 2
            this.fadeToAction('dash')

            // change facing
            this.gltf.scene.rotation.y = -this.facing.angle() + Math.PI / 2
            // move
            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(60)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.z = this.tmpVec3.z
          },
          playJumpDash: () => {
            this.fadeToAction('dash', 0)

            // change facing
            this.gltf.scene.rotation.y = -this.facing.angle() + Math.PI / 2
            // move
            this.tmpVec3.setX(this.facing.x).setZ(this.facing.y).normalize().multiplyScalar(30)
            this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.z = this.tmpVec3.z
          },
          playIdle: () => {
            this.fadeToAction('idle')
          },
          playRun: () => {
            this.fadeToAction('running')
          },
          playAttackStart: () => {
            this.oaction['punchStart'].timeScale = this.attackSpeed
            this.fadeToAction('punchStart')
          },
          playAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0)
          },
          playDashAttack: () => {
            this.oaction['dashAttack'].timeScale = this.attackSpeed
            this.fadeToAction('dashAttack')

            // setTimeout(() => {
            //   this.tmpVec3.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(70)
            //   this.body.velocity.x = this.tmpVec3.x
            //   this.body.velocity.z = this.tmpVec3.z
            // }, 100)

            // let to = { t: 0 }
            // let _rotationY = this.gltf.scene.rotation.y
            // gsap.to(to, {
            //   duration: 0.5,
            //   t: -Math.PI * 2,
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     this.gltf.scene.rotation.y = _rotationY + to.t
            //   },
            // })
          },
          playFistStart: () => {
            this.oaction['fistStart'].timeScale = this.attackSpeed
            this.fadeToAction('fistStart')
          },
          playFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed
            this.fadeToAction('fist', 0)
          },
          playStrikeStart: () => {
            this.oaction['strikeStart'].timeScale = this.attackSpeed
            this.fadeToAction('strikeStart')
          },
          playStrike: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0)
          },
          playStrikeEnd: () => {
            this.oaction['strikeEnd'].timeScale = this.attackSpeed
            this.fadeToAction('strikeEnd', 0)
          },
          playJumpAttackStart: (context, event, o) => {
            this.oaction['jumpAttackStart'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttackStart')

            // this.tmpVec3.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(10)
            // this.body.velocity.x = this.tmpVec3.x
            this.body.velocity.y = 20
            // this.body.velocity.z = this.tmpVec3.z
          },
          playJumpAttack: (context, event, o) => {
            this.oaction['jumpAttack'].timeScale = this.attackSpeed * 4
            this.fadeToAction('jumpAttack')

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
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('maria: state:', state.value)
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
      mass: 80,
      // material: physicsMaterial,
    })
    this.body.belongTo = this

    this.bodyRadius = 1
    this.bodyHeight = 4.5
    // this.bodyHeight = 10
    this.bodyCylinderHeight = this.bodyHeight - this.bodyRadius * 2
    let sphereShapeUp = new CANNON.Sphere(this.bodyRadius)
    let sphereShapeDown = new CANNON.Sphere(this.bodyRadius)
    let cylinderShape = new CANNON.Cylinder(this.bodyRadius, this.bodyRadius, this.bodyCylinderHeight, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(sphereShapeUp, new CANNON.Vec3(0, this.bodyCylinderHeight / 2, 0))
    this.body.addShape(sphereShapeDown, new CANNON.Vec3(0, -this.bodyCylinderHeight / 2, 0))
    this.body.addShape(cylinderShape)

    let shape = new CANNON.Sphere(this.bodySize)
    // let shape = new CANNON.Cylinder(this.bodySize, this.bodySize, 3, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(shape)

    this.body.position.set(x, y, z) ///formal
    // this.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(this.body)
    this.body.addEventListener('collide', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      if (event.body !== window.greatSword.body) {
        ///todo: Is cannon.js has collision mask?
        // todo: refactor: window.ground
        this.service.send('land')
      }
    })
  }

  update(dt) {
    if (this.service.state.matches('loading')) return

    this.gltf.scene.position.set(this.body.position.x, this.body.position.y - this.bodyHeight / 2, this.body.position.z)
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
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/maria/all.gltf',
        (gltf) => {
          console.log(gltf.animations)
          this.gltf = gltf

          this.swordDelegate = new THREE.Object3D()
          this.swordDelegate.position.x = -24
          this.swordDelegate.position.z = 50
          this.swordDelegate.rotation.y = -0.55
          this.swordBone = this.gltf.scene.getObjectByName('sword_joint')
          this.swordBone.add(this.swordDelegate)

          this.gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              child.material = new THREE.MeshBasicMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/maria/maria_diffuse.jpg')
              child.material.map.flipY = false
              child.material.skinning = true
            }
          })
          scene.add(this.gltf.scene)
          this.gltf.scene.scale.setScalar(2.7)
          // this.gltf.scene.scale.set(.7,.7,.7)
          // this.gltf.scene.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.gltf.scene)
          this.gltf.animations.forEach((animation) => {
            // let name = animation.name.toLowerCase()
            let name = animation.name
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action

            // if (['jump', 'punch', 'fist', 'jumpattack', 'dodge', 'hit'].includes(name)) {
            // if ([].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }

            if (['punch', 'punchStart', 'fist', 'fistStart', 'jumpAttack', 'jumpAttackStart', 'jumpAttackEnd', 'strike', 'strikeStart', 'strikeEnd', 'hit', 'impact', 'jump', 'dashAttack', 'dash'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (e) => {
            this.service.send('finish')
          })
          this.service.send('loaded')
          resolve()

          callback()
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
}

export { Maria }
