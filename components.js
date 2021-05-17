import { TagComponent, Component, Types } from './lib/ecsy.module.js'

export class CCollidable extends TagComponent {}
export class CCollider extends TagComponent {}
export class CRecovering extends TagComponent {}

export class CMoving extends Component {}
CMoving.schema = {
  velocity: { type: Types.Ref },
  facing: { type: Types.Ref },
}

export class CAction extends Component {}
CAction.schema = {
  oaction: { type: Types.Ref },
  action_act: { type: Types.Ref },
}

export class CPlayerControl extends Component {}

export class CPulsatingScale extends Component {}
CPulsatingScale.schema = {
  offset: { type: Types.Number, default: 0 },
}

export class CObject3D extends Component {}
CObject3D.schema = {
  object: { type: Types.Ref },
  body: { type: Types.Ref },
  body_size: { type: Types.Number },
}

export class CTimeout extends Component {}
CTimeout.schema = {
  timer: { type: Types.Number },
  addComponents: { type: Types.Array },
  removeComponents: { type: Types.Array },
}

export class CPulsatingColor extends Component {}
CPulsatingColor.schema = {
  offset: { type: Types.Number },
}

export class CColliding extends Component {}
CColliding.schema = {
  value: { type: Types.Boolean },
}

export class CRotating extends Component {}
CRotating.schema = {
  enabled: { type: Types.Boolean },
  rotatingSpeed: { type: Types.Number },
  decreasingSpeed: { type: Types.Number, default: 0.001 },
}
