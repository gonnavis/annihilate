import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Teleporter {
  constructor(width = 1, height = 1, depth = 1) {
    this.isTrigger = true
    window.updates.push(this)

    this.dest = new THREE.Vector3()
    // this.rand = Math.random()

    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
    this.mesh.castShadow = true
    // this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    this.body = new CANNON.Body({
      mass: 0,
      // isTrigger: true,
      collisionFilterGroup: g.GROUP_SCENE,
      collisionFilterMask: g.GROUP_ROLE | g.GROUP_ENEMY,
      collisionResponse: false,
    })
    this.body.belongTo = this
    this.body.addShape(shape)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.addEventListener('beginContact', (event) => {
      if (event.body.belongTo?.isCharacter) {
        event.body.position.copy(this.dest)
      }
    })
    world.addBody(this.body)
  }

  update(dt, time) {
    this.mesh.rotation.x = time * 0.003
    this.mesh.rotation.y = time * 0.003
  }
}

export { Teleporter }
