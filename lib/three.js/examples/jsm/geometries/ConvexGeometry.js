import {
	BufferGeometry,
	Float32BufferAttribute
} from '../../../build/three.module.js';
import { ConvexHull } from '../math/ConvexHull.js';

class ConvexGeometry extends BufferGeometry {

	constructor( points, uvs ) {
		console.log(points, uvs)
		debugger

		super();

		// buffers

		const vertices = [];
		const normals = [];
		const uuvvs = [];

		if ( ConvexHull === undefined ) {

			console.error( 'THREE.ConvexBufferGeometry: ConvexBufferGeometry relies on ConvexHull' );

		}

		const convexHull = new ConvexHull().setFromPoints( points, uvs );

		// generate vertices and normals

		const faces = convexHull.faces;
		debugger

		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			// we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

			do {

				const vertexNode = edge.head();
				debugger
				const point = vertexNode.point; // Vector3
				const uv = vertexNode.uv;

				vertices.push( point.x, point.y, point.z );
				normals.push( face.normal.x, face.normal.y, face.normal.z );
				uuvvs.push( uv.x, uv.y );

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		// build geometry

		console.log(vertices, uuvvs)
		debugger

		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uuvvs, 2 ) );

	}

}

export { ConvexGeometry };
