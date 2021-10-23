//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Attacker {
  constructor(scene = scene, updates = updates /*arr*/, owner /*vec3*/, target /*vec3*/) {
    let s = this
    let movement /*vec3*/ = vec3().subVectors(target, owner).normalize().multiplyScalar(0.5)

    //ammo

    let radius = 2 * gs
    let height = 0.3 * gs

    let pos = { x: enemy.gltf.scene.position.x, y: height / 2, z: enemy.gltf.scene.position.z }
    let scale = { x: 1 * gs, y: 1 * gs, z: 1 * gs }
    let quat = { x: 0, y: 0, z: 0, w: 1 }
    let mass = 1
    s.tempTransform = new Ammo.btTransform()

    //threeJS Section
    let mesh = new THREE.Mesh(
      // CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
      new THREE.CylinderGeometry(radius, radius, height, 8, 1),
      new THREE.MeshPhongMaterial({
        color: 'green',
        wireframe: true,
        // transparent: true,
        // opacity: 0.1,
        // depthWrite: false,
      })
    )
    s.mesh = mesh

    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.scale.set(scale.x, scale.y, scale.z)

    // mesh.castShadow = true
    // mesh.receiveShadow = true

    scene.add(mesh)

    //Ammojs Section
    let transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    let motionState = new Ammo.btDefaultMotionState(transform)

    let colShape = new Ammo.btCylinderShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)) // radius height/2 radius
    colShape.setMargin(0.05)

    let localInertia = new Ammo.btVector3(0, 0, 0)
    colShape.calculateLocalInertia(mass, localInertia)

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
    let body = new Ammo.btRigidBody(rbInfo)
    s.body = body
    body.name = 'attacker'
    s.body.setAngularFactor(0, 0, 0) //https://stackoverflow.com/questions/17755848/is-it-possible-to-disable-x-z-rotation-in-ammo-js

    body.setFriction(0)
    body.setRollingFriction(0)

    body.setActivationState(4)

    body.setCollisionFlags(4)
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
      // console.log('axes collide')
      // if (event.body === enemy.body) {
      //   if (['attack', 'fist', 'strike', 'jumpAttack', 'dashAttack'].some(role.xstateService.state.matches)) enemy.hit() // todo: refactor: do not check role's state at here.
      // }
    }

    world.addRigidBody(body)

    // // cannon
    // let body_size = 2
    // s.is_hit = false
    // s.body = new CANNON.Body({
    //   mass: 0,
    //   type: CANNON.Body.KINEMATIC,
    // })
    // s.body.collisionResponse = 0
    // let shape = new CANNON.Cylinder(body_size, body_size, 0.3, 8) //radiusTop  radiusBottom  height  numSegments
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // s.body.addShape(shape)
    // s.body.position.copy(owner)
    // world.addBody(s.body)

    // s.body.addEventListener('collide', (e) => {
    //   // if(!window.a){
    //   //   console.log('aaa')
    //   //   window.a=e
    //   // }

    //   // console.log(a===e)

    //   if (!s.is_hit && e.body === role.body) {
    //     s.is_hit = true
    //     // console.log('asdf')
    //     role.hit()
    //   }
    // })

    function update() {
      // ammo
      let ms = s.body.getMotionState()
      s.body.setLinearVelocity(new Ammo.btVector3(movement.x * 10, 0, movement.z * 10))

      // let tmpPos = vec3()
      // s.mesh.position.copy(tmpPos)
      // if (ms) {
      //   let ammoTmpPos = new Ammo.btVector3()
      //   ammoTmpPos.setValue(tmpPos.x + movement.x, tmpPos.y, tmpPos.z + movement.z)

      //   let tmpTrans = new Ammo.btTransform()
      //   tmpTrans.setIdentity()
      //   tmpTrans.setOrigin(ammoTmpPos)

      //   ms.setWorldTransform(tmpTrans)
      // }

      // cannon
      // s.body.position.x += movement.x
      // s.body.position.z += movement.z

      if (ms) {
        ms.getWorldTransform(s.tempTransform)
        const p = s.tempTransform.getOrigin()
        const q = s.tempTransform.getRotation()
        s.mesh.position.set(p.x(), p.y(), p.z())
        s.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
      }
    }
    updates.push(update)

    setTimeout(() => {
      // ammo
      world.removeRigidBody(s.body)
      scene.remove(s.mesh)

      // cannon
      // world.remove(s.body)

      updates.splice(updates.indexOf(update), 1)
    }, 2000)
  }
}
