class FloatingBox {
  constructor() {
    let s = this
    s.box = new Box(10, 1, 10)
    s.box.mesh.position.set(0, 5, -35)
    s.box.body.position.copy(s.box.mesh.position)
    let prevX = 0
    function update(dt, time) {
      // console.log(this)
      s.box.mesh.position.x = Math.sin(time / 1000) * 20
      s.box.body.velocity.x = (s.box.mesh.position.x - prevX) * 60 // 60 from testing result
      // s.box.mesh.position.z += Math.sin(time/100)
      s.box.body.position.copy(s.box.mesh.position)

      prevX = s.box.mesh.position.x
    }
    updates.push(update)
  }
}
