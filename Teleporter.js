class Teleporter {
  constructor(width = 1, height = 1, depth = 1) {
    this.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
    this.mesh.castShadow = true
    // this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    this.body = new CANNON.Body({
      mass: 0,
      isTrigger: true,
    })
    this.body.addShape(shape)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.addEventListener('beginContact', (event) => {
      if (event.body.belongTo?.isCharacter) {
        event.body.position.set(-50, 50, -60)
      }
    })
    world.addBody(this.body)
  }
}

export { Teleporter }
