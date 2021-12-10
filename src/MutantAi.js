import { g } from './global.js'
import * as THREE from '../lib/three.js/build/three.module.js'
import { Ai } from './Ai.js'

class MutantAi extends Ai {
  constructor(character, distance = 1) {
    super(character, distance)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState
    this.fsm = createMachine(
      {
        id: 'robot',
        context: {
          health: 100,
          // health: Infinity,
        },
        initial: 'canAttack',
        states: {
          canAttack: {
            on: {
              attack: { target: 'cantAttack', actions: 'attack' },
            },
          },
          cantAttack: {
            after: {
              4000: { target: 'canAttack' },
            },
          },
        },
      },
      {
        actions: {
          attack: () => {
            this.character.service.send('attack')
            setTimeout(() => {
              this.character.service.send('keyJUp')
            }, 1600)
          },
        },
      }
    )

    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('robotAi: state:', state.value)
    })

    this.service.start()
  }

  attack() {
    if (!g.isAttack) return

    if (this.service.state.matches('cantAttack')) {
      this.character.service.send('stop') // prevent keep play running animation when in attack range and not moving.
    } else {
      this.service.send('attack')
    }
  }
}

export { MutantAi }
