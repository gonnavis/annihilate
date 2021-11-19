import { Box } from './box.js'
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
    let isContact = false

    s.box.body.addEventListener('beginContact', (e) => {
      if (e.body === role.body) {
        console.log('beginContact body')
        isContact = true
      }
    })
    s.box.body.addEventListener('endContact', (e) => {
      if (e.body === role.body) {
        console.log('endContact body')
        isContact = false
      }
    })

    function update(dt, time) {
      s.box.body.position.x = Math.sin(time / 1000 + s.timeBias) * 20
      s.box.mesh.position.copy(s.box.body.position)

      if (isContact) {
        // Role follow floatingBox
        tempPos.copy(s.box.body.position).sub(prevPos)
        role.body.position.x += tempPos.x
        role.body.position.z += tempPos.z
      }

      prevPos.copy(s.box.body.position)
    }
    updates.push(update)
  }
}

export { FloatingBox }
