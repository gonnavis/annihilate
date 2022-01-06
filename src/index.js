

const {vec3, vec4, mat4} = glmw;
window.mat4 = mat4

glmw.init().then(({ready, instance}) => {
  console.log('glmw is now ready and can be used anywhere')
  console.log(ready, instance)
  window.instance = instance
});