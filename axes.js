//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Axes {
  constructor() {
    let s = this

    //ammo

    let pos = { x: 40, y: 6, z: 5 }
    let scale = { x: 2, y: 2, z: 2 }
    let quat = { x: 0, y: 0, z: 0, w: 1 }
    let mass = 1

    //threeJS Section
    let mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshPhongMaterial({
        color: 'green',
        wireframe: true,
        // transparent: true,
        // opacity: 0.1,
        // depthWrite: false,
      })
    )

    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.scale.set(scale.x, scale.y, scale.z)

    mesh.castShadow = true
    mesh.receiveShadow = true

    scene.add(mesh)

    // // Ammojs Section
    // let transform = new Ammo.btTransform()
    // transform.setIdentity()
    // transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    // transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    // let motionState = new Ammo.btDefaultMotionState(transform)

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5))
    colShape.setMargin(0.05)

    // let localInertia = new Ammo.btVector3(0, 0, 0)
    // colShape.calculateLocalInertia(mass, localInertia)

    // let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
    // let body = new Ammo.btRigidBody(rbInfo)

    let body = new Ammo.btGhostObject() //ghost
    // body.setCollisionShape(new Ammo.btSphereShape(10))
    body.setCollisionShape(colShape)
    // body.setWorldTransform(new Ammo.btTransform(new Ammo.btQuaternion(0, 0, 0, 1), new Ammo.btVector3(0, 15, 0)))
    // body.setCollisionFlags(4)
    // physicsWorld.addCollisionObject(body)

    s.body = body
    body.name = 'axes'

    // body.setFriction(4)
    // body.setRollingFriction(10)

    // body.setActivationState(4)
    // body.setCollisionFlags(4)

    body.onCollide = (event) => {
      console.log('axes collide')
    }

    // world.addRigidBody(body)

    // //cannon
    // let body_size=1
    // s.is_hit=false
    // s.body=new CANNON.Body({
    //   mass: 0,
    //   type: CANNON.Body.KINEMATIC,
    // })
    // s.body.collisionResponse=0
    // let shape=new CANNON.Box(new CANNON.Vec3(body_size, body_size, body_size))
    // s.body.addShape(shape)
    // world.addBody(s.body)

    // s.body.addEventListener('collide', e=>{

    //   if(e.body===enemy.body ){
    //     if (['attack','fist','strike','jumpAttack','dashAttack'].some(role.xstateService.state.matches)) enemy.hit() // todo: refactor: do not check role's state at here.
    //   }
    // })

    function update() {
      if (role.gltf) {
        let tmpPos = vec3()
        // role.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tmpPos)
        role.gltf.scene.getObjectByName('KnifeTip').getWorldPosition(tmpPos)
        // s.body.position.copy(tmpPos)

        tmpPos.x += 8 //test

        mesh.position.copy(tmpPos)

        // let ms = body.getMotionState()
        // if (ms) {
        //   let ammoTmpPos = new Ammo.btVector3()
        //   ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z)

        //   let tmpTrans = new Ammo.btTransform()
        //   tmpTrans.setIdentity()
        //   tmpTrans.setOrigin(ammoTmpPos)

        //   ms.setWorldTransform(tmpTrans)
        // }

        let ammoTmpPos = new Ammo.btVector3()
        ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z)

        let tmpTrans = new Ammo.btTransform()
        tmpTrans.setIdentity()
        tmpTrans.setOrigin(ammoTmpPos)

        body.setWorldTransform(tmpTrans)
      }
    }
    updates.push(update)
  }
}
