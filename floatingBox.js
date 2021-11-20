import { Box } from './box.js'
class FloatingBox {
  ///todo: extends Box
  constructor() {
    let s = this

    updates.push(this)

    s.box = new Box(10, 1, 10)
    // s.box.body.position.set(0, 5, -35)
    // s.box.mesh.position.copy(s.box.body.position)
    s.timeBias = 0
    s.carryings = []

    this.tempPos = new THREE.Vector3()
    this.prevPos = new THREE.Vector3()
    // let isContact = false

    s.box.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo.isCharacter) {
        // console.log('beginContact body')
        // isContact = true
        s.carryings.push(e.body)
      }
    })
    s.box.body.addEventListener('endContact', (e) => {
      if (e.body.belongTo.isCharacter) {
        // console.log('endContact body')
        // isContact = false
        s.carryings.splice(s.carryings.indexOf(e.body), 1)
      }
    })
  }

  update(dt, time) {
    let s = this
    s.box.body.position.x = Math.sin(time / 1000 + s.timeBias) * 20
    s.box.mesh.position.copy(s.box.body.position)

    s.carryings.forEach((body) => {
      // Role/Entity follow floatingBox
      this.tempPos.copy(s.box.body.position).sub(this.prevPos)
      body.position.x += this.tempPos.x
      body.position.z += this.tempPos.z
    })

    this.prevPos.copy(s.box.body.position)
  }
}

export { FloatingBox }
