class Earthquake {
  constructor(owner) {
    this.owner = owner

    // updates.push(this)

    this.width = 0.5
    this.height = 8 * 2
    this.depth = 5 * 2

    this.target = new THREE.Vector3(this.owner.facing.x, 0, this.owner.facing.y).normalize().multiplyScalar(50).add(this.owner.body.position) // vec3

    this.body = new CANNON.Body({
      mass: 0,
    })
    this.body.belongTo = this
    this.body.collisionResponse = false
    let shape = new CANNON.Cylinder(5, 5, 1.5, 8)
    this.body.addShape(shape)

    this.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo?.isEnemy === true && e.body.belongTo !== this.owner) {
        e.body.belongTo.hit()
        e.body.velocity.y += 20
      }
    })

    // mesh

    // let geometry = new THREE.BoxBufferGeometry(this.width, this.height, this.depth) // todo: reuse geometry & material
    // let material = new THREE.MeshBasicMaterial({
    //   color: 'cyan',
    //   side: THREE.DoubleSide,
    //   blending: THREE.AdditiveBlending,
    // })
    // this.mesh = new THREE.Mesh(geometry, material)

    //

    this.body.position.x = this.owner.body.position.x
    this.body.position.z = this.owner.body.position.z
    this.body.position.y = this.owner.body.position.y
    // this.body.position.y = this.owner.body.position.y + this.height / 2

    // this.body.quaternion.setFromEuler(0, -this.owner.facing.angle() + (Math.PI / 2) * 3, this.angle)

    // this.target.set(this.body.position.x, this.owner.body.position.y + this.height / 2, this.body.position.z - 50)

    world.addBody(this.body)
    // scene.add(this.mesh)
  }

  dispose() {
    world.removeBody(this.body)
    scene.remove(this.mesh)
    // this.isDisposed = true
  }

  // update() {}
}

export { Earthquake }
