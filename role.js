class Role {
  constructor(x, y, z) {
    let s = this
    s.health = 100
    s.oaction = {}
    s.mixer
    s.okey = {}
    s.actkey = ''
    // s.speed = 0.15
    s.speed = 0.3
    s.direction = vec2()
    s.facing = vec2(0, 1)
    s._vec0 = new THREE.Vector3()
    // s.banCollideDetect = false //todo: Any better solution? Why ammo fire collide event after jump? ( at same tick )
    s.isCollide = false

    const geometry = new THREE.CircleGeometry(1.7 * gs, 32)
    const material = new THREE.ShaderMaterial({
      depthWrite: false,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main(){
          // gl_FragColor = vec4(0,0,0,(1.-length(vUv*2.-1.))*.5);
          gl_FragColor = vec4(0,0,0,smoothstep(.0,.9,1.-length(vUv*2.-1.))*.3);
        }
      `,
    })
    s.shadow = new THREE.Mesh(geometry, material) // pseudo shadow
    s.shadow.rotation.x = -Math.PI / 2
    s.shadow.position.y = 0.01
    s.shadow.renderOrder = 1 // need same as position.y order of all pseudo shadows
    scene.add(s.shadow)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    s.xstate = createMachine(
      {
        id: 'role',
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
              jump: { target: 'prepareJump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle', actions: 'stop' },
              attack: { target: 'attack' },
              jump: { target: 'prepareJump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // leaveGround: { target: 'jump' },
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
          },
          prepareFist: {
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
          },
          prepareStrike: {
            on: {
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          strike: {
            // top down strike
            entry: 'playStrike',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          jumpAttack: {
            entry: ['playJumpAttack'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          jump: {
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            // tags: ['canMove'],//todo
          },
          prepareJump: {
            entry: ['playJump', 'jump'],
            on: {
              leaveGround: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            // tags: ['canMove'],
          },
          hit: {
            entry: ['playHit'],
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
          stop() {
            // //todo: Any better solution? Why increase `friction` and `rollingFriction` no effect, can't stop?
            // let resultantImpulse = new Ammo.btVector3(0, 0, 0) //perfromance
            // // let scalingFactor = 50
            // // resultantImpulse.op_mul(scalingFactor)
            // s.body.setLinearVelocity(resultantImpulse)
          },
          entryDash() {
            s.fadeToAction('dash', 0.2)
            // // s.body.mass = 0
            // s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(60)
            // s.body.velocity.x = s._vec0.x
            // // s.body.velocity.y = 0
            // s.body.velocity.z = s._vec0.z
          },
          entryJumpDash() {
            s.fadeToAction('dash', 0.2)
            // // s.body.mass = 0
            // s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(30)
            // s.body.velocity.x = s._vec0.x
            // // s.body.velocity.y = 0
            // s.body.velocity.z = s._vec0.z
          },
          playIdle() {
            s.fadeToAction('idle', 0.2)
          },
          playRun() {
            s.fadeToAction('running', 0.2)
          },
          playAttack() {
            s.fadeToAction('punch', 0.2)
          },
          playDashAttack() {
            s.fadeToAction('punch', 0.2)
            let to = { t: 0 }
            let _rotationY = s.gltf.scene.rotation.y
            gsap.to(to, {
              duration: 0.5,
              t: -Math.PI * 2,
              onUpdate: () => {
                console.log(to.t)
                s.gltf.scene.rotation.y = _rotationY + to.t
              },
            })
          },
          playFist() {
            s.fadeToAction('fist', 0.2)
          },
          playStrike() {
            s.fadeToAction('jumpattack', 0.2)
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(15)
            console.log(s._vec0)
            // s.body.velocity.x = s._vec0.x
            // s.body.velocity.y = 30
            // s.body.velocity.z = s._vec0.z
            // // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            // setTimeout(() => {
            //   // s.body.velocity.y -= downVelocity
            //   s.body.velocity.y = -s.body.position.y * 5
            // }, 200)
          },
          playJumpAttack(context, event, o) {
            s.fadeToAction('jumpattack', 0.2)
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(15)
            console.log(s._vec0)

            setTimeout(() => {
              s.body.applyImpulse(new Ammo.btVector3(0, -10, 0))
            }, 300)

            // s.body.velocity.x = s._vec0.x
            // s.body.velocity.y = 20
            // s.body.velocity.z = s._vec0.z
            // // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            // setTimeout(() => {
            //   // s.body.velocity.y -= downVelocity
            //   s.body.velocity.y = -s.body.position.y * 5
            // }, 200)
          },
          jump() {
            // console.warn('jump')

            //cannon
            // s.body.velocity.y = 20

            //ammo
            let resultantImpulse = new Ammo.btVector3(0, 4, 0) //perfromance
            // let scalingFactor = 50
            // resultantImpulse.op_mul(scalingFactor)
            s.body.applyImpulse(resultantImpulse)
            // s.banCollideDetect = true
          },
          playJump() {
            s.fadeToAction('jump', 0.2)
          },
          playHit() {
            s.fadeToAction('hit', 0.2)
          },
        },
      }
    )

    // s.currentState
    s.xstateService = interpret(s.xstate).onTransition((state) => {
      // console.log(state)
      // if (state.changed) console.log(state)
      if (state.changed) console.log('role: state:', state.value)
      // s.currentState = state.value
      ///currentState === s.xstateService.state.value
    })

    // Start the service
    s.xstateService.start()
    // => 'pending'

    // s.xstateService.send( 'idle' )
    // => 'resolved'

    //cannon
    // let body_size = 1.5
    // let physicsMaterial = new CANNON.Material({
    //   friction: 0,
    // })
    // s.body = new CANNON.Body({
    //   mass: 1,
    //   // material: physicsMaterial,
    // })
    // let shape = new CANNON.Sphere(body_size)
    // // let shape = new CANNON.Cylinder(body_size, body_size, 3, 8)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // s.body.angularDamping = 1
    // s.body.addShape(shape)
    // s.body.position.set(x, y, z) ///formal
    // // s.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    // world.addBody(s.body)
    // s.body.addEventListener('collide', (event) => {
    //   // console.log('collide', event.body.id, event.target.id)
    //   if (event.body === window.ground.body) {
    //     // todo: refactor: window.ground
    //     s.xstateService.send('land')
    //   }
    // })

    // ammo debug mesh

    let pos = { x: 0, y: 4 * gs, z: 0 }
    let radius = 1 * gs
    let quat = { x: 0, y: 0, z: 0, w: 1 }
    let mass = 1

    //threeJS Section
    let ball = new THREE.Mesh(
      new THREE.SphereBufferGeometry(radius),
      new THREE.MeshPhongMaterial({
        color: 'green',
        wireframe: true,
        // transparent: true,
        // opacity: 0.1,
        // depthWrite: false,
      })
    )
    s.ball = ball
    // ball.visible = false

    ball.position.set(pos.x, pos.y, pos.z)

    // ball.castShadow = true
    // ball.receiveShadow = true

    scene.add(ball)

    //ammo
    const margin = 0.04
    // let mass = 3
    // let radius = 0.4
    s.tempTransform = new Ammo.btTransform()
    s.transform = new Ammo.btTransform()
    s.transform.setIdentity()
    s.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    s.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    const motionState = new Ammo.btDefaultMotionState(s.transform)

    // const shape = new Ammo.btBoxShape(new Ammo.btVector3(100, 1, 100))
    const shape = new Ammo.btSphereShape(radius)
    shape.setMargin(margin)

    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    s.body = new Ammo.btRigidBody(rbInfo)
    s.body.name = 'role'
    s.body.setAngularFactor(0, 0, 0) //https://stackoverflow.com/questions/17755848/is-it-possible-to-disable-x-z-rotation-in-ammo-js

    s.body.setFriction(4)
    s.body.setRollingFriction(10)

    if (mass > 0) {
      // rigidBodies.push(threeObject)

      // // Disable deactivation
      s.body.setActivationState(4)
    }

    s.body.onCollide = (event) => {
      // if (s.banCollideDetect) return
      // console.log('collide')
      // console.log('collide', event.body.id, event.target.id)
      if (event.body === window.ground.body) {
        // console.log(event.distance.toFixed(5))
        // if (Math.abs(event.distance) < 10000) {
        s.isCollide = true
        // todo: refactor: window.ground
        // console.warn('land')
        s.xstateService.send('land')
        // }
      }
    }

    world.addRigidBody(s.body)

    s.events()

    updates.push(function update(dt) {
      if (s.xstateService.state.matches('loading')) return

      // s.banCollideDetect = false

      if (!s.isCollide) {
        // console.warn('leaveGround')
        s.xstateService.send('leaveGround')
      }

      s.direction.set(0, 0)
      if (s.okey.KeyW || s.okey.ArrowUp) s.direction.add(vec2(0, -1))
      if (s.okey.KeyS || s.okey.ArrowDown) s.direction.add(vec2(0, 1))
      if (s.okey.KeyA || s.okey.ArrowLeft) s.direction.add(vec2(-1, 0))
      if (s.okey.KeyD || s.okey.ArrowRight) s.direction.add(vec2(1, 0))
      s.direction.normalize().multiplyScalar(s.speed)

      if (s.xstateService.state.hasTag('canMove')) {
        // change facing
        s.gltf.scene.rotation.y = -s.facing.angle() + Math.PI / 2 ///formal
        // s.gltf.scene.rotation.y = -s.facing.angle()+Math.PI///test
      }

      if (s.direction.length() > 0) {
        s.xstateService.send('run')
        s.facing.copy(s.direction)
      } else {
        // console.log('111111111111111')
        s.xstateService.send('stop')
      }

      if (s.xstateService.state.hasTag('canMove')) {
        // s.body.position.x += s.direction.x
        // s.body.position.z += s.direction.y

        //https://medium.com/@bluemagnificent/moving-objects-in-javascript-3d-physics-using-ammo-js-and-three-js-6e39eff6d9e5
        let resultantImpulse = new Ammo.btVector3(s.direction.x, 0, s.direction.y) //perfromance
        let scalingFactor = 20
        resultantImpulse.op_mul(scalingFactor)
        s.body.setLinearVelocity(resultantImpulse)
      }

      // s.gltf.scene.position.set(s.body.position.x, s.body.position.y - body_size, s.body.position.z)
      s.shadow.position.x = s.gltf.scene.position.x
      s.shadow.position.z = s.gltf.scene.position.z

      // https://github.com/mrdoob/three.js/blob/e9ee667219ea630f8fdef98f44875e11d0516260/examples/physics_ammo_rope.html#L461
      const ms = s.body.getMotionState()
      if (ms) {
        ms.getWorldTransform(s.tempTransform)
        const p = s.tempTransform.getOrigin()
        const q = s.tempTransform.getRotation()
        s.gltf.scene.position.set(p.x(), p.y() - 1 * gs, p.z())
        s.ball.position.set(p.x(), p.y(), p.z())
        s.ball.quaternion.set(q.x(), q.y(), q.z(), q.w())
      }

      s.mixer.update(dt)
      s.isCollide = false

      // console.log(s.gltf.scene.position.y.toFixed(5))
    })
  }

  hit() {
    let s = this
    // console.log('hit()')
    // s.health-=50
    // console.log(this.health)
    // if(s.health<=0){
    //   s.xstateService.send('dead')
    // }else{
    s.xstateService.send('hit')
    // }
  }

  load() {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/mutant/a.gltf',
        // '/_3d_model/mixamo/Mutant/a/a.gltf',
        function (gltf) {
          console.log(gltf.animations)
          s.gltf = gltf

          s.gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/mutant/a.jpg')
              // child.material.map = new THREE.TextureLoader().load('/_3d_model/mixamo/Mutant/a/a.jpg')
              child.material.map.flipY = false
              child.material.skinning = true
            }
          })
          scene.add(s.gltf.scene)
          s.gltf.scene.scale.setScalar((2.7 / 2) * gs)
          // s.gltf.scene.scale.set(.7,.7,.7)
          // s.gltf.scene.position.set(x,y,z)
          s.mixer = new THREE.AnimationMixer(s.gltf.scene)
          s.gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = s.mixer.clipAction(animation)
            s.oaction[name] = action
            if (['jump', 'punch', 'fist', 'jumpattack', 'dodge', 'hit'].includes(name)) {
              action.loop = THREE.LoopOnce
            }
            if ([].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          s.action_act = s.oaction.idle
          s.action_act.play()
          s.action_act.paused = true
          s.mixer.addEventListener('finished', (e) => {
            s.xstateService.send('finish')
          })
          s.xstateService.send('loaded')
          resolve()
        },
        undefined,
        function (e) {
          console.error(e)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration) {
    let s = this

    // previousAction = s.action_act;
    // activeAction = s.oaction[ name ];
    // if ( previousAction !== activeAction ) {
    //   previousAction.fadeOut( duration );
    // }
    // activeAction
    //   .reset()
    //   .setEffectiveTimeScale( 1 )
    //   .setEffectiveWeight( 1 )
    //   .fadeIn( duration )
    //   .play();

    s.action_act.stop()
    s.oaction[name].reset().play()
    s.action_act = s.oaction[name]
  }

  events() {
    let s = this
    window.addEventListener('keydown', (e) => {
      // console.log(e.key,e.code,e.keyCode)
      s.okey[e.code] = true

      if (!s.gltf) return
      if (e.code === s.actkey) return
      switch (e.code) {
        case 'KeyJ':
        case 'Numpad4':
          s.xstateService.send('attack')
          break
        case 'KeyK':
        case 'Numpad5':
          s.xstateService.send('jump')
          break
        case 'KeyI':
        case 'Numpad8':
          s.xstateService.send('dash')
          break
      }
      s.actkey = e.code
    })
    window.addEventListener('keyup', (e) => {
      // console.log(e)
      s.okey[e.code] = false
      s.actkey = ''
    })
  }
}
