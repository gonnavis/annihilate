class Level {
  constructor() {
    let s = this
    // s.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999 /*depthWrite: false*/ }))
    // s.mesh.rotation.x = -Math.PI / 2
    // s.mesh.receiveShadow = true
    // scene.add(s.mesh)

    // let shape = new CANNON.Plane()
    // s.body = new CANNON.Body({
    //   mass: 0,
    //   collisionResponse: 0,
    // })
    // s.body.addShape(shape)
    // s.body.position.set(0, 0, 0)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // // s.body.addEventListener("collide", function (event) {
    // //   console.log('collide floor')
    // // })
    // world.addBody(s.body)
  }

  load() {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/level/level.glb',
        function (gltf) {
          s.gltf = gltf
          scene.add(s.gltf.scene)
          resolve()
        },
        undefined,
        function (e) {
          console.error(e)
          reject()
        }
      )
    })
  }
}

export { Level }
