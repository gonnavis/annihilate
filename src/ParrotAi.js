import { g } from './global.js'
import * as THREE from '../lib/three.js/build/three.module.js'
import { Ai } from './Ai.js'

class ParrotAi extends Ai {
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
          canGrenade: {
            on: {
              attack: { target: 'cantAttack', actions: 'grenade' },
            },
          },
          cantAttack: {
            after: {
              3000: [{ target: 'canAttack', cond: 'rand2' }, { target: 'canGrenade' }],
            },
          },
        },
      },
      {
        actions: {
          attack: () => {
            this.character.service.send('attack')
          },
          grenade: () => {
            this.character.service.send('grenade')
          },
        },
        guards: {
          rand2: () => Math.random() < 0.5,
        },
      }
    )

    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('parrotAi: state:', state.value)
    })

    this.service.start()
  }

  attack() {
    if (this.service.state.matches('cantAttack')) {
      this.character.service.send('stop') // prevent keep play running animation when in attack range and not moving.
    } else {
      this.service.send('attack')
    }
  }
}

export { ParrotAi }
