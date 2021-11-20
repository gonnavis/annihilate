class Paladin {
  constructor(x, y, z) {
    this.isCharacter = true

    updates.push(this)

    this.health = 100
    this.oaction = {}
    this.mixer
    // this.speed = 0.15
    this.speed = 0.3
    this.attackSpeed = 1.6
    this._vec0 = new THREE.Vector3()

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

    this.xstate = createMachine(
      {
        id: 'paladin',
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
              attack: { target: 'attack' },
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
              attack: { target: 'attack' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // blocked: { target: 'blocked' }, // Note: Can block when running or in other states? No, more by intended operation, less by luck.
            },
            tags: ['canMove'],
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
              finish: { target: 'fist' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
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
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strike: {
            // top down strike
            entry: 'playStrike',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          jumpAttack: {
            entry: ['playJumpAttack'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
            tags: ['canDamage'],
          },
          jump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
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
              attack: { target: 'jumpAttack' },
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
        },
      },
      {
        actions: {
          entryDash: () => {
            this.fadeToAction('dash', 0.2)
            // this.body.mass = 0
            this._vec0.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(60)
            this.body.velocity.x = this._vec0.x
            // this.body.velocity.y = 0
            this.body.velocity.z = this._vec0.z
          },
          entryJumpDash: () => {
            this.fadeToAction('dash', 0.2)
            // this.body.mass = 0
            this._vec0.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(30)
            this.body.velocity.x = this._vec0.x
            // this.body.velocity.y = 0
            this.body.velocity.z = this._vec0.z
          },
          playIdle: () => {
            this.fadeToAction('idle', 0.2)
          },
          playRun: () => {
            this.fadeToAction('running', 0.2)
          },
          playAttack: () => {
            this.oaction['punch'].timeScale = this.attackSpeed
            this.fadeToAction('punch', 0.2)
          },
          playDashAttack: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0.2)
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
          playFist: () => {
            this.oaction['fist'].timeScale = this.attackSpeed
            this.fadeToAction('fist', 0.2)
          },
          playStrike: () => {
            this.oaction['strike'].timeScale = this.attackSpeed
            this.fadeToAction('strike', 0.2)
            this._vec0.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(50)
            // console.log(this._vec0)

            // setTimeout(() => {
            //   this.body.velocity.x = this._vec0.x
            //   // this.body.velocity.y = 30
            //   this.body.velocity.z = this._vec0.z
            //   // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            //   // this.body.velocity.y -= downVelocity
            //   this.body.velocity.y = -this.body.position.y * 5
            // }, 500)
          },
          playJumpAttack: (context, event, o) => {
            this.oaction['jumpattack'].timeScale = this.attackSpeed
            this.fadeToAction('jumpattack', 0.2)
            this._vec0.set(0, 0, 1).applyEuler(this.gltf.scene.rotation).multiplyScalar(15)
            console.log(this._vec0)
            this.body.velocity.x = this._vec0.x
            this.body.velocity.y = 20
            this.body.velocity.z = this._vec0.z
            // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            setTimeout(() => {
              // this.body.velocity.y -= downVelocity
              this.body.velocity.y = -this.body.position.y * 5
            }, 200)
          },
          jump: () => {
            this.body.velocity.y = 20
          },
          playJump: () => {
            this.fadeToAction('jump', 0.2)
          },
          playHit: () => {
            this.oaction['hit'].timeScale = 3
            this.fadeToAction('hit', 0.2)
          },
          playBlocked: () => {
            this.fadeToAction('impact', 0.2)
          },
        },
      }
    )

    // this.currentState
    this.xstateService = interpret(this.xstate).onTransition((state) => {
      // if (state.changed) console.log('paladin: state:', state.value)
      // console.log(state)
      // if (state.changed) console.log(state)
      // this.currentState = state.value
      ///currentState === this.xstateService.state.value
    })

    // Start the service
    this.xstateService.start()
    // => 'pending'

    // this.xstateService.send( 'idle' )
    // => 'resolved'

    this.body_size = 1.6
    let physicsMaterial = new CANNON.Material({
      friction: 0,
    })
    this.body = new CANNON.Body({
      mass: 100,
      // material: physicsMaterial,
    })
    this.body.belongTo = this
    let shape = new CANNON.Sphere(this.body_size)
    // let shape = new CANNON.Cylinder(this.body_size, this.body_size, 3, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(shape)
    this.body.position.set(x, y, z) ///formal
    // this.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(this.body)
    this.body.addEventListener('collide', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      if (event.body !== window.sword.body && event.body !== window.shield.body) {
        ///todo: Is cannon.js has collision mask?
        // todo: refactor: window.ground
        this.xstateService.send('land')
      }
    })
  }

  update(dt) {
    if (this.xstateService.state.matches('loading')) return

    this.gltf.scene.position.set(this.body.position.x, this.body.position.y - this.body_size, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z
    this.mixer.update(dt)
  }

  hit() {
    // console.log('hit()')
    // this.health-=50
    // console.log(this.health)
    // if(this.health<=0){
    //   this.xstateService.send('dead')
    // }else{
    this.xstateService.send('hit')
    // }
  }

  load(callback) {
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/paladin/all.gltf',
        (gltf) => {
          console.log(gltf.animations)
          this.gltf = gltf

          this.swordDelegate = new THREE.Object3D()
          this.swordDelegate.position.z = 50
          this.swordBone = this.gltf.scene.getObjectByName('Sword_joint')
          this.swordBone.add(this.swordDelegate)

          this.shieldDelegate = new THREE.Object3D()
          // this.shieldDelegate.position.z = 50
          // this.shieldDelegate.position.y = 20
          this.shieldBone = this.gltf.scene.getObjectByName('Shield_joint')
          this.shieldBone.add(this.shieldDelegate)

          this.gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              child.material = new THREE.MeshBasicMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/paladin/Paladin_diffuse.jpg')
              child.material.map.flipY = false
              child.material.skinning = true
            }
          })
          scene.add(this.gltf.scene)
          this.gltf.scene.scale.setScalar(2.9)
          // this.gltf.scene.scale.set(.7,.7,.7)
          // this.gltf.scene.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.gltf.scene)
          this.gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action

            // if (['jump', 'punch', 'fist', 'jumpattack', 'dodge', 'hit'].includes(name)) {
            // if ([].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }

            if (['punch', 'punch', 'fist', 'jumpattack', 'strike', 'hit', 'impact', 'jump'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (e) => {
            this.xstateService.send('finish')
          })
          this.xstateService.send('loaded')
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

  fadeToAction(name, duration) {
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

    if (1) {
      // fade
      nextAction.reset()
      // nextAction.stop()
      nextAction.play()
      // nextAction.enabled = true
      // nextAction.setEffectiveTimeScale(1)
      // nextAction.setEffectiveWeight(1)
      // nextAction.time = 0
      this.action_act.crossFadeTo(nextAction, 0.1)
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

export { Paladin }
