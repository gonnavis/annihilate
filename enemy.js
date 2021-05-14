

class Enemy{
  constructor(x, y, z){
    let s=this
    s.scene=scene
    s.updates=updates
    s.health=100
    s.oaction={}
    s.mixer

    s.fsm=new StateMachine({
      init: 'sloading',
      transitions:[
        {name:'tidle', from:['sattacked', 'shitted', 'sloading'], to:'sidle'},

        {name:'tattacking', from:'sidle', to:'sattacking'},
        {name:'tattacked', from:'sattacking', to:'sattacked'},

        {name:'thitting', from:['sidle', 'sattacking', 'sattacked', 'shitted'], to:'shitting'},
        {name:'thitted', from:'shitting', to:'shitted'},

        {name:'tdeading', from:['sidle', 'sattacking', 'sattacked', 'shitting', 'shitted'], to:'sdeading'},
        {name:'tdeaded', from:['sdeading'], to:'sdeaded'},
      ],
      methods:{
        onInvalidTransition(){},
        onTidle(){
          s.fadeToAction('idle', .2)
        },
        onTattacking(){
          s.fadeToAction('dance', .2)
        },
        onTattacked(){
          s.fadeToAction('idle', .2)
          if(window.role.gltf && s.gltf) window.attacker=new Attacker(scene, updates, s.gltf.scene.position, window.role.gltf.scene.position)
        },
        onThitting(){
          console.log('hit()')
          s.health-=50
          console.log(s.health)
          s.fadeToAction('jump', .2)
        },
        onThitted(){
          s.fadeToAction('idle', .2)
        },
        onTdeading(){
          s.fadeToAction('death', .2)

          let interval
          setTimeout(()=>{
            interval=setInterval(()=>{
              // s.gltf.scene.position.y-=.001
              s.body.mass=0
              s.body.collisionResponse=false
              s.body.position.y-=.0005
              console.log('interval')
              setTimeout(()=>{
                clearInterval(interval)
                s.fsm.tdeaded()
              // },5000)
              },2000)
            })
          }, 2000)
        },
      }
    })

    let body_size=1.5
    s.body=new CANNON.Body({
      mass: 1,
    })
    // let shape=new CANNON.Sphere(body_size)
    let shape=new CANNON.Cylinder(body_size, body_size, 3, 8)
    s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    s.body.angularDamping=1
    s.body.addShape(shape)
    s.body.position.set(x, y, z)
    world.addBody(s.body)

    updates.push(function(dt){
      if(s.fsm.state==='sloading') return
      s.mixer.update(dt)
      s.gltf.scene.position.set(
        s.body.position.x,
        s.body.position.y-body_size,
        s.body.position.z,
      )

      if(!role.gltf) return
      if(s.fsm.state!=='sdeading' && s.fsm.state!=='sdeaded'){
          { // look at role
            let vec2_diff=vec2(
              role.gltf.scene.position.x-s.gltf.scene.position.x,
              role.gltf.scene.position.z-s.gltf.scene.position.z,
            )
            let angle=vec2_diff.angle()
            // console.log(angle)
            s.gltf.scene.rotation.y=-angle+Math.PI/2
          }
      }
    })

    setInterval(()=>{
      s.fsm.tattacking()
    },3000)
  }

  hit(){
    let s=this
    s.fsm.thitting()
    if(s.health<=0){
      s.fsm.tdeading()
    }
  }

  load(){
    let s=this
    return new Promise((resolve,reject)=>{
      var loader = new THREE.GLTFLoader();
      loader.load( './model/RobotExpressive/RobotExpressive.glb', function( gltf ) {
        // console.log('enemy loaded')
        // console.log(gltf)
        s.gltf=gltf
        s.scene.add(gltf.scene)
        gltf.scene.scale.set(.7,.7,.7)
        // gltf.scene.position.set(x,y,z)
        s.mixer=new THREE.AnimationMixer(gltf.scene)
        gltf.animations.forEach(animation=>{
          let name=animation.name.toLowerCase()
          let action=s.mixer.clipAction(animation)
          s.oaction[name]=action
          if(['jump', 'punch', 'dance'].includes(name)){
            action.loop=THREE.LoopOnce
          }
          if(['death'].includes(name)){
            action.loop=THREE.LoopOnce
            action.clampWhenFinished=true
          }
          s.oaction.dance.timeScale=3
        })
        s.action_act=s.oaction.idle
        s.action_act.play()
        s.mixer.addEventListener('finished',e=>{
          // console.log('finished')
          s.fsm.tattacked()
          s.fsm.thitted()
          s.fsm.tidle()
        })
        s.fsm.tidle()
        resolve()
      }, undefined, function( e ) {
        console.error( e );
        reject()
      });
    })
  }

  fadeToAction( name, duration ) {
    let s=this
    // console.log(name)
    // previousAction = s.action_act;
    // activeAction = s.oaction[ name ];

    // if ( previousAction !== activeAction ) {
    //   previousAction.fadeOut( duration );
    // }

    // activeAction
    //   .reset()
    //   .setEffectiveTimeScale( 1 )
    //   .setEffectiveWeight( 1 )
    //   .fadeIn( duration )
    //   .play();

    s.action_act.stop()
    s.oaction[name].reset().play()
    s.action_act=s.oaction[name]

  }

}
