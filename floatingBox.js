class FloatingBox {
  ///todo: extends Box
  constructor() {
    let s = this
    s.box = new Box(10, 1, 10)
    s.box.mesh.position.set(0, 5, -35)
    s.box.body.position.copy(s.box.mesh.position)

    let tempPos = new THREE.Vector3()
    let prevPos = new THREE.Vector3()
    let isCollide = false

    s.box.body.addEventListener('colliding', (e) => {
      if (e.body === role.body) {
        // console.log(1)
        isCollide = true
        // role.body.position.x = s.box.body.position.x
        // role.body.position.z = s.box.body.position.z
      }
    })

    function update(dt, time) {
      // console.log(this)
      s.box.body.position.x = Math.sin(time / 1000) * 20
      // s.box.body.position.z += Math.sin(time/100)
      s.box.mesh.position.copy(s.box.body.position)

      if (isCollide) {
        tempPos.copy(s.box.body.position).sub(prevPos)
        role.body.position.x += tempPos.x
        role.body.position.z += tempPos.z
      }

      prevPos.copy(s.box.body.position)
      isCollide = false
    }
    updates.push(update)
  }
}
