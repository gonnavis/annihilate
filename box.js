

class Box{
  constructor(){
    let s=this
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()

    let x=20
    let y=4
    let z=60
    // pos.set(-3-x/2, y/2, 0)
    pos.set(-30,1,0)
    quat.set(0, 0, 0, 1)

    s.mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( x, y, z ), new THREE.MeshPhongMaterial( { color: 0x555555, /*depthWrite: false*/ } ) );
    // s.mesh.rotation.x = - Math.PI / 2;
    s.mesh.position.copy(pos)
    scene.add( s.mesh );

    let shape=new CANNON.Box(new CANNON.Vec3(x/2,z/2,y/2))
    s.body=new CANNON.Body({
      mass: 0,
      collisionResponse: 0,
    })
    s.body.addShape(shape)
    // s.body.position.set(0,0,0)
    s.body.position.copy(pos)
    s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    // s.body.addEventListener("collide", function (event) {
    //   console.log('collide floor')
    // })
    world.addBody(s.body)
  }

}
