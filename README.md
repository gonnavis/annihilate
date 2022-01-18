# Annihilate - js action game

## Play online

 [ dev ](https://raw.githack.com/gonnavis/annihilate/dev/index.html)

 [ Maria and Paladin ](https://raw.githack.com/gonnavis/annihilate/MariaAndPaladin/index.html)

 [ use mixamo Mutant model ](https://raw.githack.com/gonnavis/annihilate/MutantModel/index.html)

 [ use mixamo Paladin model ](https://raw.githack.com/gonnavis/annihilate/PaladinModel/index.html)

 [ use mixamo Maria model ](https://raw.githack.com/gonnavis/annihilate/MariaModel/index.html)

 [ use self rig-and-animated naive model ](https://raw.githack.com/gonnavis/annihilate/main/index.html)

## Brief

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
![image](https://user-images.githubusercontent.com/10785634/143771469-d2d15fc5-ed7e-4843-9854-42384e32e915.png)
![image](https://user-images.githubusercontent.com/10785634/145292224-41be4668-acc8-45aa-b284-f14819a3529e.png)
![image](https://user-images.githubusercontent.com/10785634/145850577-61d34fcc-8647-400c-aade-e52c242e8012.png)


Videos: 
[Mutant](https://twitter.com/gonnavis/status/1434951076365561859),
[Paladin Shiled](https://twitter.com/gonnavis/status/1461371351197880325),
[Maria](https://twitter.com/gonnavis/status/1462649045298532356/video/1),
[Whirlwind](https://twitter.com/gonnavis/status/1462820086054412291/video/1),
[SwordBlaster](https://twitter.com/gonnavis/status/1463220288468905987),
[MoveList, Hadouken Shoryuken](https://twitter.com/gonnavis/status/1465219502199562243/video/1),
[Rebound](https://twitter.com/gonnavis/status/1466799541764517888/video/1),
[Cloud & BirdFlock](https://twitter.com/gonnavis/status/1468695103640260609/video/1),
[Boss](https://twitter.com/gonnavis/status/1470434848925896706).

## Key Map:

[Video](https://twitter.com/gonnavis/status/1465219502199562243)

J = Attack

J + J + J = Combo

J hold charge1 + J + J = Fast Combo

J hold charge2 + J + J = Sword Blaster

J & K & L = Pop

K = Jump

K + K = Double Jump

K + U = Jump Bash Attack

K + U hold = Earthquake

L hold = Block

L hold + S + D + J = Hadouken

L hold + D + S + D + J = Shoryuken.

L hold + S + A + K = Tatsumaki Senpukyaku.

U hold = Whirlwind

I = Dash

I + J = Dash Attack

O = Launch

O hold = Launch with Jump

touch wall = climb ( currently only support +-X axis wall, todo: +-Z axis )

when climb J = fall

## Ref and Goal:
    
Action: **DMC**, **Guilty Gear** ...
    
Level design: **Super Mario 3D Land**, **Rolling Sky** ...

Both: **Prince of Persia**, **Shadow Blade: Reload**, **The Super Shinobi 2**, **STREETS OF RAGE 3**, **Hades** ...
    
Strategy: **Into the Breach**, **StarCraft**, **曹操传** ...

Audio: **Geometry Dash** ...

Art: **Divinity Original Sin 2** ...

Code: [three-pathfinding](https://github.com/donmccurdy/three-pathfinding), [Sketchbook](https://discourse.threejs.org/t/vehicle-physics-with-cannon-js/11769) ...

[Other](https://twitter.com/gonnavis): 
[1](https://twitter.com/gonnavis/status/1442426877390385153)
[2](https://twitter.com/FluidNinjaLIVE/status/1445897813020196869)
[3](https://twitter.com/80Level/status/1450084674307600387)
[4](https://twitter.com/TempleDoorGames/status/1460624431802249219)
[5](https://twitter.com/riotgames/status/1462201413195350018)
[6](https://twitter.com/JesseMiettinen/status/1302319385034489857)
[7](https://twitter.com/KyeonghoonM/status/1464870220636438535)
[8](https://twitter.com/80Level/status/1452543350381367296)
[9](https://twitter.com/Assault_Spy/status/1436881155542831111)
...

## Todo: 

Paladin do not hit by pop when shielded.

Boss Fight map.✔️

Combat puzzle map.

Tower Defence map.

Parkour and combat map.

Challenge map where only rebound attacks can deal damage to enemies.

Parrot/PhenixBoss: There's a bird's egg on the aerial platform. After breaking it, flies out of ParrotBoss. Magma rises from the ground to the platform, so player can't go down. Skills are firing barrage bullets, continuously throwing many grenades, and firebird forward charge/dash attack.  

Map: Drive sheepFlock/birdFlock into the fold, as fast as possible. And prevent enemies from killing the flock, as little as possible.

chargeAttack✔️, dashAttack✔️, chargeDash, kick, jumpKick, air attacks✔️, walk, aoe✔️, skill✔️, vfx ...

Fix: Do not inflict damage at the start and end of an attack.✔️

Integrate common state, like `air`.✔️

`dash` can force change orientation.✔️

Switch to ES6 module and use [cannon-es](https://github.com/pmndrs/cannon-es).✔️

...
