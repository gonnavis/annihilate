import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Catapult {
  constructor(width = 1, height = 1, depth = 1) {
    this.isGround = true

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
    this.body = new CANNON.Body({
      // mass: 0,
      type: CANNON.Body.KINEMATIC,
      collisionFilterGroup: g.GROUP_SCENE,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    // this.body.addEventListener("collide", (event) => {
    //   console.log('collide floor')
    // })
    world.addBody(this.body)

    //

    this.mesh.position.set(11, 0, 4)
    this.body.position.copy(this.mesh.position)

    // this.mesh.geometry.rotateX(Math.PI / 2)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    this.mesh.rotation.y = Math.PI / 4
    this.body.quaternion.copy(this.mesh.quaternion)

    this._quaternion = new THREE.Quaternion().copy(this.mesh.quaternion)
    this.tmpQuat = new THREE.Quaternion()

    this.startTime = 0

    window.updates.push(this)

    setInterval(() => {
      this.launch()
    }, 5000)
  }

  update() {
    this.mesh.quaternion.copy(this.body.quaternion)

    // // launch hint
    // let freq = performance.now() - this.startTime
    // freq = freq ** 2
    // freq *= 0.00001
    // let intensity = Math.sin(freq)
    // intensity = Math.max(0, intensity)
    // this.mesh.material.emissive.setScalar(intensity * 0.1)
    let intensity = performance.now() - this.startTime
    intensity /= 4000
    intensity = intensity ** 5
    intensity *= 0.5
    this.mesh.material.emissive.setScalar(intensity)
  }

  launch() {
    let intensity = 10
    this.body.angularVelocity.set(-intensity, 0, intensity)
    setTimeout(() => {
      this.body.angularVelocity.set(0, 0, 0)
      // this.body.quaternion.set(0, 0.3826834323650898, 0, 0.9238795325112867)
      {
        let to = { t: 0 }
        this.tmpQuat.copy(this.body.quaternion)
        gsap.to(to, {
          duration: 1,
          t: 1,
          onUpdate: () => {
            this.mesh.quaternion.slerpQuaternions(this.tmpQuat, this._quaternion, to.t)
            this.body.quaternion.copy(this.mesh.quaternion)
            this.startTime = performance.now()
          },
        })
      }
    }, 100)
  }
}

export { Catapult }
