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
  this.tempPlane_Cut = new THREE.Plane();
  this.tempVector3 = new THREE.Vector3();
  // this.tempVector3_2 = new THREE.Vector3();
  this.tempVector2 = new THREE.Vector2();
  // this.tempVector2_2 = new THREE.Vector2();

  let getIntersectNode = (v0,v1,u0,u1)=>{
    console.log(v0,v1)
    this.tempLine1.start.copy(v0)
    this.tempLine1.end.copy(v1)
    let vI = new THREE.Vector3()
    vI = localPlane.intersectLine(this.tempLine1, vI)
    console.log('vI', vI)

    let total = this.tempVector3.subVectors( v1, v0 ).lengthSq()
    let part = this.tempVector3.subVectors( vI, v0 ).lengthSq()
    let ratio = Math.sqrt(part / total);
    let uvPart = this.tempVector2.subVectors( u1, u0 ).multiplyScalar( ratio );
    let uI = new THREE.Vector2().copy( u0 ).add( uvPart );

    return {vI,uI}
  }

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
  const points2 = [];

  const normals1 = [];
  const normals2 = [];

  const uvs1 = [];
  const uvs2 = [];

  // Transform the plane to object local space
  const localPlane = this.tempPlane_Cut;
  object.updateMatrix();
  transformPlaneToLocalSpace( plane, object.matrix, localPlane );

  // Iterate through the faces adding points to both pieces
  for ( let i = 0; i < numFaces; i ++ ) {

    const va = getVertexIndex( i, 0 );
    const vb = getVertexIndex( i, 1 );
    const vc = getVertexIndex( i, 2 );

    const v0 = new THREE.Vector3(coords[ 3 * va ], coords[ 3 * va + 1 ], coords[ 3 * va + 2 ])
    const v1 = new THREE.Vector3(coords[ 3 * vb ], coords[ 3 * vb + 1 ], coords[ 3 * vb + 2 ])
    const v2 = new THREE.Vector3(coords[ 3 * vc ], coords[ 3 * vc + 1 ], coords[ 3 * vc + 2 ])

    const u0 = new THREE.Vector2(uvs[ 2 * va ], uvs[ 2 * va + 1 ])
    const u1 = new THREE.Vector2(uvs[ 2 * vb ], uvs[ 2 * vb + 1 ])
    const u2 = new THREE.Vector2(uvs[ 2 * vc ], uvs[ 2 * vc + 1 ])

    let d0 = localPlane.distanceToPoint( v0 );
    let d1 = localPlane.distanceToPoint( v1 );
    let d2 = localPlane.distanceToPoint( v2 );

    let sign0 = Math.sign(d0)
    let sign1 = Math.sign(d1)
    let sign2 = Math.sign(d2)

    console.log(sign0, sign1, sign2)

    if(sign0===sign1&&sign1===sign2&&sign2===sign0){
      if(sign0===-1){
        points1.push(v0,v1,v2)
        uvs1.push(u0,u1,u2)
      }else if(sign0===1){
        points2.push(v0,v1,v2)
        uvs2.push(u0,u1,u2)
      }
    }else if(sign0===sign1){
      if(sign0===-1){
        if(sign2===1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v0,v2,u0,u2)
          let {vI:vI1,uI:uI1} = getIntersectNode(v1,v2,u1,u2)
          points1.push(v0,vI1,vI0)
          uvs1.push(u0,uI1,uI0)
          points1.push(v0,v1,vI1)
          uvs1.push(u0,u1,uI1)
          points2.push(v2,vI0,vI1)
          uvs2.push(u2,uI0,uI1)
        }else if(sign2===0){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }
      }else if(sign0===1){
        if(sign2===-1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v0,v2,u0,u2)
          let {vI:vI1,uI:uI1} = getIntersectNode(v1,v2,u1,u2)
          points2.push(v0,vI1,vI0)
          uvs2.push(u0,uI1,uI0)
          points2.push(v0,v1,vI1)
          uvs2.push(u0,u1,uI1)
          points1.push(v2,vI0,vI1)
          uvs1.push(u2,uI0,uI1)
        }else if(sign2===0){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }else if(sign0===0){
        if(sign2===-1){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }else if(sign2===1){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }
    }else if(sign1===sign2){
      if(sign1===-1){
        if(sign0===1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v1,v0,u1,u0)
          let {vI:vI1,uI:uI1} = getIntersectNode(v2,v0,u2,u0)
          points1.push(v1,vI1,vI0)
          uvs1.push(u1,uI1,uI0)
          points1.push(v1,v2,vI1)
          uvs1.push(u1,u2,uI1)
          points2.push(v0,vI0,vI1)
          uvs2.push(u0,uI0,uI1)
        }else if(sign0===0){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }
      }else if(sign1===1){
        if(sign0===-1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v1,v0,u1,u0)
          let {vI:vI1,uI:uI1} = getIntersectNode(v2,v0,u2,u0)
          points2.push(v1,vI1,vI0)
          uvs2.push(u1,uI1,uI0)
          points2.push(v1,v2,vI1)
          uvs2.push(u1,u2,uI1)
          points1.push(v0,vI0,vI1)
          uvs1.push(u0,uI0,uI1)
        }else if(sign0===0){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }else if(sign1===0){
        if(sign0===-1){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }else if(sign0===1){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }
    }else if(sign2===sign0){
      if(sign2===-1){
        if(sign1===1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v2,v1,u2,u1)
          let {vI:vI1,uI:uI1} = getIntersectNode(v0,v1,u0,u1)
          points1.push(v2,vI1,vI0)
          uvs1.push(u2,uI1,uI0)
          points1.push(v2,v0,vI1)
          uvs1.push(u2,u0,uI1)
          points2.push(v1,vI0,vI1)
          uvs2.push(u1,uI0,uI1)
        }else if(sign1===0){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }
      }else if(sign2===1){
        if(sign1===-1){
          let {vI:vI0,uI:uI0} = getIntersectNode(v2,v1,u2,u1)
          let {vI:vI1,uI:uI1} = getIntersectNode(v0,v1,u0,u1)
          points2.push(v2,vI1,vI0)
          uvs2.push(u2,uI1,uI0)
          points2.push(v2,v0,vI1)
          uvs2.push(u2,u0,uI1)
          points1.push(v1,vI0,vI1)
          uvs1.push(u1,uI0,uI1)
        }else if(sign1===0){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }else if(sign2===0){
        if(sign1===-1){
          points1.push(v0,v1,v2)
          uvs1.push(u0,u1,u2)
        }else if(sign1===1){
          points2.push(v0,v1,v2)
          uvs2.push(u0,u1,u2)
        }
      }
    }else if(sign0===0){
      let {vI:vI0,uI:uI0} = getIntersectNode(v1,v2,u1,u2)
      if(sign1===1){
        points1.push(v0,vI0,v2)
        uvs1.push(u0,uI0,u2)
        points2.push(v0,v1,vI0)
        uvs2.push(u0,u1,uI0)
      }else if(sign1===-1){
        points2.push(v0,vI0,v2)
        uvs2.push(u0,uI0,u2)
        points1.push(v0,v1,vI0)
        uvs1.push(u0,u1,uI0)
      }
    }else if(sign1===0){
      let {vI:vI0,uI:uI0} = getIntersectNode(v0,v2,u0,u2)
      if(sign2===1){
        points1.push(v1,vI0,v0)
        uvs1.push(u1,uI0,u0)
        points2.push(v1,v2,vI0)
        uvs2.push(u1,u2,uI0)
      }else if(sign2===-1){
        points2.push(v1,vI0,v0)
        uvs2.push(u1,uI0,u0)
        points1.push(v1,v2,vI0)
        uvs1.push(u1,u2,uI0)
      }
    }else if(sign2===0){
      let {vI:vI0,uI:uI0} = getIntersectNode(v1,v0,u1,u0)
      if(sign0===1){
        points1.push(v2,vI0,v1)
        uvs1.push(u2,uI0,u1)
        points2.push(v2,v0,vI0)
        uvs2.push(u2,u0,uI0)
      }else if(sign0===-1){
        points2.push(v2,vI0,v1)
        uvs2.push(u2,uI0,u1)
        points1.push(v2,v0,vI0)
        uvs1.push(u2,u0,uI0)
      }
    }
  }

  console.log(points1)
  console.log(points2)

  // debugger

  const numPoints1 = points1.length;
  const numPoints2 = points2.length;

  let object1 = null;
  let object2 = null;

  let numObjects = 0;

  if ( numPoints1 > 4 ) {

    // debugger
    object1 = new THREE.Mesh( new ConvexGeometry( points1, uvs1, normals1 ), object.material );
    object1.quaternion.copy( object.quaternion );
    numObjects ++;

  }

  if ( numPoints2 > 4 ) {

    // debugger
    object2 = new THREE.Mesh( new ConvexGeometry( points2, uvs2, normals2 ), object.material );
    object2.quaternion.copy( object.quaternion );
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


// const geometry = new THREE.BoxGeometry()
// const geometry = new THREE.PlaneGeometry()
// const geometry = new THREE.CylinderGeometry()
const geometry = new THREE.TorusKnotGeometry(); geometry.scale(.5,.5,.5)

// const geometry = indexedGeometry.toNonIndexed()
// geometry.clearGroups()

// const material = new THREE.MeshStandardMaterial({
const material = new THREE.MeshBasicMaterial({
  // color: 'red',
  // wireframe: true,
  // side: THREE.DoubleSide,
  map: new THREE.TextureLoader().load('./image/uv_grid_opengl.jpg')
})
const mesh = new THREE.Mesh(geometry, material)
window.scene.add(mesh)
// mesh.position.y = 1
// mesh.position.z = -6
// mesh.rotation.y = Math.PI/4
mesh.updateMatrixWorld()
window.box = mesh

if(true){
  // window.plane = new THREE.Vector3(1,0,0).normalize()
  // window.plane = new THREE.Vector3(0,1,0).normalize()
  // window.plane = new THREE.Vector3(0,0,1).normalize()
  // window.plane = new THREE.Vector3(1,0,1).normalize()
  window.plane = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize()
  // window.constant = 0
  window.constant = (Math.random()-.5)*1
  // window.constant = .5
  // setTimeout(()=>doCut(new THREE.Plane(plane,constant)),1000)
  setTimeout(()=>{
    window.cutByPlane(window.box, new THREE.Plane(plane,constant), window.output)
    if (window.output.object1) {
      window.scene.add(window.output.object1)
      window.output.object1.position.x += -1
      window.output.object1.position.z += 2
      // window.output.object1.updateMatrixWorld()
    }
    if (window.output.object2) {
      window.scene.add(window.output.object2)
      window.output.object2.position.x += 1
      window.output.object2.position.z += 2
      // window.output.object2.updateMatrixWorld()
    }
    // window.box.visible = false
  },1000)
}