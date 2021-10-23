class Enemy {
  constructor(x, y, z) {
    let s = this
    s.scene = scene
    s.updates = updates
    s.oaction = {}
    s.mixer

    const geometry = new THREE.CircleGeometry(1.5, 32)
    const material = new THREE.ShaderMaterial({
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
          gl_FragColor = vec4(0,0,0,smoothstep(.0,.9,1.-length(vUv*2.-1.))*.3);
        }
      `,
    })
    s.shadow = new THREE.Mesh(geometry, material) // pseudo shadow
    s.shadow.rotation.x = -Math.PI / 2
    s.shadow.position.y = 0.02
    s.shadow.renderOrder = 2 // need same as position.y order of all pseudo shadows
    scene.add(s.shadow)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    s.xstate = createMachine(
      {
        id: 'enemy',
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
              attack: { target: 'attack' },
              hit: { target: 'hit' },
            },
          },
          attack: {
            entry: 'playAttack',
            on: {
              idle: {
                target: 'idle',
                actions: 'throwAttacker',
              },
              hit: { target: 'hit' },
            },
          },
          hit: {
            entry: ['decreaseHealth', 'playHit'],
            always: [{ target: 'dead', actions: 'dead', cond: 'isDead' }],
            on: {
              idle: { target: 'idle' },
            },
          },
          dead: {
            type: 'final',
          },
        },
      },
      {
        actions: {
          decreaseHealth: assign({ health: (context, event) => context.health - 50 }),

          playIdle() {
            s.fadeToAction('idle', 0.2)
          },
          playAttack() {
            s.fadeToAction('dance', 0.2)
          },
          playHit() {
            s.fadeToAction('jump', 0.2)
          },
          throwAttacker() {
            if (window.role.gltf && s.gltf) window.attacker = new Attacker(scene, updates, s.gltf.scene.position, window.role.gltf.scene.position)
          },
          dead() {
            s.fadeToAction('death', 0.2)
            s.body.mass = 0
            s.body.velocity.set(0, 0, 0)

            let interval
            setTimeout(() => {
              interval = setInterval(() => {
                // s.gltf.scene.position.y-=.001
                s.body.velocity.set(0, 0, 0) // continuously clear velocity, otherwise may not cleared.
                s.body.collisionResponse = false
                s.body.position.y -= 0.0005
                console.log('interval')
                setTimeout(() => {
                  clearInterval(interval)
                  // },5000)
                }, 2000)
              })
            }, 2000)
          },
        },
        guards: {
          isDead(context) {
            return context.health <= 0
          },
        },
      }
    )

    // s.currentState
    s.xstateService = interpret(s.xstate).onTransition((state) => {
      // console.log('enemy: state:',state)
      // if (state.changed) console.log(state.value,state)
      // s.currentState = state.value
      ///currentState === s.xstateService.state.value
    })

    // Start the service
    s.xstateService.start()
    // => 'pending'

    // s.xstateService.send( 'idle' )
    // => 'resolved'

    // cannon
    // let body_size = 1.5
    // s.body = new CANNON.Body({
    //   mass: 1,
    // })
    // let shape = new CANNON.Sphere(body_size)
    // // let shape = new CANNON.Cylinder(body_size, body_size, 3, 8)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // s.body.angularDamping = 1
    // s.body.addShape(shape)
    // s.body.position.set(x, y, z)
    // world.addBody(s.body)

    updates.push(function update(dt) {
      if (s.xstateService.state.value === 'loading') return
      s.mixer.update(dt)
      // s.gltf.scene.position.set(s.body.position.x, s.body.position.y - body_size, s.body.position.z)
      s.shadow.position.x = s.gltf.scene.position.x
      s.shadow.position.z = s.gltf.scene.position.z

      // https://github.com/mrdoob/three.js/blob/e9ee667219ea630f8fdef98f44875e11d0516260/examples/physics_ammo_rope.html#L461
      const ms = s.body.getMotionState()
      if (ms) {
        ms.getWorldTransform(s.tempTransform)
        const p = s.tempTransform.getOrigin()
        const q = s.tempTransform.getRotation()
        s.gltf.scene.position.set(p.x(), p.y() - 2, p.z())
        s.ball.position.set(p.x(), p.y(), p.z())
        s.ball.quaternion.set(q.x(), q.y(), q.z(), q.w())
      }

      if (!role.gltf) return
      if (s.xstateService.state.value !== 'dead') {
        {
          // look at role
          let vec2_diff = vec2(role.gltf.scene.position.x - s.gltf.scene.position.x, role.gltf.scene.position.z - s.gltf.scene.position.z)
          let angle = vec2_diff.angle()
          // console.log(angle)
          s.gltf.scene.rotation.y = -angle + Math.PI / 2
        }
      }
    })

    // ammo debug mesh

    let pos = { x: 10, y: 4, z: 0 }
    let radius = 2
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
    const margin = 0.05
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
    s.body.name = 'enemy'
    s.body.setAngularFactor(0, 0, 0) //https://stackoverflow.com/questions/17755848/is-it-possible-to-disable-x-z-rotation-in-ammo-js

    s.body.setFriction(4)
    s.body.setRollingFriction(10)

    if (mass > 0) {
      // rigidBodies.push(threeObject)

      // // Disable deactivation
      s.body.setActivationState(4)
    }

    s.body.onCollide = (event) => {}
    // s.body.onCollide = (event) => {
    //   if (s.banCollideDetect) return
    //   // console.warn('collide')
    //   // console.log('collide', event.body.id, event.target.id)
    //   if (event.body === window.ground.body) {
    //     // todo: refactor: window.ground
    //     s.xstateService.send('land')
    //   }
    // }

    world.addRigidBody(s.body)

    setInterval(() => {
      // s.xstateService.send('attack')//todo
    }, 3000)
  }

  hit() {
    // console.log('hit function')
    let s = this
    s.xstateService.send('hit')
  }

  load() {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/RobotExpressive/RobotExpressive.glb',
        function (gltf) {
          // console.log('enemy loaded')
          // console.log(gltf)
          s.gltf = gltf
          s.scene.add(gltf.scene)
          gltf.scene.scale.set(0.7, 0.7, 0.7)
          // gltf.scene.position.set(x,y,z)
          s.mixer = new THREE.AnimationMixer(gltf.scene)
          gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = s.mixer.clipAction(animation)
            s.oaction[name] = action
            if (['jump', 'punch', 'dance'].includes(name)) {
              action.loop = THREE.LoopOnce
            }
            if (['death'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
            s.oaction.dance.timeScale = 3
          })
          s.action_act = s.oaction.idle
          s.action_act.play()
          s.mixer.addEventListener('finished', (e) => {
            // console.log('finished')
            s.xstateService.send('idle')
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
    // console.log(name)
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
}
