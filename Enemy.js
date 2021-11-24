import { Attacker } from './Attacker.js'
class Enemy {
  constructor(x, y, z) {
    let s = this
    s.scene = scene
    s.updates = updates
    s.oaction = {}
    s.mixer

    // pseudo shadow
    // const geometry = new THREE.CircleGeometry(1.5, 32)
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
    //       gl_FragColor = vec4(0,0,0,smoothstep(.0,.9,1.-length(vUv*2.-1.))*.3);
    //     }
    //   `,
    // })
    // s.shadow = new THREE.Mesh(geometry, material) // pseudo shadow
    // s.shadow.rotation.x = -Math.PI / 2
    // s.shadow.position.y = 0.02
    // s.shadow.renderOrder = 2 // need same as position.y order of all pseudo shadows
    // scene.add(s.shadow)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    s.fsm = createMachine(
      {
        id: 'enemy',
        context: {
          health: 150,
          // health: Infinity,
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
            if (window.role.gltf && s.gltf) new Attacker(scene, updates, s, window.role.mesh.position)
          },
          dead() {
            s.fadeToAction('death', 0.2)
            s.body.mass = 0
            s.body.velocity.set(0, 0, 0)

            let interval
            setTimeout(() => {
              interval = setInterval(() => {
                // s.mesh.position.y-=.001
                s.body.velocity.set(0, 0, 0) // continuously clear velocity, otherwise may not cleared.
                s.body.collisionResponse = false
                s.body.position.y -= 0.0005
                // console.log('interval')
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
    s.service = interpret(s.fsm).onTransition((state) => {
      // if (state.changed) console.log('enemy: state:', state.value)
      // if (state.changed) console.log(state.value,state)
      // s.currentState = state.value
      ///currentState === s.service.state.value
    })

    // Start the service
    s.service.start()
    // => 'pending'

    // s.service.send( 'idle' )
    // => 'resolved'

    let body_size = 1.6
    s.body = new CANNON.Body({
      mass: 1,
    })
    let shape = new CANNON.Sphere(body_size)
    // let shape = new CANNON.Cylinder(body_size, body_size, 3, 8)
    // let shape = new CANNON.Cylinder(body_size, body_size, 5, 8)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    s.body.angularDamping = 1
    s.body.addShape(shape)
    s.body.position.set(x, y, z)
    world.addBody(s.body)

    updates.push(function (dt) {
      if (s.service.state.value === 'loading') return
      s.mixer.update(dt)
      s.mesh.position.set(s.body.position.x, s.body.position.y - body_size, s.body.position.z)
      // s.shadow.position.x = s.body.position.x
      // s.shadow.position.z = s.body.position.z

      if (!role.gltf) return
      if (s.service.state.value !== 'dead') {
        {
          // look at role
          let vec2_diff = vec2(role.mesh.position.x - s.mesh.position.x, role.mesh.position.z - s.mesh.position.z)
          let angle = vec2_diff.angle()
          // console.log(angle)
          s.mesh.rotation.y = -angle + Math.PI / 2
        }
      }
    })

    setInterval(() => {
      s.service.send('attack')
    }, 3000)
  }

  hit() {
    // console.log('hit function')
    let s = this
    s.service.send('hit')
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
          s.mesh = s.gltf.scene

          s.mesh.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          s.scene.add(s.mesh)
          s.mesh.scale.set(0.7, 0.7, 0.7)
          // mesh.position.set(x,y,z)
          s.mixer = new THREE.AnimationMixer(s.mesh)
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
            s.service.send('idle')
          })
          s.service.send('loaded')
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

export { Enemy }
