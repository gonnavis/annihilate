// import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
window.THREE = THREE
import { OrbitControls } from '../lib/three.js/examples/jsm/controls/OrbitControls.js'
import { ConvexGeometry } from '../lib/three.js/examples/jsm/geometries/ConvexGeometry.js';

window.output = { object1: null, object2: null };

window.transformFreeVectorInverse = function( v, m ) {

  // input:
  // vector interpreted as a free vector
  // THREE.Matrix4 orthogonal matrix (matrix without scale)

  const x = v.x, y = v.y, z = v.z;
  const e = m.elements;

  v.x = e[ 0 ] * x + e[ 1 ] * y + e[ 2 ] * z;
  v.y = e[ 4 ] * x + e[ 5 ] * y + e[ 6 ] * z;
  v.z = e[ 8 ] * x + e[ 9 ] * y + e[ 10 ] * z;

  return v;

}

window.transformTiedVectorInverse = function( v, m ) {

  // input:
  // vector interpreted as a tied (ordinary) vector
  // THREE.Matrix4 orthogonal matrix (matrix without scale)

  const x = v.x, y = v.y, z = v.z;
  const e = m.elements;

  v.x = e[ 0 ] * x + e[ 1 ] * y + e[ 2 ] * z - e[ 12 ];
  v.y = e[ 4 ] * x + e[ 5 ] * y + e[ 6 ] * z - e[ 13 ];
  v.z = e[ 8 ] * x + e[ 9 ] * y + e[ 10 ] * z - e[ 14 ];

  return v;

}

window.transformPlaneToLocalSpace = function( plane, m, resultPlane ) {
window._v1 = new THREE.Vector3();

  resultPlane.normal.copy( plane.normal );
  resultPlane.constant = plane.constant;

  const referencePoint = transformTiedVectorInverse( plane.coplanarPoint( window._v1 ), m );

  transformFreeVectorInverse( resultPlane.normal, m );

  // recalculate constant (like in setFromNormalAndCoplanarPoint)
  resultPlane.constant = - referencePoint.dot( resultPlane.normal );

}

window.cutByPlane = function( object, plane, output ) {

  this.minSizeForBreak = 1.4;
  this.smallDelta = 0.0001;

  this.tempLine1 = new THREE.Line3();
  this.tempPlane1 = new THREE.Plane();
  this.tempPlane2 = new THREE.Plane();
  this.tempPlane_Cut = new THREE.Plane();
  this.tempCM1 = new THREE.Vector3();
  this.tempCM2 = new THREE.Vector3();
  this.tempVector3 = new THREE.Vector3();
  this.tempVector3_2 = new THREE.Vector3();
  this.tempVector3_3 = new THREE.Vector3();
  this.tempVector3_P0 = new THREE.Vector3();
  this.tempVector3_P1 = new THREE.Vector3();
  this.tempVector3_P2 = new THREE.Vector3();
  this.tempVector3_N0 = new THREE.Vector3();
  this.tempVector3_N1 = new THREE.Vector3();
  this.tempVector3_AB = new THREE.Vector3();
  this.tempVector3_CB = new THREE.Vector3();
  this.tempResultObjects = { object1: null, object2: null };

  this.segments = [];

  // Returns breakable objects in output.object1 and output.object2 members, the resulting 2 pieces of the cut.
  // object2 can be null if the plane doesn't cut the object.
  // object1 can be null only in case of internal error
  // Returned value is number of pieces, 0 for error.

  const geometry = object.geometry;
  const coords = geometry.attributes.position.array;
  const normals = geometry.attributes.normal.array;
  const uvs = geometry.attributes.uv.array;

  const numPoints = coords.length / 3;
  let numFaces = numPoints / 3;

  let indices = geometry.getIndex();

  if ( indices ) {

    indices = indices.array;
    numFaces = indices.length / 3;

  }

  function getVertexIndex( faceIdx, vert ) {

    // vert = 0, 1 or 2.

    const idx = faceIdx * 3 + vert;

    return indices ? indices[ idx ] : idx;

  }

  const points1 = [];

  // // debug
  // const handler = {
  //   set: (obj, prop, newVal) => {
  //     // debugger
  //     console.log(newVal)
  //     if(typeof newVal === 'object') {
  //       obj[prop] = new Proxy(newVal, {
  //         set: (obj, prop, newVal) => {
  //           debugger
  //           console.log(newVal)
  //           obj[prop] = newVal;
  //           return true
  //         }
  //       });

  //     } else {
  //       obj[prop] = newVal;
  //     }
  //     return true;
  //   },
  // }
  // const points1 = new Proxy([], handler);
  // //

  const points2 = [];

  const normals1 = [];
  const normals2 = [];

  const uvs1 = [];
  const uvs2 = [];

  const delta = this.smallDelta;

  // Reset segments mark
  const numPointPairs = numPoints * numPoints;
  for ( let i = 0; i < numPointPairs; i ++ ) this.segments[ i ] = false;

  const p0 = this.tempVector3_P0;
  const p1 = this.tempVector3_P1;
  const n0 = this.tempVector3_N0;
  const n1 = this.tempVector3_N1;
  const u0 = new THREE.Vector2()
  const u1 = new THREE.Vector2()

  // Iterate through the faces to mark edges shared by coplanar faces
  for ( let i = 0; i < numFaces - 1; i ++ ) {

    const a1 = getVertexIndex( i, 0 );
    const b1 = getVertexIndex( i, 1 );
    const c1 = getVertexIndex( i, 2 );

    // Assuming all 3 vertices have the same normal
    n0.set( normals[ a1 ], normals[ a1 ] + 1, normals[ a1 ] + 2 );

    for ( let j = i + 1; j < numFaces; j ++ ) {

      const a2 = getVertexIndex( j, 0 );
      const b2 = getVertexIndex( j, 1 );
      const c2 = getVertexIndex( j, 2 );

      // Assuming all 3 vertices have the same normal
      n1.set( normals[ a2 ], normals[ a2 ] + 1, normals[ a2 ] + 2 );

      const coplanar = 1 - n0.dot( n1 ) < delta;

      if ( coplanar ) {

        if ( a1 === a2 || a1 === b2 || a1 === c2 ) {

          if ( b1 === a2 || b1 === b2 || b1 === c2 ) {

            this.segments[ a1 * numPoints + b1 ] = true;
            this.segments[ b1 * numPoints + a1 ] = true;

          }	else {

            this.segments[ c1 * numPoints + a1 ] = true;
            this.segments[ a1 * numPoints + c1 ] = true;

          }

        }	else if ( b1 === a2 || b1 === b2 || b1 === c2 ) {

          this.segments[ c1 * numPoints + b1 ] = true;
          this.segments[ b1 * numPoints + c1 ] = true;

        }

      }

    }

  }

  // Transform the plane to object local space
  const localPlane = this.tempPlane_Cut;
  object.updateMatrix();
  transformPlaneToLocalSpace( plane, object.matrix, localPlane );

  // Iterate through the faces adding points to both pieces
  for ( let i = 0; i < numFaces; i ++ ) {

    const va = getVertexIndex( i, 0 );
    const vb = getVertexIndex( i, 1 );
    const vc = getVertexIndex( i, 2 );

    for ( let segment = 0; segment < 3; segment ++ ) {

      const i0 = segment === 0 ? va : ( segment === 1 ? vb : vc );
      const i1 = segment === 0 ? vb : ( segment === 1 ? vc : va );

      const segmentState = this.segments[ i0 * numPoints + i1 ];

      if ( segmentState ) {
        // debugger
        continue; // The segment already has been processed in another face
      }

      // Mark segment as processed (also inverted segment)
      this.segments[ i0 * numPoints + i1 ] = true;
      this.segments[ i1 * numPoints + i0 ] = true;

      p0.set( coords[ 3 * i0 ], coords[ 3 * i0 + 1 ], coords[ 3 * i0 + 2 ] );
      p1.set( coords[ 3 * i1 ], coords[ 3 * i1 + 1 ], coords[ 3 * i1 + 2 ] );

      n0.set( normals[ 3 * i0 ], normals[ 3 * i0 + 1 ], normals[ 3 * i0 + 2 ] );
      n1.set( normals[ 3 * i1 ], normals[ 3 * i1 + 1 ], normals[ 3 * i1 + 2 ] );

      u0.set( uvs[ 2 * i0 ], uvs[ 2 * i0 + 1 ] );
      u1.set( uvs[ 2 * i1 ], uvs[ 2 * i1 + 1 ] );

      // mark: 1 for negative side, 2 for positive side, 3 for coplanar point
      let mark0 = 0;

      let d = localPlane.distanceToPoint( p0 );

      if ( d > delta ) {

        mark0 = 2;
        // debugger
        points2.push( p0.clone() );
        normals2.push( n0.clone() );
        uvs2.push( u0.clone() );

      } else if ( d < - delta ) {

        mark0 = 1;
        // debugger
        points1.push( p0.clone() );
        normals1.push( n0.clone() );
        uvs1.push( u0.clone() );

      } else {

        mark0 = 3;
        // debugger
        points1.push( p0.clone() );
        normals1.push( n0.clone() );
        uvs1.push( u0.clone() );
        points2.push( p0.clone() );
        normals2.push( n0.clone() );
        uvs2.push( u0.clone );
      }

      // mark: 1 for negative side, 2 for positive side, 3 for coplanar point
      let mark1 = 0;

      d = localPlane.distanceToPoint( p1 );

      if ( d > delta ) {

        mark1 = 2;
        // debugger
        points2.push( p1.clone() );
        normals2.push( n1.clone() );
        uvs2.push( u1.clone() );

      } else if ( d < - delta ) {

        mark1 = 1;
        // debugger
        points1.push( p1.clone() );
        normals1.push( n1.clone() );
        uvs1.push( u1.clone() );

      }	else {

        mark1 = 3;
        // debugger
        points1.push( p1.clone() );
        normals1.push( n1.clone() );
        uvs1.push( u1.clone() );
        points2.push( p1.clone() );
        normals2.push( n1.clone() );
        uvs2.push( u1.clone() );

      }

      if ( ( mark0 === 1 && mark1 === 2 ) || ( mark0 === 2 && mark1 === 1 ) ) {

        // Intersection of segment with the plane

        this.tempLine1.start.copy( p0 );
        this.tempLine1.end.copy( p1 );

        let intersection = new THREE.Vector3();
        intersection = localPlane.intersectLine( this.tempLine1, intersection );

        if ( intersection === null ) {

          // Shouldn't happen
          console.error( 'Internal error: segment does not intersect plane.' );
          output.segmentedObject1 = null;
          output.segmentedObject2 = null;
          return 0;

        }

        // todo: performance: no new Vector.
        let total = new THREE.Vector3().subVectors( p1, p0 ).length()
        let part = new THREE.Vector3().subVectors( intersection, p0 ).length()
        let ratio = part / total;
        let uvPart = new THREE.Vector2().subVectors( u1, u0 ).multiplyScalar( ratio );
        let uvIntersection = new THREE.Vector2().copy( u0 ).add( uvPart );

        // debugger
        points1.push( intersection );
        normals1.push( n0.clone() );
        uvs1.push( uvIntersection.clone() );
        points2.push( intersection.clone() );
        normals2.push( n0.clone() );
        uvs2.push( uvIntersection.clone() );

        // debugger

      }

    }

  }

  // debugger
  // debugger
  // debugger
  // debugger
  // debugger

  // Calculate debris mass (very fast and imprecise):
  const newMass = object.userData.mass * 0.5; // todo: not need?

  // // Calculate debris Center of Mass (again fast and imprecise) // todo: not need?
  // this.tempCM1.set( 0, 0, 0 );
  // let radius1 = 0;
  const numPoints1 = points1.length;

  // if ( numPoints1 > 0 ) {

  //   for ( let i = 0; i < numPoints1; i ++ ) this.tempCM1.add( points1[ i ] );

  //   this.tempCM1.divideScalar( numPoints1 );
  //   for ( let i = 0; i < numPoints1; i ++ ) {

  //     // debugger
  //     const p = points1[ i ]; // mark
  //     p.sub( this.tempCM1 );
  //     radius1 = Math.max( radius1, p.x, p.y, p.z );

  //   }

  //   this.tempCM1.add( object.position );

  // }

  // this.tempCM2.set( 0, 0, 0 );
  // let radius2 = 0;
  const numPoints2 = points2.length;
  // if ( numPoints2 > 0 ) {

  //   for ( let i = 0; i < numPoints2; i ++ ) this.tempCM2.add( points2[ i ] );

  //   this.tempCM2.divideScalar( numPoints2 );
  //   for ( let i = 0; i < numPoints2; i ++ ) {

  //     const p = points2[ i ];
  //     p.sub( this.tempCM2 );
  //     radius2 = Math.max( radius2, p.x, p.y, p.z );

  //   }

  //   this.tempCM2.add( object.position );

  // }

  let object1 = null;
  let object2 = null;

  let numObjects = 0;

  if ( numPoints1 > 4 ) {

    // debugger
    object1 = new THREE.Mesh( new ConvexGeometry( points1, uvs1, normals1 ), object.material );
    // object1.position.copy( this.tempCM1 );
    object1.quaternion.copy( object.quaternion );

    // this.prepareBreakableObject( object1, newMass, object.userData.velocity, object.userData.angularVelocity, 2 * radius1 > this.minSizeForBreak );

    numObjects ++;

  }

  if ( numPoints2 > 4 ) {

    // debugger
    object2 = new THREE.Mesh( new ConvexGeometry( points2, uvs2, normals2 ), object.material );
    // object2.position.copy( this.tempCM2 );
    object2.quaternion.copy( object.quaternion );

    // this.prepareBreakableObject( object2, newMass, object.userData.velocity, object.userData.angularVelocity, 2 * radius2 > this.minSizeForBreak );

    numObjects ++;

  }

  output.object1 = object1;
  output.object2 = object2;

  return numObjects;

}

// import * as CANNON from '../lib/cannon-es_my.js'
// window.CANNON = CANNON
// import cannonDebugger from '../lib/cannon-es-debugger.js'
// // THREE.cannonDebugger = cannonDebugger

// import { GUI } from '../lib/lil-gui.module.min.js'

// import { Ground } from './Ground.js'
// import { Hill } from './Hill.js'
// // import { Level } from './Level.js'
// import { Box } from './Box.js'
// import { FloatingBox } from './FloatingBox.js'
// import { Maria } from './Maria.js'
// import { Paladin } from './Paladin.js'
// import { Mutant } from './Mutant.js'
// import { GreatSword } from './GreatSword.js'
// import { Sword } from './Sword.js'
// import { Shield } from './Shield.js'
// import { Flail } from './Flail.js'
// import { Robot } from './Robot.js'
// import { RoleControls } from './RoleControls.js'
// import { Ai } from './Ai.js'
// import { MutantAi } from './MutantAi.js'
// import { RobotAi } from './RobotAi.js'
// import { RobotBossAi } from './RobotBossAi.js'
// import { PaladinAi } from './PaladinAi.js'
// import { ParrotAi } from './ParrotAi.js'
// import { HandKnife } from './HandKnife.js'
// import { Teleporter } from './Teleporter.js'
// import { Parrot } from './Parrot.js'
// import { Catapult } from './Catapult.js'
// import { Cloud } from './Cloud.js'
// import { BirdFlock } from './BirdFlock.js'
// import { JumpPoint } from './JumpPoint.js'
// import { RobotBoss } from './RobotBoss.js'
// // import { TorusKnot } from './TorusKnot.js'
// // import { TranslatedBox } from './TranslatedBox.js'

// const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

// // setting

window.container = null
window.stats = null
// window.clock = null
// window.gui = null
// window.mixer = null
// window.actions = null
// window.activeAction = null
// window.previousAction = null
window.camera = null
window.scene = null
window.renderer = null
// window.model = null
// window.face = null
// window.updates = []
// window.hadoukens = []
// window.bullets = []
// window.grenades = []

// let fsm
// window.service = null

// // let cameraDist = 7
// // let cameraDist = 11
// let cameraDist = 15
// let cameraPosX = 0
// let cameraPosY = g.getQueryStringByName('view') === 'front' ? 0 : cameraDist
// let cameraPosZ = g.getQueryStringByName('view') === 'top' ? 0 : cameraDist

// // const gui = new GUI({ width: 310 })
// const gui = new GUI()

// init_xstate()
init_three()
// init_cannon()
// if (g.getQueryStringByName('cannon') === 'true') window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, { autoUpdate: false })
// init()
requestAnimationFrame(animate)

// function init_xstate() {
//   fsm = createMachine(
//     {
//       id: 'index',
//       initial: 'initial',
//       states: {
//         initial: {},
//         maria: { entry: 'entryMaria' },
//         paladin: { entry: 'entryPaladin', exit: 'exitPaladin' },
//         robot: { entry: 'entryRobot', exit: 'exitRobot' },
//         robotBoss: { entry: 'entryRobotBoss', exit: 'exitRobotBoss' },
//         parrot: { entry: 'entryParrot', exit: 'exitParrot' },
//         mutant: { entry: 'entryMutant', exit: 'exitMutant' },
//       },
//       on: {
//         maria: { target: '.maria' },
//         paladin: { target: '.paladin' },
//         robot: { target: '.robot' },
//         robotBoss: { target: '.robotBoss' },
//         parrot: { target: '.parrot' },
//         mutant: { target: '.mutant' },
//       },
//     },
//     {
//       actions: {
//         entryMaria: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(maria) ///todo: Use ECS?
//           roleControls.setRole(maria)

//           // ai.setTarget(maria)

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domMaria.disabled = true
//         },
//         entryPaladin: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(paladin) ///todo: Use ECS?
//           roleControls.setRole(paladin)

//           // ai.setTarget(paladin)

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domPaladin.disabled = true

//           if (paladin.ai) paladin.ai.enabled = false
//         },
//         exitPaladin: () => {
//           if (paladin.ai) paladin.ai.enabled = true
//         },
//         entryRobot: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(robot) ///todo: Use ECS?
//           roleControls.setRole(robot)

//           // ai.setTarget(robot)

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domRobot.disabled = true

//           if (robot.ai) robot.ai.enabled = false
//         },
//         exitRobot: () => {
//           if (robot.ai) robot.ai.enabled = true
//         },
//         entryRobotBoss: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(robotBoss) ///todo: Use ECS?
//           roleControls.setRole(robotBoss)

//           // ai.setTarget(robotBoss)

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domRobotBoss.disabled = true

//           if (robotBoss.ai) robotBoss.ai.enabled = false
//         },
//         exitRobotBoss: () => {
//           if (robotBoss.ai) robotBoss.ai.enabled = true
//         },
//         entryParrot: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(parrot) ///todo: Use ECS?
//           roleControls.setRole(parrot)

//           // ai.setTarget(parrot)

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domParrot.disabled = true

//           if (parrot.ai) parrot.ai.enabled = false
//         },
//         exitParrot: () => {
//           if (parrot.ai) parrot.ai.enabled = true
//         },
//         entryMutant: () => {
//           if (!window.roleControls) window.roleControls = new RoleControls(mutants[0]) ///todo: Use ECS?
//           roleControls.setRole(mutants[0])

//           // ai.setTarget(mutants[0])

//           Array.prototype.forEach.call(domRoles.children, (domRole) => {
//             domRole.disabled = false
//           })
//           domMutant.disabled = true

//           if (mutants[0].ai) mutants[0].ai.enabled = false
//         },
//         exitMutant: () => {
//           if (mutants[0].ai) mutants[0].ai.enabled = true
//         },
//       },
//     }
//   )

//   window.service = interpret(fsm)
//   window.service.start()
// }

// function init() {
//   window.ground = new Ground() // todo: refactor

//   // window.level = new Level()
//   // level.load()

//   // ground box
//   window.groundBox = new Box(8, 1.3, 30)
//   groundBox.mesh.position.set(-11, 0.65, 0)
//   groundBox.body.position.copy(groundBox.mesh.position)

//   // wall box
//   window.wallBoxL = new Box(2, 12, 6)
//   wallBoxL.isScene = true
//   wallBoxL.mesh.position.set(-24, 6, -12)
//   // wallBoxL.mesh.position.set(-5, 5, 0)
//   wallBoxL.body.position.copy(wallBoxL.mesh.position)

//   window.wallBoxR = new Box(2, 12, 6)
//   wallBoxR.isScene = true
//   wallBoxR.mesh.position.set(-18, 6, -12)
//   // wallBoxR.mesh.position.set(1, 5, 0)
//   wallBoxR.body.position.copy(wallBoxR.mesh.position)

//   // catapult
//   window.catapult = new Catapult(3, 0.2, 4)

//   // teleporter
//   window.teleporter = new Teleporter(0.7, 0.7, 0.7)
//   teleporter.body.position.set(-13, 3.7, -12)
//   teleporter.mesh.position.copy(teleporter.body.position)
//   teleporter.dest.set(-21, 22, -18)

//   window.teleporter2 = new Teleporter(0.7, 0.7, 0.7)
//   teleporter2.body.position.set(-11, 3.7, -12)
//   teleporter2.mesh.position.copy(teleporter2.body.position)
//   teleporter2.dest.set(-18, 220, -18)

//   window.teleporter3 = new Teleporter(0.7, 0.7, 0.7)
//   teleporter3.body.position.set(-9, 3.7, -12)
//   teleporter3.mesh.position.copy(teleporter3.body.position)
//   teleporter3.dest.set(-9, 22, -12)

//   window.teleporter4 = new Teleporter(0.7, 0.7, 0.7)
//   teleporter4.body.position.set(-19, 3, -60)
//   teleporter4.mesh.position.copy(teleporter4.body.position)
//   teleporter4.dest.set(-20, 15, -45)

//   // jumpPoint
//   window.jumpPoint = new JumpPoint(0.7)
//   jumpPoint.body.position.set(-16, 14, -60)
//   // jumpPoint.body.position.set(-16, 12, -55)
//   jumpPoint.mesh.position.copy(jumpPoint.body.position)

//   window.hill = new Hill()

//   // window.torusKnot = new TorusKnot({
//   //   position: new THREE.Vector3(0, 2, 0),
//   // })

//   // window.translatedBox = new TranslatedBox({
//   //   position: new THREE.Vector3(0, 1.5, 0),
//   // })

//   // air box
//   window.airBox = new Box(15, 1.5, 30)
//   airBox.mesh.position.set(-20, 12, -33)
//   airBox.body.position.copy(airBox.mesh.position)

//   window.airBox2 = new Box(6, 1.5, 30)
//   // airBox2.mesh.position.set(-20, 12, -68)
//   airBox2.mesh.position.set(-25, 12, -75)
//   airBox2.body.position.copy(airBox2.mesh.position)

//   window.airBox3 = new Box(6, 1.5, 30)
//   // airBox3.mesh.position.set(-20, 12, -68)
//   airBox3.mesh.position.set(-15, 12, -90)
//   airBox3.body.position.copy(airBox3.mesh.position)

//   window.floatingBoxes = []
//   for (let i = 0; i < 7; i++) {
//     let floatingBox = new FloatingBox(3.7, 0.37, 3.7)
//     // floatingBox.body.position.x = i * 20
//     floatingBox.body.position.y = 2.2 * (i + 1)
//     floatingBox.body.position.z = -12.96 - i * 2.6
//     // floatingBox.body.position.z = -35 - (i % 2) * 5
//     // floatingBox.timeBias = i * 2

//     floatingBoxes.push(floatingBox)
//   }

//   //

//   if (g.getQueryStringByName('roleAirBox') === 'true') {
//     window.maria = new Maria(-20, 15, -45)
//   } else if (g.getQueryStringByName('boss') === 'true') {
//     window.maria = new Maria(-40, 5, 35)
//     // window.maria = new Maria(-40, 5, 15)
//   } else {
//     window.maria = new Maria(-2, 2, 0)
//     // window.maria = new Maria(-2, 2, 8)
//     // window.maria = new Maria(0, 5, -15)
//     // window.maria = new Maria(-35, 5, 0)
//     // window.maria = new Maria(0, 0, 0)
//   }
//   maria.load(() => {
//     // maria.mesh.rotation.set(0, Math.PI, 0)
//     maria.setFacing(0, -1)
//   })
//   window.greatSword = new GreatSword()
//   greatSword.owner = maria

//   if (g.isEnemy) {
//     if (!(g.getQueryStringByName('paladin') === 'false')) {
//       window.paladin = new Paladin({
//         position: new THREE.Vector3(5, 5, 0),
//       })
//       // window.paladin = new Paladin(0, 5, 0)
//       paladin.load(() => {
//         // paladin.mesh.rotation.set(0, Math.PI, 0)
//         paladin.setFacing(-1, 0)
//       })
//       window.sword = new Sword()
//       sword.owner = paladin
//       window.shield = new Shield()
//       shield.owner = paladin
//       // window.flail = new Flail() // TODO: Add to maria greatSword for test.
//       // flail.owner = paladin
//       paladin.ai = new PaladinAi(paladin, 8)
//     }

//     window.mutants = []
//     // let mutantsCount = g.getQueryStringByName('mutants') === 'false' ? 0 : 3
//     let mutantsCount = parseInt(g.getQueryStringByName('mutants'))
//     if (Number.isNaN(mutantsCount)) mutantsCount = 3
//     for (let i = 0; i < mutantsCount; i++) {
//       let mutant = new Mutant({ position: new THREE.Vector3((Math.random() - 0.5) * 28, 2, (Math.random() - 0.5) * 28) })
//       // let mutant = new Mutant(-25, 5, 0)
//       let handKnife = new HandKnife()
//       handKnife.owner = mutant
//       mutant.load()
//       mutants.push(mutant)

//       let ai = new MutantAi(mutant, 4)
//       mutant.ai = ai
//       // ai.isAttack = false
//     }

//     if (!(g.getQueryStringByName('robot') === 'false')) {
//       window.robots = []
//       window.robot = new Robot({
//         position: new THREE.Vector3(6, 2, -4),
//       })
//       robots.push(robot)
//       robot.load()
//       robot.ai = new RobotAi(robot, 8)
//       // robot.ai.isAttack = false

//       // window.robot2 = new Robot(15, 5, 15)
//       // robots.push(robot2)
//       // robot2.load()
//     }

//     if (!(g.getQueryStringByName('parrot') === 'false')) {
//       window.parrot = new Parrot({
//         position: new THREE.Vector3(0, 4, -5),
//       })
//       parrot.load()
//       parrot.ai = new ParrotAi(parrot, 8)
//     }

//     window.robotBoss = new RobotBoss({
//       position: new THREE.Vector3(-40, 5, 10),
//     })
//     robotBoss.load()
//     robotBoss.ai = new RobotBossAi(robotBoss, 8) // TODO: Create in RobotBoss.js? Because need access ai in it.
//   }

//   domMaria.addEventListener('click', (event) => {
//     window.service.send('maria')
//   })
//   domPaladin.addEventListener('click', (event) => {
//     window.service.send('paladin')
//   })
//   domRobot.addEventListener('click', (event) => {
//     window.service.send('robot')
//   })
//   domParrot.addEventListener('click', (event) => {
//     window.service.send('parrot')
//   })
//   domMutant.addEventListener('click', (event) => {
//     window.service.send('mutant')
//   })
//   domRobotBoss.addEventListener('click', (event) => {
//     window.service.send('robotBoss')
//   })

//   window.addEventListener('keydown', (event) => {
//     switch (event.code) {
//       case 'Digit0':
//         window.setting['defeat all mutants (0)']()
//         break
//       case 'Digit1':
//         window.service.send('maria')
//         break
//       case 'Digit2':
//         window.service.send('paladin')
//         break
//       case 'Digit3':
//         window.service.send('robot')
//         break
//       case 'Digit4':
//         window.service.send('parrot')
//         break
//       case 'Digit5':
//         window.service.send('mutant')
//         break
//       case 'Digit6':
//         window.service.send('robotBoss')
//         break
//     }
//   })

//   window.service.send('maria')
//   // window.service.send('paladin')

//   window.setting = {
//     'show debugRenderer': () => {
//       if (!window.cannonDebugRenderer) {
//         window.cannonDebugRenderer = cannonDebugger(scene, world.bodies, {
//           autoUpdate: false,
//         })
//       }
//     },
//     'defeat all mutants (0)': () => {
//       window.mutants.forEach((mutant) => {
//         mutant.health = 0
//         mutant.hit()
//       })
//     },
//     'add flail': () => {
//       window.flail = new Flail({ delegate: maria.swordTipDelegate }) // TODO: Add to maria greatSword for test.
//       flail.owner = maria
//       flail.body.collisionFilterGroup = g.GROUP_ROLE_ATTACKER
//       flail.body.collisionFilterMask = g.GROUP_ENEMY
//       maria.attackSpeed = 0.6
//       maria.whirlwindOneTurnDuration = 0.5
//     },
//   }

//   // gui.add(window.ai, 'enabled').name('simple enemy AI')

//   gui.add(setting, 'show debugRenderer')
//   gui.add(setting, 'defeat all mutants (0)')
//   gui.add(setting, 'add flail')
//   gui.add({ 'show cloud': false }, 'show cloud').onChange((bool) => {
//     if (bool) {
//       if (window.cloud) {
//         window.cloud.mesh.visible = true
//       } else {
//         window.cloud = new Cloud()
//         if (g.isOrbit) cloud.mesh.position.set(0, 2, 0)
//         else cloud.mesh.position.set(-27, 16.5, -25)
//         cloud.mesh.scale.set(12, 6, 12)

//         if (!g.isOrbit) window.role.body.position.set(-24, 16, -25)
//       }
//     } else {
//       window.cloud.mesh.visible = false
//     }
//   })
//   gui.add({ 'show birdFlock': false }, 'show birdFlock').onChange((bool) => {
//     if (bool) {
//       if (window.birdFlock) {
//         window.birdFlock.mesh.visible = true
//       } else {
//         window.birdFlock = new BirdFlock()
//         if (g.isOrbit) birdFlock.mesh.position.set(0, 1, 0)
//         else birdFlock.mesh.position.set(-20, 13, -26)

//         if (!g.isOrbit) window.role.body.position.set(-24, 16, -25)
//       }
//     } else {
//       window.birdFlock.mesh.visible = false
//     }
//   })

//   // gui.add(teleporter.mesh.position, 'x', -50, 50, 1)
//   // gui.add(teleporter.mesh.position, 'y', -50, 50, 1)
//   // gui.add(teleporter.mesh.position, 'z', -50, 50, 1)

//   if (g.getQueryStringByName('gui') === 'false') gui.close()

//   ///todo: fix bug after ```roleControls.role = paladin```.
// }

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 370)
  // camera.position.set(cameraPosX, cameraPosY, cameraPosZ)
  camera.position.set(3, 5, 7)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)
  // scene.fog = new THREE.Fog(0xe0e0e0, 20, 100)

  // clock = new THREE.Clock()

  // lights

  let light = new THREE.HemisphereLight(0x888888, 0x333333)
  light.position.set(0, 7.41, 0)
  scene.add(light)

  window.shadowLight = new THREE.DirectionalLight(0x888888)
  shadowLight.position.set(0, 37, 0)
  shadowLight.castShadow = true
  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 185
  shadowLight.shadow.camera.right = 37
  shadowLight.shadow.camera.left = -37
  shadowLight.shadow.camera.top = 37
  shadowLight.shadow.camera.bottom = -37
  // shadowLight.shadow.radius = 2;
  shadowLight.shadow.radius = 0
  // shadowLight.shadow.bias = - 0.00006;
  scene.add(shadowLight)
  scene.add(shadowLight.target)

  // window.supLight = new THREE.DirectionalLight(0x888888)
  window.supLight = new THREE.DirectionalLight(0x333333)
  supLight.position.set(1, 1, 3)
  scene.add(supLight)

  window.gridHelper = new THREE.GridHelper(100, 100, 0x000000, 0x000000)
  gridHelper.position.y = 0.037
  gridHelper.material.opacity = 0.2
  gridHelper.material.transparent = true
  scene.add(gridHelper)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  // renderer.gammaOutput = true
  // renderer.gammaFactor = 1.3
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  // stats
  stats = new Stats()
  container.appendChild(stats.dom)

  window.controls = new OrbitControls(camera, renderer.domElement)
}

// function init_cannon() {
//   window.fixedTimeStep = 1 / 60
//   // window.fixedTimeStep = 1 / 120
//   window.maxSubSteps = 3
//   // window.maxSubSteps = 30
//   window.world = new CANNON.World()
//   world.defaultMaterial.restitution = 0 ///todo: Why no effect, still bounce?
//   world.defaultContactMaterial.friction = 0.05
//   // world.defaultContactMaterial.friction = 0
//   world.gravity.set(0, -10, 0)
//   world.broadphase = new CANNON.NaiveBroadphase()

//   // world.defaultContactMaterial.contactEquationRelaxation = 10
//   // Prevent bounce, especially after jumpAttack. // todo: Why relaxation affect bounce?
//   // But can cause sink when climbing hill problem.

//   world.addEventListener('beginContact', (event) => {
//     if (event.bodyA) {
//       event.bodyA.dispatchEvent({ type: 'beginContact', body: event.bodyB })
//     }
//     if (event.bodyB) {
//       event.bodyB.dispatchEvent({ type: 'beginContact', body: event.bodyA })
//     }

//     // test log
//     // if (!event.bodyA) {
//     //   console.log('-beginContact;', event.bodyB.name)
//     //   return
//     // }
//     // if (!event.bodyB) {
//     //   console.log('-beginContact;', event.bodyA.name)
//     //   return
//     // }

//     // // if (event.bodyA.name === 'ground' || event.bodyB.name === 'ground') return
//     // // if (event.bodyA.name === 'role' || event.bodyB.name === 'role') {
//     // if ((event.bodyA.name === 'role' || event.bodyB.name === 'role') && (event.bodyA.name === 'box' || event.bodyB.name === 'box')) {
//     //   console.log('beginContact:', event.bodyA.name, event.bodyB.name)
//     // }
//   })
//   world.addEventListener('endContact', (event) => {
//     if (event.bodyA) {
//       event.bodyA.dispatchEvent({ type: 'endContact', body: event.bodyB })
//     }
//     if (event.bodyB) {
//       event.bodyB.dispatchEvent({ type: 'endContact', body: event.bodyA })
//     }

//     // test log
//     // if (!event.bodyA) {
//     //   console.log('-endContact;', event.bodyB.name)
//     //   return
//     // }
//     // if (!event.bodyB) {
//     //   console.log('-endContact;', event.bodyA.name)
//     //   return
//     // }

//     // if ((event.bodyA.name === 'role' || event.bodyB.name === 'role') && (event.bodyA.name === 'box' || event.bodyB.name === 'box')) {
//     //   console.log('endContact:', event.bodyA.name, event.bodyB.name)
//     // }
//   })
// }

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// //

function animate(time) {
  // console.log('animate')
  requestAnimationFrame(animate)

  // var dt = clock.getDelta()

  // updates.forEach((entity) => {
  //   entity.update(dt, time)
  // })

  // if (window.service.state.matches('initial')) return

  // if (window.camera && window.role.gltf) {
  //   if (!window.controls) {
  //     camera.position.set(role.mesh.position.x + cameraPosX, role.mesh.position.y + cameraPosY, role.mesh.position.z + cameraPosZ)
  //     // camera.lookAt(role.mesh.position)
  //   }
  //   shadowLight.position.x = shadowLight.target.position.x = window.role.body.position.x
  //   shadowLight.position.z = shadowLight.target.position.z = window.role.body.position.z
  //   gridHelper.position.x = Math.round(window.role.body.position.x)
  //   gridHelper.position.z = Math.round(window.role.body.position.z)
  // }

  // if (window.cannonDebugRenderer) cannonDebugRenderer.update()
  // world.step(fixedTimeStep, dt, maxSubSteps)
  renderer.render(scene, camera)

  stats.update()
}


const geometry = new THREE.BoxGeometry()
// const geometry = new THREE.PlaneGeometry()
const material = new THREE.MeshStandardMaterial({
  // color: 'red',
  // wireframe: true,
  map: new THREE.TextureLoader().load('./image/uv_grid_opengl.jpg')
})
const mesh = new THREE.Mesh(geometry, material)
window.scene.add(mesh)
// mesh.position.y = 1
// mesh.position.z = -6
mesh.updateMatrixWorld()
window.box = mesh

window.plane = new THREE.Vector3(1,0,0).normalize()
window.constant = 0
// setTimeout(()=>doCut(new THREE.Plane(plane,constant)),1000)
setTimeout(()=>{
  window.cutByPlane(window.box, new THREE.Plane(plane,constant), window.output)
  if (window.output.object1) {
    window.scene.add(window.output.object1)
    window.output.object1.position.x += -.1
    // window.output.object1.updateMatrixWorld()
  }
  if (window.output.object2) {
    window.scene.add(window.output.object2)
    window.output.object2.position.x += .1
    // window.output.object2.updateMatrixWorld()
  }
  window.box.visible = false
},1000)