# Annihilate - js action game

### Play online

https://raw.githack.com/gonnavis/annihilate/MutantModel/index.html ( use mixamo mutant model )

https://raw.githack.com/gonnavis/annihilate/main/index.html ( use self rig-and-animated naive model )

Current actively developing at [branch: MutantModel](https://github.com/gonnavis/annihilate/tree/MutantModel) & [branch: AmmoJS](https://github.com/gonnavis/annihilate/tree/AmmoJS).

### Brief

An action game prototype made in 2018.

Now open-sourced and:

1. switched from <a href="https://github.com/jakesgordon/javascript-state-machine" target="_blank">state-machine.js</a> to <a href="https://github.com/statelyai/xstate" target="_blank">XState</a>.

    state diagram of role: https://stately.ai/viz/f8c7eb66-db73-4bc4-b3ca-7e1ef2276923
    
    state diagram of role mutant: https://stately.ai/viz/8817b66b-7cdd-4035-9c50-d86d03f54eb7

    state diagram of enemy: https://stately.ai/viz/92f4cb2a-6e1a-4607-9a6c-5006490edd62
    
2. try to switch from cannon.js to ammo.js, at [branch: AmmoJS](https://github.com/gonnavis/annihilate/tree/AmmoJS).
    
3. try to use <a href="https://github.com/ecsyjs/ecsy" target="_blank">ecsy.js</a> at [branch: ecsy](https://github.com/gonnavis/annihilate/tree/ecsy).

![image](https://user-images.githubusercontent.com/10785634/118347405-b6f14b80-b575-11eb-9269-38ef89051949.png)

[Video](https://twitter.com/gonnavis/status/1434951076365561859)

### Ref and Goal:
    
Action: DMC, Guilty Gear ...
    
Level design: Super Mario 3D World ...
    
Multiplayer Strategy: Into the Breach ...

Code: [Sketchbook](https://github.com/swift502/Sketchbook)

Other: [other1](https://twitter.com/gonnavis/status/1442426877390385153) [other2](https://twitter.com/FluidNinjaLIVE/status/1445897813020196869) [other3](https://twitter.com/80Level/status/1450084674307600387)

### Todo: 

chargeAttack, dashAttack✔️, chargeDash, kick, jumpKick, air attacks, walk, aoe, skill, vfx ...

Fix: Do not inflict damage at the beginning of an attack.

Integrate common state, like `air`.

Rename `dash` to `dodge`. `dodge` can force change orientation.
