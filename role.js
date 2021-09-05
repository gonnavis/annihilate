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
              jump: { target: 'jump' },
              hit: { target: 'hit' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attack' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
            },
            tags: ['canMove'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              idle: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          jump: {
            entry: ['playJump', 'jump'],
            on: {
              hit: { target: 'hit' },
              land: { target: 'idle' },
              attack: { target: 'attack' },
              jump: { target: 'doubleJump' },
            },
            tags: ['canMove'],
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              hit: { target: 'hit' },
              land: { target: 'idle' },
              attack: { target: 'attack' },
            },
            tags: ['canMove'],
          },
          hit: {
            entry: ['playHit'],
            on: {
              idle: { target: 'idle' },
            },
          },
        },
      },
      {
        actions: {
          playIdle() {
            s.fadeToAction('idle', 0.2)
          },
          playRun() {
            s.fadeToAction('running', 0.2)
          },
          playAttack() {
            s.fadeToAction('punch', 0.2)
          },
          jump() {
            s.body.velocity.y = 20
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
      if (state.changed) console.log('state:', state.value)
      // s.currentState = state.value
      ///currentState === s.xstateService.state.value
    })

    // Start the service
    s.xstateService.start()
    // => 'pending'

    // s.xstateService.send( 'idle' )
    // => 'resolved'

    let body_size = 1.5
    s.body = new CANNON.Body({
      mass: 1,
    })
    // let shape=new CANNON.Sphere(body_size)
    let shape = new CANNON.Cylinder(body_size, body_size, 3, 8)
    s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    s.body.angularDamping = 1
    s.body.addShape(shape)
    s.body.position.set(x, y, z)
    world.addBody(s.body)
    s.body.addEventListener('collide', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      if (event.body === window.ground.body) {
        // todo: refactor: window.ground
        s.xstateService.send('land')
      }
    })

    s.events()

    updates.push(function update(dt) {
      if (s.xstateService.state.matches('loading')) return

      s.direction.set(0, 0)
      if (s.okey.KeyW || s.okey.ArrowUp) s.direction.add(vec2(0, -1))
      if (s.okey.KeyS || s.okey.ArrowDown) s.direction.add(vec2(0, 1))
      if (s.okey.KeyA || s.okey.ArrowLeft) s.direction.add(vec2(-1, 0))
      if (s.okey.KeyD || s.okey.ArrowRight) s.direction.add(vec2(1, 0))
      s.direction.normalize().multiplyScalar(s.speed)

      if (!['attack', 'hit'].some(s.xstateService.state.matches)) {
        // change facing
        s.gltf.scene.rotation.y = -s.facing.angle() + Math.PI / 2
      }

      if (s.direction.length() > 0) {
        s.xstateService.send('run')
        s.facing.copy(s.direction)
      } else {
        // console.log('111111111111111')
        s.xstateService.send('stop')
      }

      if (s.xstateService.state.hasTag('canMove')) {
        s.body.position.x += s.direction.x
        s.body.position.z += s.direction.y
      }

      s.gltf.scene.position.set(s.body.position.x, s.body.position.y - body_size, s.body.position.z)
      s.mixer.update(dt)
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
        './model/mutant/a.glb',
        function (gltf) {
          console.log(gltf.animations)
          s.gltf = gltf

          s.gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/fel_lord/fel_lord.png')
              // child.material.map=new THREE.TextureLoader().load('../model/mutant/a.jpg')
              child.material.map.flipY = false
              child.material.skinning = true
            }
          })
          scene.add(s.gltf.scene)
          s.gltf.scene.scale.setScalar(2.7)
          // s.gltf.scene.scale.set(.7,.7,.7)
          // s.gltf.scene.position.set(x,y,z)
          s.mixer = new THREE.AnimationMixer(s.gltf.scene)
          s.gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = s.mixer.clipAction(animation)
            s.oaction[name] = action
            if (['jump', 'punch', 'dodge', 'hit'].includes(name)) {
              action.loop = THREE.LoopOnce
            }
            if ([].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          s.action_act = s.oaction.idle
          s.action_act.play()
          s.mixer.addEventListener('finished', (e) => {
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
