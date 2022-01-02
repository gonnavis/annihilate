
import * as THREE from '../lib/three.js/build/three.module.js'
window.THREE = THREE

window.isLogAverageTime = false
window.totalTime = 0
window.count = 0
window.averageTime = 0
THREE.Matrix4.prototype.multiplyMatrices = (function () {
  var cachedFunction = THREE.Matrix4.prototype.multiplyMatrices

  let startTime;

  return function multiplyMatrices() {
    startTime = performance.now()

    var result = cachedFunction.apply(this, arguments) // use .apply() to call it

    window.totalTime += performance.now() - startTime
    window.count += 1
    return result
  }
})()

window.matrix4a = new THREE.Matrix4()
window.matrix4b = new THREE.Matrix4()
window.matrix4c = new THREE.Matrix4()

animate()

function animate() {
  requestAnimationFrame(animate)

  window.matrix4c.multiplyMatrices(matrix4a, matrix4b)

  domAverageTime.innerText = window.totalTime / window.count
}
