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

  // this.segments = [];

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
  // const numPointPairs = numPoints * numPoints;
  // for ( let i = 0; i < numPointPairs; i ++ ) this.segments[ i ] = false;

  const p0 = this.tempVector3_P0;
  const p1 = this.tempVector3_P1;
  const n0 = this.tempVector3_N0;
  const n1 = this.tempVector3_N1;
  const u0 = new THREE.Vector2()
  const u1 = new THREE.Vector2()

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
      // console.log('segment')

      const i0 = segment === 0 ? va : ( segment === 1 ? vb : vc );
      const i1 = segment === 0 ? vb : ( segment === 1 ? vc : va );

      // const segmentState = this.segments[ i0 * numPoints + i1 ];

      // if ( segmentState ) {
      //   // debugger
      //   continue; // The segment already has been processed in another face
      // }

      // Mark segment as processed (also inverted segment)
      // this.segments[ i0 * numPoints + i1 ] = true;
      // this.segments[ i1 * numPoints + i0 ] = true;

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

        intersection.x = Math.round(intersection.x*1000000)/1000000
        intersection.y = Math.round(intersection.y*1000000)/1000000
        intersection.z = Math.round(intersection.z*1000000)/1000000

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

        // if(n0.x===0&&n0.y===0&&n0.z===1) debugger
        // console.log(intersection)
        if(intersection.equals(new THREE.Vector3(-0.19999999999999996, -0.5, 0.5))) debugger
        if(intersection.equals(new THREE.Vector3(-0.2, -0.5, 0.5))) debugger
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

window.container = null
window.stats = null
window.camera = null
window.scene = null
window.renderer = null
init_three()
requestAnimationFrame(animate)

function init_three() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 370)
  camera.position.set(3, 5, 7)
  camera.lookAt(0, 0, 0)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe0e0e0)

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
  // gridHelper.position.y = 0.037
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
  // stats = new Stats()
  // container.appendChild(stats.dom)

  window.controls = new OrbitControls(camera, renderer.domElement)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// //

function animate(time) {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)

  // stats.update()
}


const geometry = new THREE.BoxGeometry().toNonIndexed()
geometry.clearGroups()

// const geometry = new THREE.PlaneGeometry()
// const geometry = new THREE.CylinderGeometry()
// const geometry = new THREE.TorusKnotGeometry()
const material = new THREE.MeshStandardMaterial({
  // color: 'red',
  wireframe: true,
  map: new THREE.TextureLoader().load('./image/uv_grid_opengl.jpg')
})
const mesh = new THREE.Mesh(geometry, material)
window.scene.add(mesh)
// mesh.position.y = 1
// mesh.position.z = -6
mesh.updateMatrixWorld()
window.box = mesh

//

let arr

arr = [...geometry.attributes.position.array]
arr.push(-2,-0,-0)
arr.push(-2,-0,-1)
arr.push(-2,-2,-2)
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( arr, 3 ) );
geometry.attributes.position.needsUpdate=true

// arr = [...geometry.attributes.position.array]
// arr[0] = -2
// arr[1] = -2
// arr[2] = -2
// geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( arr, 3 ) );
// geometry.attributes.position.needsUpdate=true

// arr = [...box.geometry.index.array]
// arr.push(23,21,24)
// box.geometry.setIndex( new THREE.BufferAttribute( new Uint16Array( arr ), 1 ) );
// // box.geometry.index.needsUpdate=true

//

// // window.plane = new THREE.Vector3(1,0,0).normalize()
// window.plane = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize()
// // window.constant = 0
// window.constant = Math.random()-.5
// // window.constant = .2
// // setTimeout(()=>doCut(new THREE.Plane(plane,constant)),1000)
// setTimeout(()=>{
//   window.cutByPlane(window.box, new THREE.Plane(plane,constant), window.output)
//   if (window.output.object1) {
//     window.scene.add(window.output.object1)
//     window.output.object1.position.x += -1
//     // window.output.object1.updateMatrixWorld()
//   }
//   if (window.output.object2) {
//     window.scene.add(window.output.object2)
//     window.output.object2.position.x += 1
//     // window.output.object2.updateMatrixWorld()
//   }
//   window.box.visible = false
// },1000)