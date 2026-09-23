import * as T from '../vendor/three/three.module.min.js?v=e59fd3176d3189aa58c0';
import {START, SAMPLES, REEFS} from '../engine/expedition.js?v=e59fd3176d3189aa58c0';

const point = (x, y) => new T.Vector3((x - 4) * 3, (4 - y) * 2.5 + 2, 0);
const TAU = Math.PI * 2;
const CRYSTAL_COLORS = [0x3cffc4, 0xba77ff, 0xffbe58];

// The renderer only follows game state. Movement, collection and collision rules
// stay in expedition.js and are shared by buttons, keyboard and voice commands.
export function createReefScene(host, initial) {
  const canvas = document.createElement('canvas');
  canvas.className = 'reef-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'low-power'}); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.prepend(canvas);
  const scene = new T.Scene();
  scene.background = new T.Color('#075769');
  scene.fog = new T.FogExp2('#075769', .012);
  const camera = new T.PerspectiveCamera(38, 1, .1, 150);
  const look = new T.Vector3(0, 6.4, 0);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let state = initial, previous = initial, disposed = false, visible = false, frame = 0, last = 0, time = 0;
  let thrust = 0, bump = 0, width = 0, height = 0, contextAvailable = true;
  const target = point(state.x, state.y), position = target.clone();
  const pointer = {x:0, y:0};
  const dummy = new T.Object3D();
  const materials = new Set(), geometries = new Set(), textures = new Set();
  let seed = 73;
  const random = () => {seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;};
  const material = (color, extra={}) => {
    const m = new T.MeshStandardMaterial({color, roughness:.76, ...extra}); materials.add(m); return m;
  };
  function mesh(geometry, mat, parent=scene, xyz=[0,0,0], scale=[1,1,1]) {
    geometries.add(geometry); materials.add(mat);
    const m = new T.Mesh(geometry, mat);
    m.position.set(...xyz); m.scale.set(...scale); parent.add(m); return m;
  }
  function ball(parent, mat, xyz, scale) {return mesh(sphere, mat, parent, xyz, scale);}
  function rod(parent, from, to, radius, mat) {
    const a = new T.Vector3(...from), b = new T.Vector3(...to), delta = b.clone().sub(a);
    const m = mesh(new T.CylinderGeometry(radius, radius, delta.length(), 7), mat, parent);
    m.position.copy(a.add(b).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), delta.normalize()); return m;
  }
  function texture(draw, w=128, h=w) {
    const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'), w,h);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);return tex;
  }
  const sphere = new T.SphereGeometry(1, 24, 16);
  const rockGeometry = new T.IcosahedronGeometry(1, 1);
  const glowMap = texture((ctx,w)=>{
    const g=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);
    g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,'rgba(255,255,255,.45)');g.addColorStop(.5,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,w);
  });
  function glow(parent, color, xyz, size, opacity=.5) {
    const mat = new T.SpriteMaterial({map:glowMap,color,opacity,transparent:true,depthWrite:false,blending:T.AdditiveBlending});materials.add(mat);
    const sprite = new T.Sprite(mat);sprite.position.set(...xyz);sprite.scale.setScalar(size);parent.add(sprite);return sprite;
  }
  scene.add(new T.HemisphereLight(0xc8f9e3, 0x29443e, 1.65));
  const sun = new T.DirectionalLight(0xffe3ab, 3.8);
  sun.position.set(-9,26,9);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-22,right:22,top:18,bottom:-18,near:1,far:70});
  sun.shadow.normalBias=.12;sun.shadow.bias=-.0004;scene.add(sun);
  const rim=new T.DirectionalLight(0x33d5ee,1.5);rim.position.set(4,10,-12);scene.add(rim);

  // Sand has real relief; the moving caustics are light patterns in world space.
  const floorGeometry = new T.PlaneGeometry(90,65,100,70);
  floorGeometry.rotateX(-Math.PI/2);
  const floorPositions=floorGeometry.attributes.position;
  for(let i=0;i<floorPositions.count;i++) {
    const x=floorPositions.getX(i),z=floorPositions.getZ(i);
    floorPositions.setY(i,-.8 + Math.sin(x*.23+z*.31)*.22 + Math.sin(x*1.15+z*.6)*.055);
  }
  floorGeometry.computeVertexNormals();
  const sand=material(0xdfc48e,{roughness:.95});
  const sandMap=texture((ctx,w)=>{
    ctx.fillStyle='#bcbcbc';ctx.fillRect(0,0,w,w);
    for(let i=0;i<24000;i++) {
      const v=135+Math.floor(random()*100);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(random()*w,random()*w,1,1);
    }
    ctx.lineWidth=1.2;
    for(let i=0;i<24;i++) {
      ctx.strokeStyle=i%2?'#989898':'#dfdfdf';ctx.beginPath();
      for(let x=0;x<=w;x+=3){const y=i*12+Math.sin(x*.025+i)*3;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    }
  },256);
  sandMap.wrapS=sandMap.wrapT=T.RepeatWrapping;sandMap.repeat.set(16,12);sand.bumpMap=sandMap;sand.bumpScale=.13;
  const causticTime={value:0};
  sand.onBeforeCompile=shader=>{
    shader.uniforms.reefTime=causticTime;
    shader.vertexShader='varying vec3 reefWorld;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nreefWorld = (modelMatrix * vec4(position, 1.0)).xyz;');
    shader.fragmentShader='uniform float reefTime; varying vec3 reefWorld;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float a = sin(reefWorld.x * 1.7 + sin(reefWorld.z * 1.2 + reefTime * .4)) + sin(reefWorld.z * 1.8 - reefTime * .3);
      float b = sin(reefWorld.x * 1.1 - reefWorld.z * .6 + reefTime * .28);
      float caustic = pow(1.0 - abs(a) * .5, 14.0) * .48 + pow(1.0 - abs(b), 22.0) * .24;
      diffuseColor.rgb *= .87 + caustic;
    `);
  };
  const floor=mesh(floorGeometry,sand);floor.receiveShadow=true;
  const stoneMats=[0x536d66,0x728279,0x8c9480,0x375f5d].map(c=>material(c,{flatShading:true}));
  function rock(x,y,z,sx,sy,sz,mat=stoneMats[0]) {
    const r=mesh(rockGeometry,mat,scene,[x,y,z],[sx,sy,sz]);r.rotation.set(random(),random()*TAU,random()*.5);r.castShadow=true;r.receiveShadow=true;return r;
  }
  // Layered cliffs recede into the water behind the navigable plane.
  for(let i=0;i<28;i++) {
    const x=(random()-.5)*68,z=-9-random()*17,h=1+random()*8;
    rock(x,h*.3-1,z,2+random()*4,h,2+random()*3,stoneMats[i%4]);
  }
  for(let i=0;i<40;i++) {
    const x=(random()-.5)*45,z=(random()-.35)*20,s=.12+random()*.6;
    rock(x,-.65+s*.45,z,s,s*.65,s*.8,stoneMats[i%4]);
  }
  // Only these outcrops occupy the command grid. The upper formation is an arch.
  REEFS.forEach((r,i)=>{
    const p=point(r.x,r.y);
    rock(p.x,p.y-.1,-.35,1.3,1.22,1.05,stoneMats[i%4]);
    for(let j=0;j<3;j++)rock(p.x+(random()-.5)*1.5,p.y-.5+random(),-.1+random()*.5,.45,.6,.5,stoneMats[(i+1)%4]);
  });
  rock(.5,7,-4,2.6,4.2,2.5,stoneMats[0]);
  rock(1.5,3.2,-5,1.6,3.8,2,stoneMats[1]);
  rock(-17,1,7,4,2.2,3,stoneMats[0]);rock(17,.8,8,4.5,2.6,4,stoneMats[0]);

  const kelpMats=[material(0x247d62,{side:T.DoubleSide}),material(0x459979,{side:T.DoubleSide}),material(0x7eb793,{side:T.DoubleSide})];
  const kelps=[];
  for(let i=0;i<34;i++) {
    const g=new T.Group();g.position.set((random()-.5)*43,-.6,i<24?-3-random()*10:5+random()*5);scene.add(g);
    const h=1+random()*3;
    for(let j=0;j<3;j++) {
      const blade=new T.PlaneGeometry(.25+random()*.18,h,1,8);
      const p=blade.attributes.position;
      for(let k=0;k<p.count;k++){const v=p.getY(k)/h+.5;p.setX(k,p.getX(k)*Math.sin(v*Math.PI*.85)+Math.sin(v*5)*.2);p.setZ(k,Math.sin(v*4)*.14);}
      blade.computeVertexNormals();
      const leaf=mesh(blade,kelpMats[i%3],g,[(j-1)*.23,h/2,0]);leaf.rotation.y=j*1.1;leaf.rotation.z=(j-1)*.19;
    }
    kelps.push({g,phase:random()*TAU});
  }
  const coralMats=[material(0xdf896f),material(0xcc729b),material(0xe2ae70)];
  function coral(x,y,z,size,color) {
    const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(size);scene.add(g);
    const mat=coralMats[color];rod(g,[0,0,0],[0,1,0],.075,mat);
    for(let j=0;j<5;j++){
      const a=j*2.4,base=.2+j*.12,dx=Math.sin(a)*(.35+j*.07),dz=Math.cos(a)*.28;
      rod(g,[0,base,0],[dx,base+.45,dz],.045,mat);rod(g,[dx,base+.45,dz],[dx*1.1,base+.8,dz],.035,mat);
      ball(g,mat,[dx*1.1,base+.8,dz],[.075,.09,.075]);
    }
  }
  [[-13,-.6,3,1.1,0],[10,-.6,4,1.5,1],[-4,-.6,5,.8,2],[14,-.6,-4,2,0],[-9,-.6,-5,1.8,1],[5,-.6,-7,1.8,2],[-.8,8.2,-.1,.45,0]].forEach(c=>coral(...c));
  const starMat=material(0xe2966b);
  for(const [x,z] of [[-6,6],[7,3],[-12,-2]]) {
    const g=new T.Group();g.position.set(x,-.49,z);g.rotation.y=random()*TAU;scene.add(g);
    for(let j=0;j<5;j++){const a=j*TAU/5;const arm=ball(g,starMat,[Math.cos(a)*.24,0,Math.sin(a)*.24],[.36,.07,.1]);arm.rotation.y=-a;}
  }

  // A tiny working research sub: rivets, glass, skids, lamp and propeller.
  const sub=new T.Group();scene.add(sub);sub.position.copy(position);
  const hull=material(0xffb72d,{metalness:.15,roughness:.28});
  const gold=material(0xf6d88f,{metalness:.65,roughness:.25});
  const dark=material(0x173c48,{metalness:.65,roughness:.28});
  const glass=material(0x177d99,{metalness:.8,roughness:.11,emissive:0x084055,emissiveIntensity:.6});
  const body=ball(sub,hull,[0,0,0],[1.28,.64,.61]);body.castShadow=true;
  ball(sub,gold,[.97,0,0],[.44,.52,.51]);
  const back=mesh(new T.CylinderGeometry(.3,.48,.6,16),dark,sub,[-1.16,0,0]);back.rotation.z=Math.PI/2;
  for(const x of [-.5,.4]) {
    const ring=mesh(new T.TorusGeometry(.255,.052,10,24),gold,sub,[x,.04,.553]);
    ball(sub,glass,[x,.04,.57],[.21,.21,.058]);
    for(let j=0;j<8;j++)ball(sub,dark,[x+Math.cos(j*TAU/8)*.255,.04+Math.sin(j*TAU/8)*.255,.6],[.018,.018,.015]);
    ball(sub,material(0xd9fcf7,{emissive:0x93ffff,emissiveIntensity:.8}),[x-.055,.13,.626],[.065,.027,.012]);
    ring.castShadow=true;
  }
  ball(sub,hull,[-.17,.63,0],[.44,.3,.38]);
  mesh(new T.CylinderGeometry(.27,.27,.13,20),gold,sub,[-.17,.88,0]);
  rod(sub,[-.25,.87,0],[-.25,1.35,0],.055,gold);rod(sub,[-.25,1.35,0],[.04,1.35,0],.06,gold);
  ball(sub,dark,[.08,1.35,0],[.08,.065,.065]);
  for(const z of [-.43,.43]) {
    rod(sub,[-.68,-.48,z],[-.68,-.81,z],.045,gold);rod(sub,[.63,-.48,z],[.63,-.81,z],.045,gold);
    rod(sub,[-1,-.82,z],[1,-.82,z],.055,dark);
  }
  const fin=mesh(new T.BoxGeometry(.55,.08,1.65),hull,sub,[-.9,-.05,0]);fin.rotation.z=.1;
  mesh(new T.BoxGeometry(.5,.85,.07),hull,sub,[-1,-.02,0]);
  const propeller=new T.Group();propeller.position.set(-1.65,0,0);sub.add(propeller);
  ball(propeller,gold,[0,0,0],[.16,.15,.15]);
  for(let i=0;i<3;i++) {
    const blade=ball(propeller,gold,[0,Math.cos(i*TAU/3)*.32,Math.sin(i*TAU/3)*.32],[.065,.4,.115]);blade.rotation.x=i*TAU/3;
  }
  const guard=mesh(new T.TorusGeometry(.68,.04,8,40),dark,sub,[-1.64,0,0]);guard.rotation.y=Math.PI/2;
  ball(sub,gold,[1.24,-.2,.12],[.19,.2,.2]);
  glow(sub,0xffedba,[1.43,-.2,.18],1.1,.75);
  const lamp=new T.SpotLight(0xb1eeec,14,10,.32,.9,1.2);lamp.position.set(1.4,-.18,0);lamp.target.position.set(8,-1,0);sub.add(lamp, lamp.target);
  const lampBeam=mesh(new T.ConeGeometry(1.1,6,32,1,true),new T.MeshBasicMaterial({color:0xb7fff0,transparent:true,opacity:.026,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}),sub,[4.1,-.2,0]);lampBeam.rotation.z=Math.PI/2;
  const nameMap=texture((ctx,w,h)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#403d2e';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('MANTA 01',w/2,45);},256,64);
  mesh(new T.PlaneGeometry(.72,.18),new T.MeshBasicMaterial({map:nameMap,transparent:true,depthWrite:false}),sub,[-.15,-.36,.525]);

  // Crystals retain their numbered destinations so the route stays learnable.
  const crystals=SAMPLES.map((s,i)=>{
    const p=point(s.x,s.y),g=new T.Group();g.position.copy(p);scene.add(g);
    const mat=material(CRYSTAL_COLORS[i],{metalness:.3,roughness:.14,flatShading:true,emissive:CRYSTAL_COLORS[i],emissiveIntensity:.48});
    for(let j=0;j<3;j++) {
      const c=mesh(new T.CylinderGeometry(0,.23,.8,5,1),mat,g,[(j-1)*.26,j===1?.23:0,0],[1,j===1?1.8:1,1]);c.rotation.z=(j-1)*-.2;
      mesh(new T.CylinderGeometry(.23,.17,.65,5),mat,g,[(j-1)*.26,-.5,0]);
    }
    mesh(new T.CylinderGeometry(.75,.93,.22,7),stoneMats[0],g,[0,-1,0]);
    const halo=mesh(new T.TorusGeometry(.83,.018,6,48),new T.MeshBasicMaterial({color:CRYSTAL_COLORS[i],transparent:true,opacity:.55}),g,[0,-.96,0]);halo.rotation.x=Math.PI/2;
    glow(g,CRYSTAL_COLORS[i],[0,0,0],3.7,.35);
    const light=new T.PointLight(CRYSTAL_COLORS[i],3,5,1.3);g.add(light);
    return {g,halo,p};
  });
  const home=new T.Group();home.position.copy(point(START.x,START.y));scene.add(home);
  const homeRing=mesh(new T.TorusGeometry(1.18,.045,8,64),new T.MeshBasicMaterial({color:0xa5ffe0,transparent:true,opacity:.5}),home,[0,0,-.6]);
  rod(home,[0,1,-.6],[0,8,-.6],.024,gold);
  const buoy=ball(home,hull,[0,8,-.6],[.65,.25,.55]);
  mesh(new T.CylinderGeometry(.14,.14,.8,16),gold,home,[0,8.35,-.6]);
  const homeGlow=glow(home,0xa1ffe3,[0,0,-.7],3.6,.22);

  // God rays, surface ripples and suspended specks give the water volume.
  const raysUniform={value:0};
  const rayMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,
    uniforms:{uTime:raysUniform},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`varying vec2 vUv;uniform float uTime;void main(){float edge=pow(sin(vUv.x*3.14159),2.0);float flicker=.8+.2*sin(uTime*.3+vUv.y*6.);float fade=smoothstep(0.,.18,vUv.y)*(.2+vUv.y*.8);gl_FragColor=vec4(.63,.97,.87,edge*fade*flicker*.065);}`});
  for(let i=0;i<8;i++) {
    const ray=mesh(new T.PlaneGeometry(1+random()*1.5,28),rayMat,scene,[-16+i*4.8,12,-3-random()*8]);ray.rotation.z=-.24;
  }
  const surface=mesh(new T.PlaneGeometry(90,65,1,1),new T.MeshBasicMaterial({color:0x82e6d7,transparent:true,opacity:.13,side:T.DoubleSide}),scene,[0,19,0]);surface.rotation.x=Math.PI/2;
  const speckGeometry=new T.BufferGeometry(),speckPositions=new Float32Array(180*3);
  for(let i=0;i<speckPositions.length;i+=3){speckPositions[i]=(random()-.5)*50;speckPositions[i+1]=random()*23;speckPositions[i+2]=(random()-.5)*25;}
  speckGeometry.setAttribute('position',new T.BufferAttribute(speckPositions,3));geometries.add(speckGeometry);
  const speckMat=new T.PointsMaterial({color:0xbae9d6,size:.055,transparent:true,opacity:.4,depthWrite:false});materials.add(speckMat);
  const specks=new T.Points(speckGeometry,speckMat);scene.add(specks);
  const bubbleGeo=new T.SphereGeometry(1,8,6),bubbleMat=new T.MeshPhongMaterial({color:0xa8e7e7,transparent:true,opacity:.35,shininess:100,specular:0xffffff,depthWrite:false});
  geometries.add(bubbleGeo);materials.add(bubbleMat);
  const bubbles=new T.InstancedMesh(bubbleGeo,bubbleMat,64);bubbles.frustumCulled=false;scene.add(bubbles);
  const bubbleData=Array.from({length:64},()=>({x:0,y:0,z:0,age:100,life:1,r:.04}));let bubbleIndex=0,emit=0;
  const sparkGeo=new T.BufferGeometry(),sparkPositions=new Float32Array(48*3);sparkGeo.setAttribute('position',new T.BufferAttribute(sparkPositions,3));geometries.add(sparkGeo);
  const sparkMat=new T.PointsMaterial({color:0xb9ffe9,size:.13,transparent:true,opacity:0,depthWrite:false});materials.add(sparkMat);
  const sparks=new T.Points(sparkGeo,sparkMat);scene.add(sparks);let burst=0;const burstAt=new T.Vector3();
  const sparkDirections=Array.from({length:48},()=>new T.Vector3(random()-.5,random()-.35,random()-.5).normalize().multiplyScalar(1+random()*3));
  const fishMats=[material(0xe8ce88),material(0x69b6c4),material(0xf09977)];
  const fish=[];
  for(let i=0;i<13;i++) {
    const g=new T.Group(),mat=fishMats[i%3];scene.add(g);
    ball(g,mat,[0,0,0],[.32,.13,.085]);
    const tail=mesh(new T.ConeGeometry(.17,.28,3),mat,g,[-.34,0,0]);tail.rotation.z=Math.PI/2;
    ball(g,dark,[.19,.03,.075],[.025,.025,.018]);
    fish.push({g,tail,x:(random()-.5)*45,y:3+random()*12,z:-4-random()*12,speed:.35+random()*.4,phase:random()*TAU});
  }

  fish.forEach(f=>f.g.position.set(f.x,f.y,f.z));

  const labels=[...host.querySelectorAll('[data-reef-marker]')];
  const projected=new T.Vector3();
  function projectLabels() {
    labels.forEach((label,i)=>{
      const p=i===3?point(START.x,START.y):point(SAMPLES[i].x,SAMPLES[i].y);
      p.y+=i===3?1.7:1.6;projected.copy(p).project(camera);
      label.style.left=`${(projected.x*.5+.5)*width}px`;label.style.top=`${(-projected.y*.5+.5)*height}px`;
      label.hidden=i<3&&state.collected.includes(i);
    });
  }
  function resize() {
    width=host.clientWidth;height=host.clientHeight;
    if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;
    // Keep the whole route in view on a narrow screen, rather than cropping it.
    const distance=Math.max(32, 17/(Math.tan(T.MathUtils.degToRad(19))*camera.aspect));
    camera.position.set(4,11,distance);camera.lookAt(look);camera.updateProjectionMatrix();
    draw(0);requestFrame();
  }
  function draw(dt) {
    if(disposed||!contextAvailable)return;
    const motion=reducedMotion.matches?0:dt;
    time+=motion;causticTime.value=time;raysUniform.value=time;
    const lerp=reducedMotion.matches?1:1-Math.exp(-dt*11);
    position.lerp(target,lerp);sub.position.copy(position);
    const moving=position.distanceTo(target)>.02;
    if(!reducedMotion.matches){
      sub.position.y+=Math.sin(time*1.7)*.055;
      sub.rotation.z=T.MathUtils.lerp(sub.rotation.z,Math.max(-.16,Math.min(.16,(target.y-position.y)*.09))+.025*Math.sin(time*1.4),lerp);
      sub.rotation.y=Math.sin(time*.65)*.025;
      sub.position.x+=Math.sin(time*35)*bump*.055;
      propeller.rotation.x+=motion*(moving?38:12+thrust*20);
      kelps.forEach(({g,phase})=>{g.rotation.z=Math.sin(time*.7+phase)*.07;g.rotation.x=Math.sin(time*.5+phase)*.05;});
      fish.forEach(f=>{f.x+=motion*f.speed;if(f.x>28)f.x=-28;f.g.position.set(f.x,f.y+Math.sin(time*.6+f.phase)*.4,f.z);f.tail.rotation.y=Math.sin(time*9+f.phase)*.35;});
      specks.position.y=(time*.07)%3;specks.rotation.y=Math.sin(time*.08)*.018;
    }
    thrust=Math.max(0,thrust-dt*2);bump=Math.max(0,bump-dt*3);
    crystals.forEach((c,i)=>{c.g.visible=!state.collected.includes(i);c.g.rotation.y=Math.sin(time*.4+i)*.12;c.g.position.y=c.p.y+Math.sin(time*1.4+i)*.07;});
    const returning=state.collected.length===3&&!state.complete;
    homeRing.material.opacity=returning?.8+Math.sin(time*3)*.2:.28;
    homeRing.material.color.set(returning?0xffe6a0:0xa5ffe0);
    homeGlow.material.opacity=returning?.55:.22;homeGlow.scale.setScalar(returning?5:3.6);
    buoy.position.y=8+Math.sin(time)*.1;
    emit+=motion*(moving?45:8);
    while(emit>=1){emit--;const b=bubbleData[bubbleIndex++%64];Object.assign(b,{x:position.x-1.7,y:position.y+(random()-.5)*.35,z:(random()-.5)*.4,age:0,life:2+random()*3,r:.028+random()*.07});}
    bubbleData.forEach((b,i)=>{
      b.age+=motion;b.x-=motion*(moving?.6:.18);b.y+=motion*(.45+b.age*.08);
      dummy.position.set(b.x+Math.sin(b.age*3+i)*.08,b.y,b.z);dummy.scale.setScalar(b.age<b.life?b.r*(1+b.age*.15):0);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);
    });bubbles.instanceMatrix.needsUpdate=true;
    if(burst>0){burst=Math.max(0,burst-dt);const age=1.25-burst;sparkMat.opacity=burst/1.25;
      sparkDirections.forEach((v,i)=>{sparkPositions[i*3]=burstAt.x+v.x*age;sparkPositions[i*3+1]=burstAt.y+v.y*age;sparkPositions[i*3+2]=burstAt.z+v.z*age;});sparkGeo.attributes.position.needsUpdate=true;
    } else sparkMat.opacity=0;
    if(!reducedMotion.matches){camera.position.x=T.MathUtils.lerp(camera.position.x,4+pointer.x*.8,lerp*.3);camera.position.y=T.MathUtils.lerp(camera.position.y,11+pointer.y*.35,lerp*.3);camera.lookAt(look);}
    camera.updateMatrixWorld();projectLabels();renderer.render(scene,camera);
  }
  function tick(now){frame=0;if(disposed||!contextAvailable||!visible||document.hidden)return;const dt=Math.min((now-last)/1000||.016,.045);last=now;draw(dt);if(!reducedMotion.matches||position.distanceTo(target)>.01||burst>0)requestFrame();}
  function requestFrame(){if(!disposed&&contextAvailable&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
  function visibility(){last=performance.now();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestFrame();}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=performance.now();requestFrame();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'0px'});observer.observe(host);
  const resizer=new ResizeObserver(resize);resizer.observe(host);
  function onPointer(e){const r=host.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=.5-(e.clientY-r.top)/r.height;}
  function leave(){pointer.x=pointer.y=0;}
  function motionChange(){last=performance.now();requestFrame();}
  host.addEventListener('pointermove',onPointer);host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);reducedMotion.addEventListener('change',motionChange);
  function contextLost(e){e.preventDefault();contextAvailable=false;cancelAnimationFrame(frame);frame=0;host.classList.remove('reef-ready');}
  function contextRestored(){contextAvailable=true;host.classList.add('reef-ready');requestFrame();}
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  host.classList.add('reef-ready');resize();
  return {
    update(next,{reset=false}={}) {
      previous=state;state=next;target.copy(point(next.x,next.y));
      if(reset){position.copy(target);bubbleData.forEach(b=>b.age=100);burst=0;}
      else {
        thrust=1;if(next.bumps>previous.bumps)bump=1;
        if(!reducedMotion.matches&&next.collected.length>previous.collected.length){burst=1.25;burstAt.copy(target);sparkMat.color.set(CRYSTAL_COLORS[next.collected.at(-1)]);}
      }
      requestFrame();
    },
    dispose(){
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();resizer.disconnect();
      host.removeEventListener('pointermove',onPointer);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);reducedMotion.removeEventListener('change',motionChange);
      canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());sun.shadow.map?.dispose();renderer.dispose();canvas.remove();host.classList.remove('reef-ready');
    },
  };
}
