import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class SwordBlink {
  constructor() {
    // updates.push(this)

    this.mesh = new THREE.Group()

    this.tmpVec3 = new THREE.Vector3()
    this.mainBlinkScale = 0.8
    this.smallBlinkScale = 0.1

    let geometry = new THREE.PlaneGeometry(1, 3)
    // let scale = 1000
    let scale = 300
    // let scale = 200
    // let scale = 100
    geometry.scale(scale * 0.7, scale, scale)
    // let geometry = new THREE.BoxGeometry()
    let map = new THREE.TextureLoader().load('./image/SwordBlink.png')
    map.encoding = THREE.sRGBEncoding
    this.material = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      // blending: THREE.AdditiveBlending,
      // opacity: 0.3
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.mainBlink = new THREE.Mesh(geometry, this.material)

    this.mainBlink.renderOrder = 1000

    this.mainBlink.rotation.x = Math.PI / 2

    // this.mainBlink.scale.setScalar(100)

    this.mainBlink2 = this.mainBlink.clone()
    this.mainBlink2.rotation.y = Math.PI / 2

    this.mesh.add(this.mainBlink)
    this.mesh.add(this.mainBlink2)

    //

    this.smallBlinks = []
    let smallGeometry = geometry.clone()
    smallGeometry.rotateX(Math.PI / 2)
    // smallGeometry.scale(1, 1, 1)
    this.smallMaterial = this.material.clone()
    for (let i = 0; i < 12; i++) {
      let smallBlink = new THREE.Mesh(smallGeometry, this.smallMaterial)
      smallBlink._position = new THREE.Vector3()
      // smallBlink.rotation.x += Math.PI / 2
      this.mesh.add(smallBlink)
      this.smallBlinks.push(smallBlink)
    }

    //

    this.mesh.visible = false
  }

  blink(chargedLevel) {
    let to = { t: 0, tv: 1 }
    gsap.to(to, {
      duration: 10 / 60,
      // duration: 3,
      t: 1,
      tv: 0,
      ease: 'none',
      onStart: () => {
        this.mesh.visible = true
        this.mainBlink.scale.setScalar(this.mainBlinkScale)
        this.mainBlink2.scale.setScalar(this.mainBlinkScale)
        this.smallBlinks.forEach((smallBlink) => {
          smallBlink.scale.setScalar(this.smallBlinkScale)
          smallBlink._position.x = (Math.random() - 0.5) * 350
          smallBlink._position.y = (Math.random() - 0.5) * 350
          smallBlink._position.z = (Math.random() - 0.5) * 350
          smallBlink.position.x = smallBlink._position.x
          smallBlink.position.y = smallBlink._position.y
          smallBlink.position.z = smallBlink._position.z
          smallBlink.lookAt(this.mesh.getWorldPosition(this.tmpVec3))
        })
        if (chargedLevel === 1) {
          this.material.color.setRGB(1, 1, 1)
          this.smallMaterial.color.setRGB(1, 1, 1)
        } else if (chargedLevel === 2) {
          this.material.color.setRGB(0.5, 1, 1)
          this.smallMaterial.color.setRGB(0.5, 1, 1)
        }
      },
      onUpdate: () => {
        this.mainBlink.scale.setScalar(this.mainBlinkScale * to.tv ** 0.5)
        this.mainBlink2.scale.setScalar(this.mainBlinkScale * to.tv ** 0.5)
        this.smallBlinks.forEach((smallBlink) => {
          smallBlink.scale.x = this.smallBlinkScale * to.tv
          smallBlink.position.x = smallBlink._position.x * to.tv
          smallBlink.position.y = smallBlink._position.y * to.tv
          smallBlink.position.z = smallBlink._position.z * to.tv
        })
        this.smallMaterial.opacity = to.tv
      },
      onComplete: () => {
        this.mesh.visible = false
      },
    })
  }

  // update() {}
}

export { SwordBlink }
