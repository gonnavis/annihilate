import { g } from './global.js'
class Ground {
  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({
        color: 0x444444,
      })
    )

    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    scene.add(this.mesh)

    let shape = new CANNON.Plane()
    this.body = new CANNON.Body({
      mass: 0,
    })
    this.body.addShape(shape)
    this.body.position.set(0, 0, 0)
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    // this.body.addEventListener("collide", (event) => {
    //   console.log('collide floor')
    // })
    world.addBody(this.body)
  }
}

export { Ground }
