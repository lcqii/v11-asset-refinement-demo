import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const $ = id => document.getElementById(id);
const viewport = $('viewport');
const status = message => { $('status').textContent = message; };
let model, groups = [], selected = null, isolated = false, wireframe = false, ready = false;
const neutral = new THREE.MeshStandardMaterial({color:0x9eafa3,roughness:.85,metalness:0,side:THREE.DoubleSide});
const accent = new THREE.MeshStandardMaterial({color:0x67966d,roughness:.83,metalness:0,side:THREE.DoubleSide});
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9ece2');
const camera = new THREE.PerspectiveCamera(43,1,.025,150);
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .94;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label','Interactive neutral 3D model');
renderer.domElement.setAttribute('tabindex','0');
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .12;
controls.minDistance = .3;
controls.maxDistance = 45;
controls.maxPolarAngle = Math.PI * .93;
scene.add(new THREE.HemisphereLight(0xffffff,0x6b7d62,1.2));
const key = new THREE.DirectionalLight(0xfffae9,2.5);
key.position.set(-8,14,9); scene.add(key);
key.castShadow=true;
key.shadow.mapSize.set(2048,2048);
Object.assign(key.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:50});
key.shadow.normalBias=.025;
key.target.position.set(.5,.5,-4.5);scene.add(key.target);
const fill = new THREE.DirectionalLight(0xcbd8ef,.6);
fill.position.set(8,6,-10); scene.add(fill);
const selectionBox = new THREE.Box3Helper(new THREE.Box3(),0x688254);
selectionBox.visible = false;
scene.add(selectionBox);

function resize(){
  const {width,height} = viewport.getBoundingClientRect();
  renderer.setSize(width,height,false);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
function render(){ requestAnimationFrame(render); controls.update(); renderer.render(scene,camera); }
resize(); render();

const viewpoints = {
  overview: {position:[-9,11,8], target:[.5,.6,-4.5]},
  aisle: {position:[1.5,2.2,1.6], target:[.6,1.1,-5.6]},
  side: {position:[12,7,2], target:[.5,.8,-4.8]},
};
function setView(name){
  const view = viewpoints[name];
  camera.position.fromArray(view.position);
  controls.target.fromArray(view.target);
  controls.update();
  for(const id of Object.keys(viewpoints)){
    $('view-'+id).classList.toggle('active', id===name);
    $('view-'+id).setAttribute('aria-pressed',String(id===name));
  }
  if(ready) status(`${name[0].toUpperCase()+name.slice(1)} viewpoint. Drag to orbit and scroll to zoom.`);
}
setView('overview');
for(const name of Object.keys(viewpoints)) $('view-'+name).onclick=()=>{
  if(isolated) restoreVisibility();
  setView(name);
};

function restoreVisibility(){
  groups.forEach(g=>g.object.visible=true);
  isolated=false;
  $('isolate').textContent='Isolate';
  $('isolate').setAttribute('aria-pressed','false');
}
function select(group){
  restoreVisibility(); selected=group;
  groups.forEach(g=>{
    g.object.traverse(o=>{if(o.isMesh)o.material=g===group?accent:neutral;});
    g.button.classList.toggle('selected',g===group);
    g.button.setAttribute('aria-pressed',String(g===group));
  });
  $('all-assets').classList.toggle('selected',!group);
  $('all-assets').setAttribute('aria-pressed',String(!group));
  ['focus','isolate','export'].forEach(id=>$(id).disabled=!group);
  if(group){
    selectionBox.box.setFromObject(group.object);
    selectionBox.visible=true;
    $('selection-kind').textContent='SELECTED ASSET · '+group.id.toUpperCase();
    $('selection-title').textContent=group.label;
    $('selection-description').textContent=`${group.meshes.toLocaleString()} mesh parts · neutral geometry · editable GLB`;
    $('scene-label').textContent=group.label.toUpperCase();
    status('Selected '+group.label+'. Focus for a closer view, or isolate and export this group.');
  }else{
    selectionBox.visible=false;
    $('selection-kind').textContent='SCENE OVERVIEW';
    $('selection-title').textContent=`${groups.length} assets, one editable scene`;
    $('selection-description').textContent='Select an asset to inspect its structure and export it.';
    $('scene-label').textContent='COMPLETE SCENE';
    status(`${groups.length} asset groups loaded. Choose an asset from the library or click the model.`);
  }
}
$('all-assets').onclick=()=>{select(null);setView('overview');};
$('focus').onclick=()=>{
  if(!selected)return;
  const sphere=new THREE.Box3().setFromObject(selected.object).getBoundingSphere(new THREE.Sphere());
  const direction=camera.position.clone().sub(controls.target).normalize();
  const vFov=THREE.MathUtils.degToRad(camera.fov);
  const hFov=2*Math.atan(Math.tan(vFov/2)*camera.aspect);
  const distance=sphere.radius/Math.sin(Math.min(vFov,hFov)/2)*1.18;
  controls.target.copy(sphere.center);
  camera.position.copy(sphere.center).addScaledVector(direction,Math.max(distance,1));
  controls.update();
  Object.keys(viewpoints).forEach(id=>{ $('view-'+id).classList.remove('active'); $('view-'+id).setAttribute('aria-pressed','false'); });
  status('Focused on '+selected.label+'. Isolate to hide other groups.');
};
$('isolate').onclick=()=>{
  if(!selected)return;
  isolated=!isolated;
  groups.forEach(g=>g.object.visible=!isolated||g===selected);
  $('isolate').textContent=isolated?'Show all':'Isolate';
  $('isolate').setAttribute('aria-pressed',String(isolated));
  status(isolated?`Showing only ${selected.label}. Click Show all to restore the scene.`:'Complete scene restored.');
};
$('wireframe').onclick=()=>{
  wireframe=!wireframe;
  neutral.wireframe=accent.wireframe=wireframe;
  $('wireframe').setAttribute('aria-pressed',String(wireframe));
  status(wireframe?'Wireframe enabled.':'Solid geometry enabled.');
};
$('search').oninput=event=>{
  const query=event.target.value.trim().toLowerCase();
  let visible=0;
  groups.forEach(g=>{g.button.hidden=!g.label.toLowerCase().includes(query);if(!g.button.hidden)visible++;});
  $('result-count').textContent=String(visible);
  $('empty').hidden=visible>0;
};
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && ready){$('search').value='';$('search').dispatchEvent(new Event('input'));select(null);setView('overview');}
});

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
let down;
renderer.domElement.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY};});
renderer.domElement.addEventListener('pointerup',event=>{
  if(!ready||!down||event.button!==0||Math.hypot(event.clientX-down.x,event.clientY-down.y)>5)return;
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(groups.filter(g=>g.object.visible).map(g=>g.object),true);
  if(hits.length){
    let object=hits[0].object;
    while(object.parent && object.parent!==model)object=object.parent;
    const group=groups.find(g=>g.object===object);
    if(group){select(group);group.button.scrollIntoView({block:'nearest',inline:'nearest'});}
  }
});

$('export').onclick=async()=>{
  if(!selected)return;
  const group=selected;
  $('export').disabled=true;
  status('Preparing editable GLB for '+group.label+'…');
  try{
    const copy=group.object.clone(true);
    copy.visible=true;
    copy.traverse(o=>{o.userData={};if(o.isMesh)o.material=neutral;});
    const output=await new GLTFExporter().parseAsync(copy,{binary:true,onlyVisible:true});
    const url=URL.createObjectURL(new Blob([output],{type:'model/gltf-binary'}));
    const link=document.createElement('a');link.href=url;link.download=group.id+'.glb';
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    status(`Exported ${group.label} as ${group.id}.glb. Open it in Blender or any glTF-compatible editor.`);
  }catch(error){console.error(error);status('Export failed. Please download the complete GLB and select this group in your editor.');}
  finally{$('export').disabled=!selected;}
};

try{
  const manifest=await fetch('./assets/manifest.json').then(response=>{if(!response.ok)throw Error('Manifest unavailable');return response.json();});
  const gltf=await new GLTFLoader().loadAsync('./assets/v11-neutral.glb',progress=>{
    $('load-progress').textContent=progress.total?`Loading geometry · ${Math.round(progress.loaded/progress.total*100)}%`:`Loading geometry · ${(progress.loaded/1e6).toFixed(1)} MB`;
  });
  model=gltf.scene;scene.add(model);model.updateMatrixWorld(true);
  const byName=new Map(model.children.map(object=>[object.name.replaceAll('_',' '),object]));
  groups=manifest.groups.map(item=>{
    const object=byName.get(item.label);
    if(!object)throw Error('Asset group missing: '+item.label);
    let meshes=0;object.traverse(o=>{if(o.isMesh){o.material=neutral;o.castShadow=true;o.receiveShadow=true;meshes++;}});
    const button=document.createElement('button');button.className='asset-row';button.setAttribute('aria-pressed','false');
    const number=document.createElement('span');number.className='asset-number';number.textContent=item.id.slice(-2);
    const label=document.createElement('span');label.textContent=item.label;
    const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    button.append(number,label,arrow);$('asset-list').append(button);
    const group={...item,object,meshes,button};button.onclick=()=>select(group);return group;
  });
  const empty=document.createElement('p');empty.id='empty';empty.className='empty';empty.textContent='No matching assets.';empty.hidden=true;$('asset-list').append(empty);
  $('group-count').textContent=String(groups.length);$('result-count').textContent=String(groups.length);
  ready=true;select(null);$('loading').hidden=true;
}catch(error){
  console.error(error);
  $('loading').innerHTML='<b>The scene could not be opened</b><span>Serve this folder over HTTP and reload. See the README for setup.</span>';
  status('Model loading failed. Check that all repository files are present and use a local web server.');
}
