import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Splash {
  constructor(event) {
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

    this.mesh.position.addVectors(event.body.position, event.contact.ri)

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
  }

  dispose() {
    window.scene.remove(this.mesh)
  }
}

export { Splash }
