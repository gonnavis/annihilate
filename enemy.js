class Enemy {
  constructor(x, y, z) {
    let s = this
    s.scene = scene
    s.updates = updates
    s.health = 100
    s.oaction = {}
    s.mixer

    const { createMachine, actions, interpret } = XState // global variable: window.XState

    s.xstate = createMachine(
      {
        id: 'enemy',
        initial: 'sloading',
        states: {
          sloading: {
            on: {
              tidle: { target: 'sidle', actions: 'onTidle' },
            },
          },
          sidle: {
            entry: () => {
              s.fadeToAction('idle', 0.2)
            },
            on: {
              tattacking: { target: 'sattacking', actions: 'onTattacking' },
              thitting: { target: 'shitting', actions: 'onThitting' },
            },
          },
          sattacking: {
            on: {
              tattacked: { target: 'sattacked', actions: 'onTattacked' },
              thitting: { target: 'shitting', actions: 'onThitting' },
            },
          },
          sattacked: {
            on: {
              tidle: { target: 'sidle', actions: 'onTidle' },
              thitting: { target: 'shitting', actions: 'onThitting' },
            },
          },
          shitting: {
            on: {
              tidle: { target: 'sidle', actions: 'onTidle' },
              tdeading: { target: 'sdeading', actions: 'onTdeading' },
            },
          },
          sdeading: {
            type: 'final',
          },
        },
      },
      {
        actions: {
          onInvalidTransition() {},
          onTidle() {
            // s.fadeToAction('idle', 0.2)
          },
          onTattacking() {
            s.fadeToAction('dance', 0.2)
          },
          onTattacked() {
            s.fadeToAction('idle', 0.2)
            if (window.role.gltf && s.gltf) window.attacker = new Attacker(scene, updates, s.gltf.scene.position, window.role.gltf.scene.position)
          },
          onThitting() {
            console.log('hit()')
            s.health -= 50
            console.log(s.health)
            s.fadeToAction('jump', 0.2)
          },
          onTdeading() {
            s.fadeToAction('death', 0.2)

            let interval
            setTimeout(() => {
              interval = setInterval(() => {
                // s.gltf.scene.position.y-=.001
                s.body.mass = 0
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
      }
    )

    // s.currentState
    s.xstateService = interpret(s.xstate).onTransition((state) => {
      console.log(state.value)
      // s.currentState = state.value
      ///currentState === s.xstateService.state.value
    })

    // Start the service
    s.xstateService.start()
    // => 'pending'

    // s.xstateService.send( 'tidle' )
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

    updates.push(function (dt) {
      if (s.xstateService.state.value === 'sloading') return
      s.mixer.update(dt)
      s.gltf.scene.position.set(s.body.position.x, s.body.position.y - body_size, s.body.position.z)

      if (!role.gltf) return
      if (s.xstateService.state.value !== 'sdeading') {
        {
          // look at role
          let vec2_diff = vec2(role.gltf.scene.position.x - s.gltf.scene.position.x, role.gltf.scene.position.z - s.gltf.scene.position.z)
          let angle = vec2_diff.angle()
          // console.log(angle)
          s.gltf.scene.rotation.y = -angle + Math.PI / 2
        }
      }
    })

    setInterval(() => {
      s.xstateService.send('tattacking')
    }, 3000)
  }

  hit() {
    let s = this
    s.xstateService.send('thitting')
    if (s.health <= 0) {
      s.xstateService.send('tdeading')
    }
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
            s.xstateService.send('tattacked')
            s.xstateService.send('tidle')
          })
          s.xstateService.send('tidle')
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
