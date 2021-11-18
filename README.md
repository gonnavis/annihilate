# Annihilate - js action game

### Play online

https://raw.githack.com/gonnavis/annihilate/MutantModel/index.html ( use mixamo mutant model )

https://raw.githack.com/gonnavis/annihilate/PaladinModel/index.html ( use mixamo paladin model )

https://raw.githack.com/gonnavis/annihilate/MariaModel/index.html ( use mixamo maria model, doing )

https://raw.githack.com/gonnavis/annihilate/main/index.html ( use self rig-and-animated naive model )

Current actively developing at [branch: MutantModel](https://github.com/gonnavis/annihilate/tree/MutantModel) & [branch: PaladinModel](https://github.com/gonnavis/annihilate/tree/PaladinModel) & [branch: MariaModel](https://github.com/gonnavis/annihilate/tree/MariaModel).

### Brief

An action game prototype made in 2018.

Now open-sourced and:

1. Switched from <a href="https://github.com/jakesgordon/javascript-state-machine" target="_blank">state-machine.js</a> to <a href="https://github.com/statelyai/xstate" target="_blank">XState</a>.

    state diagram of role: https://stately.ai/viz/f8c7eb66-db73-4bc4-b3ca-7e1ef2276923
    
    state diagram of role mutant: https://stately.ai/viz/8817b66b-7cdd-4035-9c50-d86d03f54eb7

    state diagram of enemy: https://stately.ai/viz/92f4cb2a-6e1a-4607-9a6c-5006490edd62
    
2. Switched from [cannon.js](https://github.com/schteppe/cannon.js) to [cannon-es](https://github.com/pmndrs/cannon-es).
    
3. Try to make a parallel [ammo.js](https://github.com/kripken/ammo.js/) version, at [branch: AmmoJS](https://github.com/gonnavis/annihilate/tree/AmmoJS) ([demo](https://raw.githack.com/gonnavis/annihilate/AmmoJS/index.html)).
    
4. Try to use <a href="https://github.com/ecsyjs/ecsy" target="_blank">ecsy.js</a> at [branch: ecsy](https://github.com/gonnavis/annihilate/tree/ecsy).

![image](https://user-images.githubusercontent.com/10785634/118347405-b6f14b80-b575-11eb-9269-38ef89051949.png)

[Video](https://twitter.com/gonnavis/status/1434951076365561859)

### Ref and Goal:
    
Action: **DMC**, **Guilty Gear** ...
    
Level design: **Super Mario 3D World** ...
    
Multiplayer Strategy: **Into the Breach** ...

Audio: **Geometry Dash** ...

Art: **Divinity Original Sin 2** ...

Code: [three-pathfinding](https://github.com/donmccurdy/three-pathfinding), [Sketchbook](https://discourse.threejs.org/t/vehicle-physics-with-cannon-js/11769), [three-to-cannon](https://github.com/donmccurdy/three-to-cannon) ...

[Other](https://twitter.com/gonnavis): [1](https://twitter.com/gonnavis/status/1442426877390385153) [2](https://twitter.com/FluidNinjaLIVE/status/1445897813020196869) [3](https://twitter.com/80Level/status/1450084674307600387) ...

### Todo: 

chargeAttack, dashAttack✔️, chargeDash, kick, jumpKick, air attacks, walk, aoe, skill, vfx ...

Fix: Do not inflict damage at the beginning of an attack.

Integrate common state, like `air`.

Rename `dash` to `dodge`. `dodge` can force change orientation.

Switch to ES6 module and use [cannon-es](https://github.com/pmndrs/cannon-es).✔️
