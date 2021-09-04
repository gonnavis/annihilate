
//new Attacker(scene, updates, enemy.gltf.scene.position, gltf.scene.position)
class Axes{
  constructor(){
    let s=this

    let body_size=1
    s.is_hit=false
    s.body=new CANNON.Body({
      mass: 0,
      type: CANNON.Body.KINEMATIC,
    })
    s.body.collisionResponse=0
    let shape=new CANNON.Box(new CANNON.Vec3(body_size, body_size, body_size))
    s.body.addShape(shape)
    world.addBody(s.body)

    s.body.addEventListener('collide', e=>{

      if(e.body===enemy.body ){
        if (role.xstateService.state.value === 'attack') enemy.hit() // todo: refactor
      }
    })

    function update(){
      if(role.gltf){
        let vec3_temp=vec3()
        role.gltf.scene.children[0].children[0].children[1].children[0].getWorldPosition(vec3_temp)
        s.body.position.copy(vec3_temp)
      }
    }
    updates.push(update)
  }


}
