import { Box } from './box.js'
class FloatingBox {
  ///todo: extends Box
  constructor() {
    updates.push(this)

    this.box = new Box(10, 1, 10)
    // this.box.body.position.set(0, 5, -35)
    // this.box.mesh.position.copy(this.box.body.position)
    this.timeBias = 0
    this.carryings = []

    this.tempPos = new THREE.Vector3()
    this.prevPos = new THREE.Vector3()
    // let isContact = false

    this.box.body.addEventListener('beginContact', (e) => {
      if (e.body.belongTo.isCharacter) {
        // console.log('beginContact body')
        // isContact = true
        this.carryings.push(e.body)
      }
    })
    this.box.body.addEventListener('endContact', (e) => {
      if (e.body.belongTo.isCharacter) {
        // console.log('endContact body')
        // isContact = false
        this.carryings.splice(this.carryings.indexOf(e.body), 1)
      }
    })
  }

  update(dt, time) {
    this.box.body.position.x = Math.sin(time / 1000 + this.timeBias) * 20
    this.box.mesh.position.copy(this.box.body.position)

    this.carryings.forEach((body) => {
      // Role/Entity follow floatingBox
      this.tempPos.copy(this.box.body.position).sub(this.prevPos)
      body.position.x += this.tempPos.x
      body.position.z += this.tempPos.z
    })

    this.prevPos.copy(this.box.body.position)
  }
}

export { FloatingBox }
