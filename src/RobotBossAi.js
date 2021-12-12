import { g } from './global.js'
import * as THREE from '../lib/three.js/build/three.module.js'
import { Ai } from './Ai.js'

class RobotBossAi extends Ai {
  constructor(character, distance = 1) {
    super(character, distance)

    this.isMove = false
    this.facingTolerance = 0

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState
    this.fsm = createMachine(
      {
        id: 'robotBossAi',
        context: {
          health: 100,
          // health: Infinity,
        },
        initial: 'canAttack',
        states: {
          canAttack: {
            on: {
              attack: { target: 'canNotAttack', actions: 'attack' },
            },
          },
          canNotAttack: {
            on: {
              restore: { target: 'canAttack' },
            },
            after: {
              9000: { target: 'canAttack' },
            },
          },
        },
      },
      {
        actions: {
          attack: () => {
            this.character.service.send('attack')
          },
        },
      }
    )

    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('robotBossAi: state:', state.value)
    })

    this.service.start()
  }

  attack() {
    if (!g.isAttack) return
    // console.log(111)

    if (this.service.state.matches('canAttack')) {
      this.service.send('attack')
    }

    // if (this.service.state.matches('canNotAttack')) {
    //   this.character.service.send('stop') // prevent keep play running animation when in attack range and not moving.
    // } else {
    //   this.service.send('attack')
    // }

    // this.character.service.send('hadouken')
  }
}

export { RobotBossAi }
