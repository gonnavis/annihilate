//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Axes {
  constructor() {
    let s = this
    s.cbContactResult
    // s.setupContactResultCallback()

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

    //Ammojs Section
    let transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    let motionState = new Ammo.btDefaultMotionState(transform)

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5))
    colShape.setMargin(0.05)

    let localInertia = new Ammo.btVector3(0, 0, 0)
    colShape.calculateLocalInertia(mass, localInertia)

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
    let body = new Ammo.btRigidBody(rbInfo)
    s.body = body
    body.name = 'axes'

    body.setFriction(4)
    body.setRollingFriction(10)

    body.setActivationState(4)

    body.setCollisionFlags(2 | 4)
    // /lib/ammo.js_github/bullet/src/BulletCollision/CollisionDispatch/btCollisionObject.h
    // enum CollisionFlags
    // {
    //   CF_STATIC_OBJECT= 1,
    //   CF_KINEMATIC_OBJECT= 2,
    //   CF_NO_CONTACT_RESPONSE = 4,
    //   CF_CUSTOM_MATERIAL_CALLBACK = 8,//this allows per-triangle material (friction/restitution)
    //   CF_CHARACTER_OBJECT = 16,
    //   CF_DISABLE_VISUALIZE_OBJECT = 32, //disable debug drawing
    //   CF_DISABLE_SPU_COLLISION_PROCESSING = 64//disable parallel/SPU processing
    // };

    body.onCollide = (event) => {
      console.log('axes collide')
    }

    world.addRigidBody(body)

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
      //todo: move out from constructor
      if (role.gltf) {
        let tmpPos = vec3()
        // role.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(tmpPos)
        role.gltf.scene.getObjectByName('KnifeTip').getWorldPosition(tmpPos)
        // s.body.position.copy(tmpPos)

        tmpPos.x += 8 //test

        mesh.position.copy(tmpPos)

        let ms = body.getMotionState()
        if (ms) {
          let ammoTmpPos = new Ammo.btVector3()
          ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z)

          let tmpTrans = new Ammo.btTransform()
          tmpTrans.setIdentity()
          tmpTrans.setOrigin(ammoTmpPos)

          ms.setWorldTransform(tmpTrans)
        }

        // world.contactTest(s.body, s.cbContactResult)
      }
    }
    updates.push(update)
  }

  // setupContactResultCallback() {
  //   // https://medium.com/@bluemagnificent/collision-detection-in-javascript-3d-physics-using-ammo-js-and-three-js-31a5569291ef
  //   let s = this
  //   s.cbContactResult = new Ammo.ConcreteContactResultCallback()

  //   s.cbContactResult.addSingleResult = function (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) {
  //     console.warn('addSingleResult')
  //     // let contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint)

  //     // const distance = contactPoint.getDistance()

  //     // if (distance > 0) return

  //     // let colWrapper0 = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper)
  //     // let rb0 = Ammo.castObject(colWrapper0.getCollisionObject(), Ammo.btRigidBody)

  //     // let colWrapper1 = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper)
  //     // let rb1 = Ammo.castObject(colWrapper1.getCollisionObject(), Ammo.btRigidBody)

  //     // let threeObject0 = rb0.threeObject
  //     // let threeObject1 = rb1.threeObject

  //     // let tag, localPos, worldPos

  //     // if (threeObject0.userData.tag != 'ball') {
  //     //   tag = threeObject0.userData.tag
  //     //   localPos = contactPoint.get_m_localPointA()
  //     //   worldPos = contactPoint.get_m_positionWorldOnA()
  //     // } else {
  //     //   tag = threeObject1.userData.tag
  //     //   localPos = contactPoint.get_m_localPointB()
  //     //   worldPos = contactPoint.get_m_positionWorldOnB()
  //     // }

  //     // let localPosDisplay = { x: localPos.x(), y: localPos.y(), z: localPos.z() }
  //     // let worldPosDisplay = { x: worldPos.x(), y: worldPos.y(), z: worldPos.z() }

  //     // console.log('contactTest', { tag, localPosDisplay, worldPosDisplay })
  //   }
  // }
}
