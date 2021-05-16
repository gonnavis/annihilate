/* global THREE */
import { System } from './lib/ecsy.module.js'
import { Object3D, Collidable, Collider, Recovering, Moving, PulsatingScale, Timeout, PulsatingColor, Colliding, Rotating, PlayerControl, CAction } from './components.js'

export class PlayerControlSystem extends System {
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
      let object3D = entity.getComponent(Object3D)
      let object = object3D.object
      s.velocity.set(0, 0, 0)
      if (okey.w) s.velocity.z -= 1
      if (okey.s) s.velocity.z += 1
      if (okey.a) s.velocity.x -= 1
      if (okey.d) s.velocity.x += 1
      s.velocity.normalize().multiplyScalar(s.speed)
      let cMoving = entity.getMutableComponent(Moving)
      if (cMoving) {
        cMoving.velocity.copy(s.velocity)
      }

      let cAction = entity.getMutableComponent(CAction)
      if (cAction && cAction.action_act === cAction.oaction.idle) {
        if (okey.j) {
          cAction.action_act.stop()
          cAction.action_act = cAction.oaction.punch
          cAction.oaction.punch.reset().play()
          entity.removeComponent(Moving)
        }
        if (okey.k) {
          cAction.action_act.stop()
          cAction.action_act = cAction.oaction.jump
          cAction.oaction.jump.reset().play()
        }
      }
    })
  }
}
PlayerControlSystem.queries = {
  entities: { components: [PlayerControl] },
}

export class RotatingSystem extends System {
  execute(delta) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let rotatingSpeed = entity.getComponent(Rotating).rotatingSpeed
      let object = entity.getComponent(Object3D).object

      object.rotation.x += rotatingSpeed * delta
      object.rotation.y += rotatingSpeed * delta * 2
      object.rotation.z += rotatingSpeed * delta * 3
    }
  }
}

RotatingSystem.queries = {
  entities: { components: [Rotating, Object3D] },
}

const TIMER_TIME = 1

export class PulsatingColorSystem extends System {
  execute(delta, time) {
    time *= 1000
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object = entity.getComponent(Object3D).object
      if (entity.hasComponent(Colliding)) {
        object.material.color.setRGB(1, 1, 0)
      } else if (entity.hasComponent(Recovering)) {
        let col = 0.3 + entity.getComponent(Timeout).timer / TIMER_TIME
        object.material.color.setRGB(col, col, 0)
      } else {
        let r = Math.sin(time / 500 + entity.getComponent(PulsatingColor).offset * 12) / 2 + 0.5
        object.material.color.setRGB(r, 0, 0)
      }
    }
  }
}

PulsatingColorSystem.queries = {
  entities: { components: [PulsatingColor, Object3D] },
}

export class PulsatingScaleSystem extends System {
  execute(delta, time) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object = entity.getComponent(Object3D).object

      let mul
      if (entity.hasComponent(Colliding)) {
        mul = 2
      } else if (entity.hasComponent(Recovering)) {
        mul = 1.2
      } else {
        mul = 0.8
      }

      let offset = entity.getComponent(PulsatingScale).offset
      let sca = mul * (Math.cos(time + offset) / 2 + 1) + 0.2
      object.scale.set(sca, sca, sca)
    }
  }
}

PulsatingScaleSystem.queries = {
  entities: { components: [PulsatingScale] },
}

export class MovingSystem extends System {
  execute(delta, time) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]
      let object = entity.getComponent(Object3D).object
      let velocity = entity.getComponent(Moving).velocity
      object.position.add(velocity)
    }
  }
}

MovingSystem.queries = {
  entities: { components: [Moving] },
}

export class TimeoutSystem extends System {
  execute(delta) {
    let entities = this.queries.entities.results
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i]

      let timeout = entity.getMutableComponent(Timeout)
      timeout.timer -= delta
      if (timeout.timer < 0) {
        timeout.timer = 0
        timeout.addComponents.forEach((componentName) => {
          entity.addComponent(componentName)
        })
        timeout.removeComponents.forEach((componentName) => {
          entity.removeComponent(componentName)
        })

        entity.removeComponent(Timeout)
      }
    }
  }
}

TimeoutSystem.queries = {
  entities: { components: [Timeout] },
}

let ballWorldPos = new THREE.Vector3()

export class ColliderSystem extends System {
  execute() {
    let boxes = this.queries.boxes.results
    let balls = this.queries.balls.results
    for (let i = 0; i < balls.length; i++) {
      let ball = balls[i]
      let ballObject = ball.getComponent(Object3D).object
      ballObject.getWorldPosition(ballWorldPos)
      if (!ballObject.geometry.boundingSphere) {
        ballObject.geometry.computeBoundingSphere()
      }
      let radiusBall = ballObject.geometry.boundingSphere.radius

      for (let j = 0; j < boxes.length; j++) {
        let box = boxes[j]
        let boxObject = box.getComponent(Object3D).object
        let prevColliding = box.hasComponent(Colliding)
        if (!boxObject.geometry.boundingSphere) {
          boxObject.geometry.computeBoundingSphere()
        }
        let radiusBox = boxObject.geometry.boundingSphere.radius
        let radiusSum = radiusBox + radiusBall

        if (boxObject.position.distanceToSquared(ballWorldPos) <= radiusSum * radiusSum) {
          if (!prevColliding) {
            box.addComponent(Colliding)
          }
        } else {
          if (prevColliding) {
            box.removeComponent(Colliding)
            box.addComponent(Recovering)
            box.addComponent(Timeout, {
              timer: TIMER_TIME,
              removeComponents: [Recovering],
            })
          }
        }
      }
    }
  }
}

ColliderSystem.queries = {
  boxes: { components: [Collidable] },
  balls: { components: [Collider] },
}
