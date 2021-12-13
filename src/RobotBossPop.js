import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'

class RobotBossPop extends Attacker {
  constructor({ owner }) {
    super()

    this.owner = owner

    this.tmpVec3 = new THREE.Vector3()
    this.opacity = 0.7

    // body

    this.body.collisionFilterGroup = g.GROUP_ENEMY_ATTACKER
    this.body.collisionFilterMask = g.GROUP_ROLE

    this.radius = 5
    let shape = new CANNON.Sphere(this.radius)
    this.body.addShape(shape)
    // window.world.addBody(this.body)

    // mesh

    let geometry = new THREE.SphereGeometry(this.radius)
    let material = new THREE.MeshBasicMaterial({
      color: 'red',
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: this.opacity,
    })
    this.mesh = new THREE.Mesh(geometry, material)
    // this.owner.mesh.add(this.mesh)
    window.scene.add(this.mesh)

    this.mesh.visible = false

    // //

    // this.body.position.x = this.owner.body.position.x
    // this.body.position.z = this.owner.body.position.z
    // this.body.position.y = this.owner.body.position.y
    // // this.body.position.y = this.owner.body.position.y + this.height / 2

    // this.body.quaternion.setFromEuler(0, -this.owner.facing.angle() + (Math.PI / 2) * 3, this.angle)

    // // this.target.set(this.body.position.x, this.owner.body.position.y + this.height / 2, this.body.position.z - 50)
    // this.launch()

    this.initHint()
  }

  initHint() {
    // mesh
    let geometry = new THREE.PlaneGeometry(this.radius * 2 * 1.1, this.radius * 2 * 1.1)
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        opacity: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float opacity;
        void main(){
          vec2 uv = vUv*2.2-1.1;
          float dist = length(uv);
          float a = abs(dist-1.);
          a = pow(a, .55);
          // a = step(.12, a);
          a = smoothstep(.07,.13, a);
          a = 1.-a;
          vec4 cEdge = vec4(1,1,0,a);

          a = 1.-step(1., dist);
          vec4 cCenter = vec4(1,0,0,a*.3);

          gl_FragColor = mix(cCenter, cEdge, cEdge.a);
          gl_FragColor.a *= opacity;
        }
      `,
    })
    let mesh = new THREE.Mesh(geometry, material)
    window.scene.add(mesh)

    mesh.rotation.x = -Math.PI / 2
    mesh.visible = false
    this.hint = mesh
  }

  update() {
    this.body.position.copy(this.owner.body.position)
    this.body.position.y -= this.owner.bodyRadius
    // this.body.position.y -= 5
    this.mesh.position.copy(this.body.position)
    this.hint.position.copy(this.body.position)
    this.hint.position.y = 0.001

    if (this.isPopping) {
      let freq = performance.now() - this.startTime
      freq = freq ** 1.6
      freq *= 0.00057
      let intensity = Math.sin(freq)
      intensity = Math.max(0, intensity)
      this.hint.material.uniforms.opacity.value = intensity * 0.5
    }
  }

  collide(event, isBeginCollide) {
    if (!isBeginCollide) return

    // push away
    this.tmpVec3.x = event.body.position.x - this.owner.body.position.x
    this.tmpVec3.y = 0
    this.tmpVec3.z = event.body.position.z - this.owner.body.position.z
    this.tmpVec3.normalize().multiplyScalar(12)
    // event.body.velocity.x += this.tmpVec3.x // TODO: Mass more big, distance more long? Use gsap position instead? Or, set absolute value?
    // event.body.velocity.z += this.tmpVec3.z
    event.body.velocity.x = this.tmpVec3.x
    event.body.velocity.z = this.tmpVec3.z

    // damage
    event.body.belongTo.knockDown(event)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh)
    // this.isDisposed = true
  }

  pop() {
    this.isPopping = true
    this.hint.visible = true
    this.startTime = performance.now()
    setTimeout(() => {
      this.hint.visible = false

      let dur = 0.2
      window.world.addBody(this.body)
      setTimeout(() => {
        window.world.removeBody(this.body)
        this.body.collidings.length = 0
        // }, 0)
      }, dur * 1000)

      let to = { t: 0, tv: 1 }
      gsap.to(to, {
        duration: dur,
        // duration: 3,
        t: 1,
        tv: 0,
        onStart: () => {
          this.mesh.visible = true
          this.mesh.scale.setScalar(0)
          this.mesh.material.opacity = this.opacity
        },
        onUpdate: () => {
          this.mesh.scale.setScalar(to.t)
          this.mesh.material.opacity = this.opacity * to.tv
        },
        onComplete: () => {
          this.mesh.visible = false
          this.isPopping = false
          this.owner.service.send('popComplete')
        },
      })
    }, 1500)
  }
}

export { RobotBossPop }
