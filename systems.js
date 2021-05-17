/* global THREE */
import { System } from './lib/ecsy.module.js'
import { CObject3D, CCollidable, CCollider, CRecovering, CMoving, CPulsatingScale, CTimeout, CPulsatingColor, CColliding, CRotating, CPlayerControl, CAction } from './components.js'

export class SPlayerControl extends System {
  constructor() {
    super(...arguments)
    const s = this
    s.speed = 0.15
    s.velocity = new THREE.Vector3()
  }
  execute(delta, time) {
    const s = this
    let entities = this.queries.entities.results
    entities.forEach((entity) => {
      let object3D = entity.getComponent(CObject3D)
      let object = object3D.object
      s.velocity.set(0, 0, 0)
      if (okey.w) s.velocity.z -= 1
      if (okey.s) s.velocity.z += 1
      if (okey.a) s.velocity.x -= 1
      if (okey.d) s.velocity.x += 1
      s.velocity.normalize().multiplyScalar(s.speed)
      let cMoving = entity.getMutableComponent(CMoving)
      if (cMoving) {
        cMoving.velocity.copy(s.velocity)
      }

      let cAction = entity.getMutableComponent(CAction)
      if (cAction && cAction.action_act === cAction.oaction.idle) {
        if (okey.j) {
          cAction.action_act.stop()
          cAction.action_act = cAction.oaction.punch
          cAction.oaction.punch.reset().play()
          entity.removeComponent(CMoving)
          cMoving.velocity.set(0, 0, 0)
        }
        if (okey.k) {
          cAction.action_act.stop()
          cAction.action_act = cAction.oaction.jump
          cAction.oaction.jump.reset().play()
          object3D.body.velocity.y = 20
        }
      }
    })
  }
}
SPlayerControl.queries = {
  entities: { components: [CPlayerControl] },
}

// export class Enemy extends System{

// }

export class SRotating extends System {
  execute(delta) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let rotatingSpeed = entity.getComponent(CRotating).rotatingSpeed
      let object = entity.getComponent(CObject3D).object

      object.rotation.x += rotatingSpeed * delta
      object.rotation.y += rotatingSpeed * delta * 2
      object.rotation.z += rotatingSpeed * delta * 3
    }
  }
}

SRotating.queries = {
  entities: { components: [CRotating, CObject3D] },
}

const TIMER_TIME = 1

export class SPulsatingColor extends System {
  execute(delta, time) {
    time *= 1000
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object = entity.getComponent(CObject3D).object
      if (entity.hasComponent(CColliding)) {
        object.material.color.setRGB(1, 1, 0)
      } else if (entity.hasComponent(CRecovering)) {
        let col = 0.3 + entity.getComponent(CTimeout).timer / TIMER_TIME
        object.material.color.setRGB(col, col, 0)
      } else {
        let r = Math.sin(time / 500 + entity.getComponent(CPulsatingColor).offset * 12) / 2 + 0.5
        object.material.color.setRGB(r, 0, 0)
      }
    }
  }
}

SPulsatingColor.queries = {
  entities: { components: [CPulsatingColor, CObject3D] },
}

export class SPulsatingScale extends System {
  execute(delta, time) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object = entity.getComponent(CObject3D).object

      let mul
      if (entity.hasComponent(CColliding)) {
        mul = 2
      } else if (entity.hasComponent(CRecovering)) {
        mul = 1.2
      } else {
        mul = 0.8
      }

      let offset = entity.getComponent(CPulsatingScale).offset
      let sca = mul * (Math.cos(time + offset) / 2 + 1) + 0.2
      object.scale.set(sca, sca, sca)
    }
  }
}

SPulsatingScale.queries = {
  entities: { components: [CPulsatingScale] },
}

export class SMoving extends System {
  execute(delta, time) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object3D = entity.getComponent(CObject3D) ///todo: getMutableComponent?
      let body = object3D.body
      let cMoving = entity.getComponent(CMoving)
      let velocity = cMoving.velocity
      body.position.x += velocity.x
      body.position.z += velocity.z

      let object = object3D.object
      let body_size = object3D.body_size
      object.position.set(body.position.x, body.position.y - body_size, body.position.z)
      if (velocity.x !== 0 || velocity.z !== 0) {
        cMoving.facing.x = velocity.x
        cMoving.facing.y = velocity.z
      }
      object.rotation.y = -cMoving.facing.angle() + Math.PI / 2
    }
  }
}

SMoving.queries = {
  entities: { components: [CMoving] },
}

export class STimeout extends System {
  execute(delta) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]

      let timeout = entity.getMutableComponent(CTimeout)
      timeout.timer -= delta
      if (timeout.timer < 0) {
        timeout.timer = 0
        timeout.addComponents.forEach((componentName) => {
          entity.addComponent(componentName)
        })
        timeout.removeComponents.forEach((componentName) => {
          entity.removeComponent(componentName)
        })

        entity.removeComponent(CTimeout)
      }
    }
  }
}

STimeout.queries = {
  entities: { components: [CTimeout] },
}

let ballWorldPos = new THREE.Vector3()

export class SCollider extends System {
  execute() {
    let boxes = this.queries.boxes.results
    let balls = this.queries.balls.results
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i]
      let ballObject = ball.getComponent(CObject3D).object
      ballObject.getWorldPosition(ballWorldPos)
      if (!ballObject.geometry.boundingSphere) {
        ballObject.geometry.computeBoundingSphere()
      }
      let radiusBall = ballObject.geometry.boundingSphere.radius

      for (let j = 0; j < boxes.length; j++) {
        let box = boxes[j]
        let boxObject = box.getComponent(CObject3D).object
        let prevColliding = box.hasComponent(CColliding)
        if (!boxObject.geometry.boundingSphere) {
          boxObject.geometry.computeBoundingSphere()
        }
        let radiusBox = boxObject.geometry.boundingSphere.radius
        let radiusSum = radiusBox + radiusBall

        if (boxObject.position.distanceToSquared(ballWorldPos) <= radiusSum * radiusSum) {
          if (!prevColliding) {
            box.addComponent(CColliding)
          }
        } else {
          if (prevColliding) {
            box.removeComponent(CColliding)
            box.addComponent(CRecovering)
            box.addComponent(CTimeout, {
              timer: TIMER_TIME,
              removeComponents: [CRecovering],
            })
          }
        }
      }
    }
  }
}

SCollider.queries = {
  boxes: { components: [CCollidable] },
  balls: { components: [CCollider] },
}
