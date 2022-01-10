import {
	BufferGeometry,
	Float32BufferAttribute,
	TetrahedronGeometry
} from '../../../build/three.module.js';
// import { ConvexHull } from '../math/ConvexHull.js';

class ConvexGeometry extends BufferGeometry {

	constructor( points, uvs, normals ) {
		// console.log(points, uvs, normals)
		debugger

		super();

		// buffers

		let aPoints = []
		points.forEach(point=>aPoints.push(point.x, point.y, point.z))
		let aNormals = []
		normals.forEach(normal=>aNormals.push(normal.x, normal.y, normal.z))
		let aUvs = []
		uvs.forEach(uv=>aUvs.push(uv.x, uv.y))

		debugger
		this.setAttribute( 'position', new Float32BufferAttribute( aPoints, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( aNormals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( aUvs, 2 ) );

	}

}

export { ConvexGeometry };
