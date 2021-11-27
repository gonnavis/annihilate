import { g } from './global.js'

import * as THREE from './lib/three.js/build/three.module.js'
class SwordBlink {
  constructor() {
    // updates.push(this)

    let geometry = new THREE.PlaneGeometry(1, 3)
    // let scale = 1000
    let scale = 300
    // let scale = 200
    // let scale = 100
    geometry.scale(scale, scale, scale)
    // let geometry = new THREE.BoxGeometry()
    let map = new THREE.TextureLoader().load('./image/SwordBlink.png')
    map.encoding = THREE.sRGBEncoding
    let material = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      // blending: THREE.AdditiveBlending,
      // opacity: 0.3
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.mesh = new THREE.Mesh(geometry, material)

    this.mesh.renderOrder = 1000

    this.mesh.rotation.x = Math.PI / 2

    // this.mesh.scale.setScalar(100)

    this.mesh2 = this.mesh.clone()
    this.mesh2.rotation.y = Math.PI / 2

    this.mesh.visible = false
    this.mesh2.visible = false
  }

  blink(chargedLevel) {
    let to = { t: 0, tv: 1 }
    gsap.to(to, {
      duration: 5 / 60,
      // duration: 1,
      t: 1,
      tv: 0,
      onStart: () => {
        this.mesh.visible = true
        this.mesh2.visible = true
        this.mesh.scale.setScalar(1)
        this.mesh2.scale.setScalar(1)
        if (chargedLevel === 1) {
          this.mesh.material.color.set('white')
          this.mesh2.material.color.set('white')
        } else if (chargedLevel === 2) {
          this.mesh.material.color.set('cyan')
          this.mesh2.material.color.set('cyan')
        }
      },
      onUpdate: () => {
        this.mesh.scale.setScalar(to.tv)
        this.mesh2.scale.setScalar(to.tv)
      },
      onComplete: () => {
        this.mesh.visible = false
        this.mesh2.visible = false
      },
    })
  }

  // update() {}
}

export { SwordBlink }
