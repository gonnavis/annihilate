import {
	BufferGeometry,
	Float32BufferAttribute,
	TetrahedronGeometry
} from '../../../build/three.module.js';
import { ConvexHull } from '../math/ConvexHull.js';

class ConvexGeometry extends BufferGeometry {

	constructor( points, uvs, normals ) {
		console.log(points, uvs, normals)
		debugger

		super();

		// buffers

		const vertices = [];
		const nnoorrmmaalls = [];
		const uuvvs = [];

		if ( ConvexHull === undefined ) {

			console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull' );

		}

		const convexHull = new ConvexHull().setFromPoints( points, uvs );

		// generate vertices and nnoorrmmaalls

		const faces = convexHull.faces;
		// debugger

		for ( let i = 0; i < faces.length; i ++ ) {
			
			const face = faces[ i ];
			let edge = face.edge;
			// debugger

			face.normal.x = Math.round(face.normal.x*1000000)/1000000
			face.normal.y = Math.round(face.normal.y*1000000)/1000000
			face.normal.z = Math.round(face.normal.z*1000000)/1000000
			
			// we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

			do {

				const vertexNode = edge.head();
				// debugger
				const point = vertexNode.point; // Vector3
				// const uv = vertexNode.uv;
				let uv;
				for(let i=0;i<points.length;i++){
					// debugger
					if(points[i].equals(point) && face.normal.equals(normals[i])){
						uv = uvs[i]
						break
					}
				}
				// if(!uv&&face.normal.x===0&&face.normal.y===0&&face.normal.z===1) debugger
				if(!uv){
					debugger
					console.log('no uv')
					uv = new THREE.Vector2()
				}

				vertices.push( point.x, point.y, point.z );
				nnoorrmmaalls.push( face.normal.x, face.normal.y, face.normal.z );
				uuvvs.push( uv.x, uv.y );

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		// build geometry

		console.log(vertices, uuvvs)
		debugger

		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( nnoorrmmaalls, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uuvvs, 2 ) );

	}

}

export { ConvexGeometry };
