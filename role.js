

class Role{
  constructor(x, y, z){
    let s=this
    s.health=100
    s.oaction={}
    s.mixer
    s.okey={}
    s.actkey=''
    s.speed=.15
    s.direction=vec2()
    s.facing=vec2(0,1)

    s.fsm=new StateMachine({
      init: 'sloading',
      transitions:[
        {name: 'tidle', from:['srunning', 'sattacked', 'sjumped', 'sloading', 'shitted'], to:'sidle'},

        {name: 'trunning', from:'sidle', to:'srunning'},

        {name: 'tattacking', from:['sidle','srunning'], to:'sattacking'},
        {name: 'tattacked', from:['sattacking'], to:'sattacked'},

        {name: 'tjumping', from:['sidle','srunning'], to:'sjumping'},
        {name: 'tjumped', from:['sjumping'], to:'sjumped'},

        {name: 'thitting', from:['sidle', 'sattacking', 'sattacked', 'sjumping', 'sjumped', 'srunning'], to:'shitting'},
        {name: 'thitted', from:['shitting'], to:'shitted'},

      ],
      methods:{
        onInvalidTransition:function(){},
        onTidle: function(){
          s.fadeToAction('idle', .2)
        },
        onTrunning: function(){
          s.fadeToAction('running', .2)
        },
        onTattacking: function(){
          s.fadeToAction('punch', .2)
        },
        onTjumping: function(){
          s.fadeToAction('jump', .2)
          s.body.velocity.y=20
        },
        onThitting: function(){
          s.fadeToAction('hit', .2)
        },
        onThitted(){
          s.fadeToAction('idle', .2)
        }
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

    s.events()

    updates.push(function update(dt){
      // console.log(s.fsm.state)
      if(s.fsm.state==='sloading') return


      if(s.fsm.state!=='sattacking' && s.fsm.state!=='shitting'){
        s.direction=vec2()
        if(s.okey.KeyW||s.okey.ArrowUp) s.direction.add(vec2(0,-1))
        if(s.okey.KeyS||s.okey.ArrowDown) s.direction.add(vec2(0,1))
        if(s.okey.KeyA||s.okey.ArrowLeft) s.direction.add(vec2(-1,0))
        if(s.okey.KeyD||s.okey.ArrowRight) s.direction.add(vec2(1,0))
        s.direction.normalize().multiplyScalar(s.speed)
        s.gltf.scene.rotation.y=-s.facing.angle()+Math.PI/2
      }
      if(s.direction.length()>0){
        s.fsm.trunning()
        s.facing.copy(s.direction)
      }else{
        s.fsm.tidle()
      }
      if(s.fsm.state==='srunning'||s.fsm.state==='sjumping'){
        s.body.position.x+=s.direction.x
        s.body.position.z+=s.direction.y
      }

      s.gltf.scene.position.set(
        s.body.position.x,
        s.body.position.y-body_size,
        s.body.position.z,
      )
      s.mixer.update(dt)
    })
  }

  hit(){
    let s=this
    // console.log('hit()')
    // s.health-=50
    // console.log(this.health)
    // if(s.health<=0){
    //   s.fsm.tdeading()
    // }else{
      s.fsm.thitting()
    // }
  }

  load(){
    let s=this
    return new Promise((resolve,reject)=>{
      var loader = new THREE.GLTFLoader();
      loader.load( './model/fel_lord/a.glb', function( gltf ) {
        // console.log(gltf)
        s.gltf=gltf

        s.gltf.scene.traverse( function ( child ) {
          if ( child.isMesh ) {
            child.material=new THREE.MeshBasicMaterial()
            child.material.map=new THREE.TextureLoader().load('./model/fel_lord/fel_lord.png')
            // child.material.map=new THREE.TextureLoader().load('../model/mutant/a.jpg')
            child.material.map.flipY=false
            child.material.skinning=true
          }
        });
        scene.add(s.gltf.scene)
        // s.gltf.scene.scale.set(.7,.7,.7)
        // s.gltf.scene.position.set(x,y,z)
        s.mixer=new THREE.AnimationMixer(s.gltf.scene)
        s.gltf.animations.forEach(animation=>{
          let name=animation.name.toLowerCase()
          let action=s.mixer.clipAction(animation)
          s.oaction[name]=action
          if(['jump', 'punch', 'dodge', 'hit'].includes(name)){
            action.loop=THREE.LoopOnce
          }
          if([].includes(name)){
            action.loop=THREE.LoopOnce
            action.clampWhenFinished=true
          }
        })
        s.action_act=s.oaction.idle
        s.action_act.play()
        s.mixer.addEventListener('finished',e=>{
          // console.log('finished')
          s.fsm.tattacked()
          s.fsm.tjumped()
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

  events(){
    let s=this
    window.addEventListener('keydown', e=>{
      // console.log(e.key,e.code,e.keyCode)
      s.okey[e.code]=true

      if(!s.gltf) return
      if(e.code===s.actkey) return
      switch(e.code){
        case 'KeyJ':
        case 'Numpad4':
          s.fsm.tattacking()
          break;
        case 'KeyK':
        case 'Numpad5':
          s.fsm.tjumping()
          break;
      }
      s.actkey=e.code
    })
    window.addEventListener('keyup', e=>{
      // console.log(e)
      s.okey[e.code]=false
      s.actkey=''
    })
  }

}
