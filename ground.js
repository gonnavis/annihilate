class Ground {
  constructor() {
    let s = this
    s.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999 /*depthWrite: false*/ }))
    s.mesh.rotation.x = -Math.PI / 2
    scene.add(s.mesh)

    //ammo
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    pos.set(0, 0, 0)
    quat.set(0, 0, 0, 1)
    const margin = 0.05
    let mass = 0

    const shape = new Ammo.btBoxShape(new Ammo.btVector3(100, 1, 100))
    shape.setMargin(margin)

    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    const motionState = new Ammo.btDefaultMotionState(transform)

    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)

    if (mass > 0) {
      // rigidBodies.push(threeObject)

      // // Disable deactivation
      body.setActivationState(4)
    }

    world.addRigidBody(body)

    //cannon
    // let shape=new CANNON.Plane()
    // s.body=new CANNON.Body({
    //   mass: 0,
    //   collisionResponse: 0,
    // })
    // s.body.addShape(shape)
    // s.body.position.set(0,0,0)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    // // s.body.addEventListener("collide", function (event) {
    // //   console.log('collide floor')
    // // })
    // world.addBody(s.body)
  }
}
