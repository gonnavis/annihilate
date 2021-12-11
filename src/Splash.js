import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Splash {
  constructor(event) {
    if (!event) return

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshStandardMaterial({
        transparent: true,
        color: 'red',
      })
    )
    window.scene.add(this.mesh)

    // let shape = new CANNON.Box(.5,.5,.5)
    // // let physicsMaterial = new CANNON.Material({
    // //   friction: 0,
    // // })
    // this.body = new CANNON.Body({
    //   // material: physicsMaterial,
    //   mass: 0,
    //   collisionFilterGroup: g.GROUP_SCENE,
    // })
    // this.body.belongTo = this
    // this.body.addShape(shape)
    // this.body.position.set(0, 0, 0)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // // this.body.addEventListener("collide", (event) => {
    // //   console.log('collide floor')
    // // })
    // world.addBody(this.body)

    //

    // if (event) {
    this.mesh.position.addVectors(event.body.position, event.contact.ri)
    // } else {
    //   this.mesh.position.copy(event.body.position)
    // }

    // all move up
    {
      let to = { t: 0, tv: 1 }
      let startPosY = this.mesh.position.y
      gsap.to(to, {
        duration: 0.5,
        t: 1,
        tv: 0,
        onUpdate: () => {
          this.mesh.position.y = startPosY + 1.5 * to.t
          this.mesh.material.opacity = to.tv ** 0.5
        },
        onComplete: () => {
          this.dispose()
        },
      })
    }

    // // oriented by contact ni
    // // https://pmndrs.github.io/cannon-es/docs/classes/contactequation.html#ni
    // {
    //   let to = { t: 0, tv: 1 }
    //   let startPosX = this.mesh.position.x
    //   let startPosY = this.mesh.position.y
    //   let startPosZ = this.mesh.position.z
    //   let movePosX = event.contact.ni.x * 1.5
    //   let movePosY = event.contact.ni.y * 1.5
    //   let movePosZ = event.contact.ni.x * 1.5
    //   gsap.to(to, {
    //     duration: 0.5,
    //     t: 1,
    //     tv: 0,
    //     onUpdate: () => {
    //       this.mesh.position.x = startPosX + movePosX * to.t
    //       this.mesh.position.y = startPosY + movePosY * to.t
    //       this.mesh.position.z = startPosZ + movePosZ * to.t
    //       this.mesh.material.opacity = to.tv ** 0.5
    //     },
    //     onComplete: () => {
    //       this.dispose()
    //     },
    //   })
    // }
  }

  dispose() {
    window.scene.remove(this.mesh)
  }
}

export { Splash }
