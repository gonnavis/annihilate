// import * as THREE from 'three';

class MeshCutter {
  constructor() {
    this.tempLine1 = new THREE.Line3();
    this.localPlane = new THREE.Plane();
    this.tempVector3 = new THREE.Vector3();
    this.tempVector2 = new THREE.Vector2();
  }

  transformFreeVectorInverse(v, m) {
    // input:
    // vector interpreted as a free vector
    // THREE.Matrix4 orthogonal matrix (matrix without scale)

    const x = v.x;
    const y = v.y;
    const z = v.z;
    const e = m.elements;

    v.x = e[0] * x + e[1] * y + e[2] * z;
    v.y = e[4] * x + e[5] * y + e[6] * z;
    v.z = e[8] * x + e[9] * y + e[10] * z;

    return v;
  }

  transformTiedVectorInverse(v, m) {
    // input:
    // vector interpreted as a tied (ordinary) vector
    // THREE.Matrix4 orthogonal matrix (matrix without scale)

    const x = v.x;
    const y = v.y;
    const z = v.z;
    const e = m.elements;

    v.x = e[0] * x + e[1] * y + e[2] * z - e[12];
    v.y = e[4] * x + e[5] * y + e[6] * z - e[13];
    v.z = e[8] * x + e[9] * y + e[10] * z - e[14];

    return v;
  }

  transformPlaneToLocalSpace(plane, m, resultPlane) {
    resultPlane.normal.copy(plane.normal);
    resultPlane.constant = plane.constant;

    const referencePoint = this.transformTiedVectorInverse(plane.coplanarPoint(this.tempVector3), m);

    this.transformFreeVectorInverse(resultPlane.normal, m);

    // recalculate constant (like in setFromNormalAndCoplanarPoint)
    resultPlane.constant = -referencePoint.dot(resultPlane.normal);
  }

  getIntersectNode(v0, v1, n0, n1, u0, u1) {
    this.tempLine1.start.copy(v0);
    this.tempLine1.end.copy(v1);
    let vI = new THREE.Vector3();
    vI = this.localPlane.intersectLine(this.tempLine1, vI);

    const total = this.tempVector3.subVectors(v1, v0).lengthSq();
    const part = this.tempVector3.subVectors(vI, v0).lengthSq();
    const ratio = Math.sqrt(part / total);

    const normalPart = this.tempVector3.subVectors(n1, n0).multiplyScalar(ratio);
    const nI = new THREE.Vector3().copy(n0).add(normalPart);

    const uvPart = this.tempVector2.subVectors(u1, u0).multiplyScalar(ratio);
    const uI = new THREE.Vector2().copy(u0).add(uvPart);

    return {vI, nI, uI};
  }

  getVertexIndex(faceIdx, vert, indices) {
    // vert = 0, 1 or 2.
    const idx = faceIdx * 3 + vert;
    return indices ? indices[idx] : idx;
  }

  createGeometry(points, uvs, normals) {
    const geometry = new THREE.BufferGeometry();

    // buffers

    const aPoints = [];
    points.forEach(point => aPoints.push(point.x, point.y, point.z));
    const aNormals = [];
    normals.forEach(normal => aNormals.push(normal.x, normal.y, normal.z));
    const aUvs = [];
    uvs.forEach(uv => aUvs.push(uv.x, uv.y));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(aPoints, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(aNormals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(aUvs, 2));

    return geometry;
  }

  cutByPlane(object, plane) {
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

    if (indices) {
      indices = indices.array;
      numFaces = indices.length / 3;
    }

    const points1 = [];
    const points2 = [];

    const normals1 = [];
    const normals2 = [];

    const uvs1 = [];
    const uvs2 = [];

    // Transform the plane to object local space
    object.updateMatrix();
    this.transformPlaneToLocalSpace(plane, object.matrix, this.localPlane);

    // Iterate through the faces adding points to both pieces
    for (let i = 0; i < numFaces; i++) {
      const va = this.getVertexIndex(i, 0, indices);
      const vb = this.getVertexIndex(i, 1, indices);
      const vc = this.getVertexIndex(i, 2, indices);

      const v0 = new THREE.Vector3(coords[3 * va], coords[3 * va + 1], coords[3 * va + 2]);
      const v1 = new THREE.Vector3(coords[3 * vb], coords[3 * vb + 1], coords[3 * vb + 2]);
      const v2 = new THREE.Vector3(coords[3 * vc], coords[3 * vc + 1], coords[3 * vc + 2]);

      const n0 = new THREE.Vector3(normals[3 * va], normals[3 * va + 1], normals[3 * va + 2]);
      const n1 = new THREE.Vector3(normals[3 * vb], normals[3 * vb + 1], normals[3 * vb + 2]);
      const n2 = new THREE.Vector3(normals[3 * vc], normals[3 * vc + 1], normals[3 * vc + 2]);

      const u0 = new THREE.Vector2(uvs[2 * va], uvs[2 * va + 1]);
      const u1 = new THREE.Vector2(uvs[2 * vb], uvs[2 * vb + 1]);
      const u2 = new THREE.Vector2(uvs[2 * vc], uvs[2 * vc + 1]);

      const d0 = this.localPlane.distanceToPoint(v0);
      const d1 = this.localPlane.distanceToPoint(v1);
      const d2 = this.localPlane.distanceToPoint(v2);

      const sign0 = Math.sign(d0);
      const sign1 = Math.sign(d1);
      const sign2 = Math.sign(d2);

      if (sign0 === sign1 && sign1 === sign2 && sign2 === sign0) {
        if (sign0 === -1) {
          points1.push(v0, v1, v2);
          normals1.push(n0, n1, n2);
          uvs1.push(u0, u1, u2);
        } else if (sign0 === 1) {
          points2.push(v0, v1, v2);
          normals2.push(n0, n1, n2);
          uvs2.push(u0, u1, u2);
        }
      } else if (sign0 === sign1) {
        if (sign0 === -1) {
          if (sign2 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n1, u0, u2);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
            points1.push(v0, vI1, vI0);
            normals1.push(n0, nI1, nI0);
            uvs1.push(u0, uI1, uI0);
            points1.push(v0, v1, vI1);
            normals1.push(n0, n1, nI1);
            uvs1.push(u0, u1, uI1);
            points2.push(v2, vI0, vI1);
            normals2.push(n2, nI0, nI1);
            uvs2.push(u2, uI0, uI1);
          } else if (sign2 === 0) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          }
        } else if (sign0 === 1) {
          if (sign2 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n2, u0, u2);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
            points2.push(v0, vI1, vI0);
            normals2.push(n0, nI1, nI0);
            uvs2.push(u0, uI1, uI0);
            points2.push(v0, v1, vI1);
            normals2.push(n0, n1, nI1);
            uvs2.push(u0, u1, uI1);
            points1.push(v2, vI0, vI1);
            normals1.push(n2, nI0, nI1);
            uvs1.push(u2, uI0, uI1);
          } else if (sign2 === 0) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        } else if (sign0 === 0) {
          if (sign2 === -1) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          } else if (sign2 === 1) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        }
      } else if (sign1 === sign2) {
        if (sign1 === -1) {
          if (sign0 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v2, v0, n2, n0, u2, u0);
            points1.push(v1, vI1, vI0);
            normals1.push(n1, nI1, nI0);
            uvs1.push(u1, uI1, uI0);
            points1.push(v1, v2, vI1);
            normals1.push(n1, n2, nI1);
            uvs1.push(u1, u2, uI1);
            points2.push(v0, vI0, vI1);
            normals2.push(n0, nI0, nI1);
            uvs2.push(u0, uI0, uI1);
          } else if (sign0 === 0) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          }
        } else if (sign1 === 1) {
          if (sign0 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v2, v0, n2, n0, u2, u0);
            points2.push(v1, vI1, vI0);
            normals2.push(n1, nI1, nI0);
            uvs2.push(u1, uI1, uI0);
            points2.push(v1, v2, vI1);
            normals2.push(n1, n2, nI1);
            uvs2.push(u1, u2, uI1);
            points1.push(v0, vI0, vI1);
            normals1.push(n0, nI0, nI1);
            uvs1.push(u0, uI0, uI1);
          } else if (sign0 === 0) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        } else if (sign1 === 0) {
          if (sign0 === -1) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          } else if (sign0 === 1) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        }
      } else if (sign2 === sign0) {
        if (sign2 === -1) {
          if (sign1 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v2, v1, n2, n1, u2, u1);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v0, v1, n0, n1, u0, u1);
            points1.push(v2, vI1, vI0);
            normals1.push(n2, nI1, nI0);
            uvs1.push(u2, uI1, uI0);
            points1.push(v2, v0, vI1);
            normals1.push(n2, n0, nI1);
            uvs1.push(u2, u0, uI1);
            points2.push(v1, vI0, vI1);
            normals2.push(n1, nI0, nI1);
            uvs2.push(u1, uI0, uI1);
          } else if (sign1 === 0) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          }
        } else if (sign2 === 1) {
          if (sign1 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v2, v1, n2, n1, u2, u1);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v0, v1, n0, n1, u0, u1);
            points2.push(v2, vI1, vI0);
            normals2.push(n2, nI1, nI0);
            uvs2.push(u2, uI1, uI0);
            points2.push(v2, v0, vI1);
            normals2.push(n2, n0, nI1);
            uvs2.push(u2, u0, uI1);
            points1.push(v1, vI0, vI1);
            normals1.push(n1, nI0, nI1);
            uvs1.push(u1, uI0, uI1);
          } else if (sign1 === 0) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        } else if (sign2 === 0) {
          if (sign1 === -1) {
            points1.push(v0, v1, v2);
            normals1.push(n0, n1, n2);
            uvs1.push(u0, u1, u2);
          } else if (sign1 === 1) {
            points2.push(v0, v1, v2);
            normals2.push(n0, n1, n2);
            uvs2.push(u0, u1, u2);
          }
        }
      } else if (sign0 === 0) {
        const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
        if (sign1 === 1) {
          points1.push(v0, vI0, v2);
          normals1.push(n0, nI0, n2);
          uvs1.push(u0, uI0, u2);
          points2.push(v0, v1, vI0);
          normals2.push(n0, n1, nI0);
          uvs2.push(u0, u1, uI0);
        } else if (sign1 === -1) {
          points2.push(v0, vI0, v2);
          normals2.push(n0, nI0, n2);
          uvs2.push(u0, uI0, u2);
          points1.push(v0, v1, vI0);
          normals1.push(n0, n1, nI0);
          uvs1.push(u0, u1, uI0);
        }
      } else if (sign1 === 0) {
        const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n2, u0, u2);
        if (sign2 === 1) {
          points1.push(v1, vI0, v0);
          normals1.push(n1, nI0, n0);
          uvs1.push(u1, uI0, u0);
          points2.push(v1, v2, vI0);
          normals2.push(n1, n2, nI0);
          uvs2.push(u1, u2, uI0);
        } else if (sign2 === -1) {
          points2.push(v1, vI0, v0);
          normals2.push(n1, nI0, n0);
          uvs2.push(u1, uI0, u0);
          points1.push(v1, v2, vI0);
          normals1.push(n1, n2, nI0);
          uvs1.push(u1, u2, uI0);
        }
      } else if (sign2 === 0) {
        const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
        if (sign0 === 1) {
          points1.push(v2, vI0, v1);
          normals1.push(n2, nI0, n1);
          uvs1.push(u2, uI0, u1);
          points2.push(v2, v0, vI0);
          normals2.push(n2, n0, nI0);
          uvs2.push(u2, u0, uI0);
        } else if (sign0 === -1) {
          points2.push(v2, vI0, v1);
          normals2.push(n2, nI0, n1);
          uvs2.push(u2, uI0, u1);
          points1.push(v2, v0, vI0);
          normals1.push(n2, n0, nI0);
          uvs1.push(u2, u0, uI0);
        }
      }
    }

    const numPoints1 = points1.length;
    const numPoints2 = points2.length;

    let object1 = null;
    let object2 = null;

    let numObjects = 0;

    if (numPoints1 > 4) {
      object1 = new THREE.Mesh(this.createGeometry(points1, uvs1, normals1), object.material);
      object1.quaternion.copy(object.quaternion);
      numObjects++;
    }

    if (numPoints2 > 4) {
      object2 = new THREE.Mesh(this.createGeometry(points2, uvs2, normals2), object.material);
      object2.quaternion.copy(object.quaternion);
      numObjects++;
    }

    return {
      object1,
      object2,
      numObjects,
    };
  }
}

export {MeshCutter};
