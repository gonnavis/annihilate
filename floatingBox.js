class FloatingBox {
  constructor() {
    let s = this
    s.box = new Box(10, 1, 10)
    s.box.mesh.position.set(0, 5, 0)
    s.box.body.position.copy(s.box.mesh.position)
    function update(dt, time) {
      // console.log(this)
      s.box.mesh.position.x = Math.sin(time / 1000) * 20
      // s.box.mesh.position.z += Math.sin(time/100)
      s.box.body.position.copy(s.box.mesh.position)
    }
    updates.push(update)
  }
}
