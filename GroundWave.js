class Ground {
  constructor() {
    // three.js/examples/physics_ammo_terrain.html
    
    let s = this
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    pos.set(0, -1 * gs, 0)
    quat.set(0, 0, 0, 1 * gs)

    // Heightfield parameters
    const terrainWidthExtents = 100/1;
    const terrainDepthExtents = 100/1;
    const terrainWidth = 128;
    const terrainDepth = 128;
    const terrainHalfWidth = terrainWidth / 2;
    const terrainHalfDepth = terrainDepth / 2;
    const terrainMaxHeight = 0/1;
    const terrainMinHeight = - 10/1;

    let heightData = this.generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );

    const geometry = new THREE.PlaneBufferGeometry( terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1 );
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

      // j + 1 because it is the y component that we modify
      vertices[ j + 1 ] = heightData[ i ];

    }

    geometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );
    terrainMesh = new THREE.Mesh( geometry, groundMaterial );
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;

    scene.add( terrainMesh );

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load( "textures/grid.png", function ( texture ) {

      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set( terrainWidth - 1, terrainDepth - 1 );
      groundMaterial.map = texture;
      groundMaterial.needsUpdate = true;

    } );

    //ammo

    const groundShape = createTerrainShape();
    const groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    // Shifts the terrain, since bullet re-centers it on its bounding box.
    groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );
    const groundMass = 0;
    const groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
    const groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
    const groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
    world.addRigidBody( groundBody );
    s.body=groundBody

    s.body.onCollide = (event) => {}

    //cannon
    // let shape=new CANNON.Plane()
    // s.body=new CANNON.Body({
    //   mass: 0,
    //   collisionResponse: 0,
    // })
    // s.body.addShape(shape)
    // s.body.position.set(0,0,0)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    // // s.body.addEventListener("collide", function (event) {
    // //   console.log('collide floor')
    // // })
    // world.addBody(s.body)
  }

  generateHeight( width, depth, minHeight, maxHeight ) {

    // Generates the height data (a sinus wave)

    const size = width * depth;
    const data = new Float32Array( size );

    const hRange = maxHeight - minHeight;
    const w2 = width / 2;
    const d2 = depth / 2;
    const phaseMult = 12;

    let p = 0;

    for ( let j = 0; j < depth; j ++ ) {

      for ( let i = 0; i < width; i ++ ) {

        const radius = Math.sqrt(
          Math.pow( ( i - w2 ) / w2, 2.0 ) +
            Math.pow( ( j - d2 ) / d2, 2.0 ) );

        const height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;

        data[ p ] = height;

        p ++;

      }

    }

    return data;

  }

  createTerrainShape() {

    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
    const heightScale = 1;

    // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
    const upAxis = 1;

    // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
    const hdt = "PHY_FLOAT";

    // Set this to your needs (inverts the triangles)
    const flipQuadEdges = false;

    // Creates height data buffer in Ammo heap
    ammoHeightData = Ammo._malloc( 4 * terrainWidth * terrainDepth );

    // Copy the javascript height data array to the Ammo one.
    let p = 0;
    let p2 = 0;

    for ( let j = 0; j < terrainDepth; j ++ ) {

      for ( let i = 0; i < terrainWidth; i ++ ) {

        // write 32-bit float data to memory
        Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];

        p ++;

        // 4 bytes/float
        p2 += 4;

      }

    }

    // Creates the heightfield physics shape
    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
      terrainWidth,
      terrainDepth,
      ammoHeightData,
      heightScale,
      terrainMinHeight,
      terrainMaxHeight,
      upAxis,
      hdt,
      flipQuadEdges
    );

    // Set horizontal scale
    const scaleX = terrainWidthExtents / ( terrainWidth - 1 );
    const scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
    heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

    heightFieldShape.setMargin( 0.05 );

    return heightFieldShape;

  }
}
