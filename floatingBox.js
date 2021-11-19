import { Box } from './box.js'
class FloatingBox {
  ///todo: extends Box
  constructor() {
    let s = this
    s.box = new Box(10, 1, 10)
    // s.box.body.position.set(0, 5, -35)
    // s.box.mesh.position.copy(s.box.body.position)
    s.timeBias = 0
    s.carryings = []

    let tempPos = new THREE.Vector3()
    let prevPos = new THREE.Vector3()
    // let isContact = false

    s.box.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo.isEntity) {
        // console.log('beginContact body')
        // isContact = true
        s.carryings.push(e.body)
      }
    })
    s.box.body.addEventListener('endContact', (e) => {
      if (e.body.belongTo.isEntity) {
        // console.log('endContact body')
        // isContact = false
        s.carryings.splice(s.carryings.indexOf(e.body), 1)
      }
    })

    function update(dt, time) {
      s.box.body.position.x = Math.sin(time / 1000 + s.timeBias) * 20
      s.box.mesh.position.copy(s.box.body.position)

      s.carryings.forEach((body) => {
        // Role/Entity follow floatingBox
        tempPos.copy(s.box.body.position).sub(prevPos)
        body.position.x += tempPos.x
        body.position.z += tempPos.z
      })

      prevPos.copy(s.box.body.position)
    }
    updates.push(update)
  }
}

export { FloatingBox }
