class FloatingBox {
  ///todo: extends Box
  constructor() {
    let s = this
    s.box = new Box(10, 1, 10)
    // s.box.body.position.set(0, 5, -35)
    // s.box.mesh.position.copy(s.box.body.position)
    s.timeBias = 0

    let tempPos = new THREE.Vector3()
    let prevPos = new THREE.Vector3()
    let isCollide = false
    let prevIsCollide = null
    let prevPrevIsCollide = null

    s.box.body.addEventListener('colliding', (e) => {
      if (e.body === role.body) {
        // console.log(1)
        isCollide = true
        // role.body.position.x = s.box.body.position.x
        // role.body.position.z = s.box.body.position.z
      }
    })

    function update(dt, time) {
      // console.log(isCollide) ///todo: Why role stand on floatingBox not move, will log isCollide false, and cause glitch? Solved by use prevIsCollide to debounce.
      // console.log(this)
      s.box.body.position.x = Math.sin(time / 1000 + s.timeBias) * 20
      // s.box.body.position.z += Math.sin(time/100)
      s.box.mesh.position.copy(s.box.body.position)

      if (isCollide || prevIsCollide) {
        //use prevIsCollide to debounce
        // Role follow floatingBox
        // console.log(1)
        tempPos.copy(s.box.body.position).sub(prevPos)
        role.body.position.x += tempPos.x
        role.body.position.z += tempPos.z
      } else if (prevPrevIsCollide) {
        // Make jump or fall follow floatingBox velocity, pok, but has some bug.
        // console.log(2)
        // tempPos.copy(s.box.body.position).sub(prevPos).multiplyScalar(60)
        // role.body.velocity.x += tempPos.x
        // role.body.velocity.z += tempPos.z
      }

      prevPos.copy(s.box.body.position)
      prevIsCollide = isCollide
      isCollide = false
    }
    updates.push(update)
  }
}
