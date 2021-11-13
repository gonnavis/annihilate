class Box {
  constructor(width = 1, height = 1, depth = 1) {
    let s = this
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()

    s.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    // s.mesh.rotation.x = - Math.PI / 2;
    s.mesh.position.copy(pos)
    scene.add(s.mesh)

    let shape = new CANNON.Box(new CANNON.Vec3(width / 2, depth / 2, height / 2))
    s.body = new CANNON.Body({
      mass: 0,
      collisionResponse: 0,
    })
    s.body.addShape(shape)
    // s.body.position.set(0,0,0)
    s.body.position.copy(pos)
    s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // s.body.addEventListener("collide", function (event) {
    //   console.log('collide floor')
    // })
    world.addBody(s.body)
  }
}
