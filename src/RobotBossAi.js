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
        initial: 'idle',
        states: {
          idle: {
            on: {
              next: { target: 'attack' },
            },
          },
          attack: {
            entry: 'entryAttack',
            on: {
              restore: { target: 'idle' },
            },
            after: {
              7000: { target: 'attacked' },
              // 7000: { target: 'bash' },
            },
          },
          attacked: {
            on: {
              restore: { target: 'idle' },
            },
            after: {
              2000: { target: 'bash' },
            },
          },
          bash: {
            entry: 'entryBash',
            on: {
              restore: { target: 'idle' },
            },
            after: {
              7000: { target: 'bashed' },
              // 7000: { target: 'idle' },
            },
          },
          bashed: {
            on: {
              restore: { target: 'idle' },
            },
            after: {
              2000: { target: 'idle' },
            },
          },
          // TODO: Final state.
        },
      },
      {
        actions: {
          entryAttack: () => {
            this.character.service.send('attack') // formal
            // this.character.service.send('bash') // test
          },
          entryBash: () => {
            this.character.service.send('bash')
          },
        },
      }
    )

    this.service = interpret(this.fsm).onTransition((state) => {
      if (state.changed) console.log('robotBossAi: state:', state.value)
    })

    this.service.start()
  }

  attack() {
    if (!g.isAttack) return
    // console.log(111)

    this.service.send('next')

    // if (this.service.state.matches('canAttack')) {
    // this.service.send('attack')
    // }
    // this.service.send('bash')

    // if (this.service.state.matches('canNotAttack')) {
    //   this.character.service.send('stop') // prevent keep play running animation when in attack range and not moving.
    // } else {
    //   this.service.send('attack')
    // }

    // this.character.service.send('hadouken')
  }
}

export { RobotBossAi }
