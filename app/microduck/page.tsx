'use client';

import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type Body, type Model, label as rawLabel, bodyLabel as rawBodyLabel, descendants, degrees, clampAngle, partDescription, sourceURL } from './model';
import { type Locale, languageKey, translate } from './i18n';
import './microduck.css';


export default function MicroduckLab() {
  const [locale,setLocale]=useState<Locale>('zh');
  const tx=(text:string)=>translate(text,locale);
  const label=(name:string)=>tx(rawLabel(name));
  const bodyLabel=(name:string)=>tx(rawBodyLabel(name));
  const mount = useRef<HTMLDivElement>(null);
  const runtime = useRef<any>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [selected, setSelected] = useState('trunk_base:3');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [explode, setExplode] = useState(0);
  const [mode, setMode] = useState('assembly');
  const [jointBody, setJointBody] = useState('yaw2roll');
  const [angle, setAngle] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]);
  const [isolated, setIsolated] = useState<string | null>(null);
  const [activity, setActivity] = useState(0);
  const [answer, setAnswer] = useState(false);
  const switchMode = (value:string) => {setMode(value);setExplode(0);setAngle(0);setHidden([]);setIsolated(null);};
  const reset = () => {switchMode('assembly');setSelected('trunk_base:3');setJointBody('yaw2roll');view('fit');};
  const view = (preset:string) => {const r=runtime.current;if(!r)return; const {THREE,camera,controls}=r; const direction=preset==='front'?[1,0,.15]:preset==='side'?[0,-1,.15]:preset==='top'?[.001,0,1]:[1,1,.6]; camera.position.copy(controls.target).add(new THREE.Vector3(...direction).normalize().multiplyScalar(r.fitDistance));controls.update();};
  useEffect(()=>{try{const requested=new URLSearchParams(location.search).get('lang');const saved=requested || localStorage.getItem(languageKey);if(saved==='en'||saved==='zh')setLocale(saved);}catch{/* Language switching still works without storage. */}},[]);
  useEffect(()=>{document.title=locale==='zh'?'Microduck 从零件到智能 · 装配与关节':'Microduck A to Z · Assembly & joints';document.documentElement.lang=locale==='zh'?'zh-CN':'en';try{localStorage.setItem(languageKey,locale);}catch{}},[locale]);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    setError(''); setReady(false);
    (async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
      const response = await fetch('/microduck/kinematics.json');
      if (!response.ok) throw new Error('The robot description could not be loaded.');
      const data: Model = await response.json();
      if (disposed || !mount.current) return;
      setModel(data);
      const scene = new THREE.Scene(); scene.background = new THREE.Color('#edf3f7');
      const camera = new THREE.PerspectiveCamera(38, 1, .001, 20);
      camera.up.set(0,0,1); camera.position.set(.42,.38,.3);
      const renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      mount.current.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0,0,.15); controls.minDistance=.12; controls.maxDistance=1.4; controls.enableDamping=true;
      scene.add(new THREE.HemisphereLight(0xffffff,0x637a90,3));
      const light = new THREE.DirectionalLight(0xffffff,3); light.position.set(1,-1,2); scene.add(light);
      const grid = new THREE.GridHelper(.8,20,0xa8bfcc,0xd4e0e7); grid.rotation.x=Math.PI/2; scene.add(grid);
      const groups = new Map<string, any>(); const meshes: any[]=[];
      const loader = new STLLoader(); const geometries = new Map<string, any>();
      let frame=0; let failed=false;
      cleanup = () => { cancelAnimationFrame(frame); controls.dispose(); observer.disconnect(); renderer.dispose(); renderer.domElement.remove(); geometries.forEach(g=>g.dispose()); meshes.forEach(m=>m.material.dispose()); grid.geometry.dispose(); (grid.material as any).dispose(); runtime.current=null; };
      const observer = new ResizeObserver(() => { if (!mount.current) return; const {width,height}=mount.current.getBoundingClientRect(); renderer.setSize(width,height); camera.aspect=width/height; camera.updateProjectionMatrix(); });
      observer.observe(mount.current);
      const names = [...new Set(data.bodies.flatMap(b=>b.geoms.map(g=>g.mesh)))];
      await Promise.all(names.map(async name => { try {const g=await loader.loadAsync('/microduck/meshes/'+encodeURIComponent(name)); if(disposed || failed) {g.dispose();return;} geometries.set(name,g);}catch(e){failed=true;throw e;} }));
      if(disposed) return;
      for(const body of data.bodies) {
        const group=new THREE.Group(); group.position.fromArray(body.pos); group.quaternion.set(body.quat[1],body.quat[2],body.quat[3],body.quat[0]).normalize();
        group.userData.base=group.quaternion.clone(); groups.set(body.name,group);
        (body.parent ? groups.get(body.parent) : scene).add(group);
        body.geoms.forEach((geom,i)=>{
          const material=new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(...geom.color.slice(0,3) as [number,number,number]),roughness:.55,metalness:.15});
          const mesh=new THREE.Mesh(geometries.get(geom.mesh),material);
          mesh.position.fromArray(geom.pos); mesh.quaternion.set(geom.quat[1],geom.quat[2],geom.quat[3],geom.quat[0]).normalize();
          mesh.userData={id:body.name+':'+i,base:mesh.position.clone(),body:body.name};
          group.add(mesh); meshes.push(mesh);
        });
      }
      scene.updateMatrixWorld(true);
      meshes.forEach((mesh,i)=>{ const world=mesh.getWorldPosition(new THREE.Vector3()).sub(new THREE.Vector3(0,0,.15)); if(world.length()<.01) world.set(Math.cos(i),Math.sin(i),.3); world.normalize().multiplyScalar(.13); const q=mesh.parent.getWorldQuaternion(new THREE.Quaternion()).invert(); mesh.userData.offset=world.applyQuaternion(q); });
      const ray=new THREE.Raycaster(); const pointer=new THREE.Vector2(); let down=[0,0];
      renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
      renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return; const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(meshes.filter(m=>m.visible))[0];if(hit)setSelected(hit.object.userData.id);});
      const bounds=new THREE.Box3();meshes.forEach(m=>bounds.expandByObject(m));
      const center=bounds.getCenter(new THREE.Vector3());controls.target.copy(center);
      const size=bounds.getSize(new THREE.Vector3()); const distance=size.length()/2/Math.sin(camera.fov*Math.PI/360)/Math.min(camera.aspect,1)*1.12;
      camera.position.copy(center).add(new THREE.Vector3(1,1,.6).normalize().multiplyScalar(distance));controls.maxDistance=Math.max(1.4,distance*3);
      const axis=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),.07,0xe05c27,.014,.007);scene.add(axis);axis.visible=false;
      runtime.current={meshes,groups,camera,controls,THREE,axis,fitDistance:distance};
      const draw=()=>{controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(draw);}; draw();setReady(true);
    })().catch(e=>{if(!disposed){cleanup();setError(e instanceof Error ? e.message : 'The 3D view could not start.');}});
    return ()=>{disposed=true;cleanup();};
  },[retry]);

  useEffect(()=>{
    const r=runtime.current;if(!r || !model)return;
    const moving=descendants(model,jointBody);
    for(const body of model.bodies) {const group=r.groups.get(body.name);group.quaternion.copy(group.userData.base);if(mode==='joints' && body.name===jointBody && body.joint) {group.quaternion.multiply(new r.THREE.Quaternion().setFromAxisAngle(new r.THREE.Vector3(...body.joint.axis).normalize(),clampAngle(body,angle)*Math.PI/180));}}
    r.meshes.forEach((m:any)=>{m.visible=!hidden.includes(m.userData.id)&&(!isolated||m.userData.id===isolated); m.material.emissive.set(m.userData.id===selected?'#106e9c':mode==='joints'&&moving.has(m.userData.body)?'#153e47':'#000000');m.position.copy(m.userData.base).addScaledVector(m.userData.offset,mode==='assembly'?explode/100:0);});
    r.axis.visible=mode==='joints'; const body=model.bodies.find(b=>b.name===jointBody);
    if(body?.joint){const group=r.groups.get(jointBody);group.updateWorldMatrix(true,false);r.axis.position.copy(group.getWorldPosition(new r.THREE.Vector3()));r.axis.setDirection(new r.THREE.Vector3(...body.joint.axis).applyQuaternion(group.getWorldQuaternion(new r.THREE.Quaternion())).normalize());}
  },[selected,explode,ready,mode,angle,jointBody,hidden,isolated,model]);
  const part = model?.bodies.flatMap(b=>b.geoms.map((g,i)=>({id:b.name+':'+i,name:g.mesh,body:b.name}))).find(p=>p.id===selected);
  const joint=model?.bodies.find(b=>b.name===jointBody);
  const groups = model ? [{title:'Torso',names:new Set(['trunk_base'])},{title:'Head & neck',names:descendants(model,'neck')},{title:'Left leg',names:descendants(model,'yaw2roll')},{title:'Right leg',names:descendants(model,'bearing_roll')}] : [];
  const activities=[{title:'Find a hidden motor',question:'Can you locate a motor inside the torso without removing the motor itself?',try:'In Assembly, select an outer shell and hide it, or separate the parts with the exploded-view slider.',explanation:'A shell can block your view without changing the underlying assembly. Hiding it changes visibility, not the motor’s attachment or function.'},{title:'Compare two joint directions',question:'Will hip yaw and hip roll move the left leg in the same direction?',try:'In Joint motion, move Left hip yaw to 20°. Then select Left hip roll and move it to 20°. Each joint starts from zero.',explanation:'The axes are defined relative to different bodies. Even when both local axes are named Z, their directions in the assembled robot differ. The orange arrow shows the selected axis in the scene.'},{title:'Follow the connected parts',question:'When the left hip turns, will the left foot, right foot, or both move relative to the torso?',try:'Select Left hip yaw in Joint motion and change its angle. Watch the highlighted left leg, including its foot.',explanation:'The left foot moves because it is connected below the left hip in the body hierarchy. The right leg is on another branch. Here the torso stays fixed; real ground contact could change the motion of the whole robot.'}];
  const startActivity=(index:number)=>{setActivity(index);setAnswer(false);switchMode(index===0?'assembly':'joints');setJointBody('yaw2roll');setSelected(index===0?'trunk_base:1':'yaw2roll:0');};
  const automation = useRef<any>(null);
  automation.current={model,ready,mode,selected,jointBody,angle,explode,hidden,isolated,switchMode,reset,locale};
  useEffect(()=>{
    const context=(document as any).modelContext;if(!context?.registerTool)return;
    const lifetime=new AbortController();
    const read=()=>{const s=automation.current;const r=runtime.current;return {locale:s.locale,camera:r?{position:r.camera.position.toArray(),target:r.controls.target.toArray()}:null,ready:s.ready,mode:s.mode,selected:s.selected,jointBody:s.jointBody,angleDegrees:s.angle,explodePercent:s.explode,hidden:s.hidden,isolated:s.isolated,parts:s.model?.bodies.flatMap((b:Body)=>b.geoms.map((g,i)=>({id:b.name+':'+i,label:label(g.mesh)})))??[],joints:s.model?.bodies.filter((b:Body)=>b.joint).map((b:Body)=>({body:b.name,name:b.joint!.name,limitsDegrees:b.joint!.range.map(degrees)}))??[],transforms:r?.meshes.map((m:any)=>{m.updateWorldMatrix(true,false);return {id:m.userData.id,visible:m.visible,position:m.getWorldPosition(new r.THREE.Vector3()).toArray(),quaternion:m.getWorldQuaternion(new r.THREE.Quaternion()).toArray()};})??[]};};
    const register=(tool:any)=>{try{Promise.resolve(context.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{/* The normal UI remains available in unsupported browsers. */}};
    register({name:'read_microduck_state',description:'Read the local robot explorer selection, joints, visibility, and rendered transforms.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:read});
    register({name:'configure_microduck_view',description:'Change the local teaching viewer using the same actions as its visible controls. No physical robot is connected.',inputSchema:{type:'object',properties:{action:{type:'string',enum:['reset','assembly','joint','select','hide','isolate','show_all']},partId:{type:'string'},jointBody:{type:'string'},angleDegrees:{type:'number'},explodePercent:{type:'number'}},required:['action'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async(input:any)=>{
      const s=automation.current;if(!s.ready)throw new Error('The model is not ready.');
      if(!input||typeof input!=='object'||!['reset','assembly','joint','select','hide','isolate','show_all'].includes(input.action))throw new Error('Unknown viewer action.');
      if(Object.keys(input).some(k=>!['action','partId','jointBody','angleDegrees','explodePercent'].includes(k)))throw new Error('Unknown input field.');
      const validPart=s.model.bodies.some((b:Body)=>b.geoms.some((_,i)=>b.name+':'+i===input.partId));
      if(['select','hide','isolate'].includes(input.action)&&!validPart)throw new Error('Unknown component.');
      if(input.action==='joint') {const b=s.model.bodies.find((b:Body)=>b.name===input.jointBody&&b.joint);if(!b||typeof input.angleDegrees!=='number'||!Number.isFinite(input.angleDegrees)||input.angleDegrees<degrees(b.joint.range[0])-1e-8||input.angleDegrees>degrees(b.joint.range[1])+1e-8)throw new Error('Joint angle is outside the model limits.');s.switchMode('joints');setJointBody(b.name);setAngle(clampAngle(b,input.angleDegrees));}
      if(input.action==='assembly'){if(typeof input.explodePercent!=='number'||!Number.isFinite(input.explodePercent)||input.explodePercent<0||input.explodePercent>100)throw new Error('Exploded view must be between 0 and 100.');s.switchMode('assembly');setExplode(input.explodePercent);}
      if(input.action==='reset')s.reset();
      if(input.action==='select')setSelected(input.partId);
      if(input.action==='hide')setHidden(h=>[...new Set([...h,input.partId])]);
      if(input.action==='isolate'){setSelected(input.partId);setHidden([]);setIsolated(input.partId);}
      if(input.action==='show_all'){setHidden([]);setIsolated(null);}
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return read();
    }});
    return()=>lifetime.abort();
  },[]);
  return <main className="duck-lab">
    <header className="duck-header"><a href={`/?lang=${locale}`}>{tx("← Embodied AI course")}</a><span>{tx("INTERACTIVE LAB · 01")}</span><button className="duck-language" aria-label={locale==='zh'?'Switch to English':'切换到中文'} onClick={()=>{const next=locale==='zh'?'en':'zh';setLocale(next);const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(history.state,'',url);}}>{locale==='zh'?'EN':'中文'}</button></header>
    <div className="duck-title"><div><p className="duck-eyebrow">{tx("MICRODUCK A TO Z")}</p><h1>{tx("From parts to motion.")}</h1></div><p>{tx("Explore the body. Discover how its parts move together.")}</p></div>
    <div className="duck-toolbar"><span>{tx("Released simulation assembly")}</span><button onClick={reset}>{tx("Reset everything")}</button></div>
    <div className="duck-workspace">
      <aside className="duck-parts"><h2>{tx("Inside Microduck")}</h2><p>{tx("Select a part here or in the model.")}</p><div className="duck-partlist">{groups.map(section=><details key={section.title} open><summary>{tx(section.title)}</summary>{model?.bodies.filter(b=>section.names.has(b.name)).map(b=><details key={b.name} open={part?.body===b.name}><summary>{bodyLabel(b.name)} <small>{b.geoms.length}</small></summary>{b.geoms.map((g,i)=><button key={i} aria-pressed={selected===b.name+':'+i} onClick={()=>setSelected(b.name+':'+i)}>{label(g.mesh)}{hidden.includes(b.name+':'+i)?(locale==='zh'?' · 已隐藏':' · hidden'):''}</button>)}</details>)}</details>)}</div></aside>
      <section className="duck-stage" aria-label={tx("Interactive robot model")}><div ref={mount} className="duck-canvas" />{!ready&&<div className="duck-loading" role="status">{error?<><p>{tx('The 3D model could not load. Please retry.')}</p><button onClick={()=>setRetry(v=>v+1)}>{tx("Retry loading")}</button></>:<p>{tx("Loading the robot’s geometry…")}</p>}</div>}<div className="duck-stage-note">{tx("Drag to rotate · Scroll or pinch to zoom")}</div></section>
      <aside className="duck-inspector"><p className="duck-eyebrow">{tx("SELECTED PART")}</p><h2>{part?label(part.name):tx('Trunk base')}</h2><p>{tx(part?partDescription(part.name):'Choose a component to inspect it.')}</p><p>{tx("Attached to")}{" "}<strong>{part?bodyLabel(part.body):tx('the torso')}</strong>{tx(". Parts in this group move together.")}</p>
      <div className="duck-actions"><button disabled={!ready} onClick={()=>setHidden(h=>h.includes(selected)?h.filter(id=>id!==selected):[...h,selected])}>{tx(hidden.includes(selected)?'Show part':'Hide part')}</button><button disabled={!ready} aria-pressed={isolated===selected} onClick={()=>{setHidden(h=>h.filter(id=>id!==selected));setIsolated(isolated===selected?null:selected);}}>{tx(isolated===selected?'End isolation':'Isolate part')}</button><button onClick={()=>{setHidden([]);setIsolated(null);}}>{tx("Show all")}</button></div>
      {(hidden.length>0||isolated)&&<p role="status">{isolated?tx('Only the isolated component is shown.'):(locale==='zh'?`已隐藏 ${hidden.length} 个零件。`:`${hidden.length} component${hidden.length===1?' is':'s are'} hidden.`)}</p>}
      <hr/><Tabs value={mode} onValueChange={v=>switchMode(String(v))}><TabsList aria-label={tx("Exploration mode")}><TabsTrigger value="assembly">{tx("Assembly")}</TabsTrigger><TabsTrigger value="joints">{tx("Joint motion")}</TabsTrigger></TabsList><TabsContent value="assembly"><h3>{tx("Look inside")}</h3><p>{tx("Separate the shapes to reveal hidden components. This is an illustration, not a disassembly procedure.")}</p><label id="explode-label">{tx("Exploded view")}{" "}<output>{explode}{tx("%")}</output></label><Slider aria-labelledby="explode-label" disabled={!ready} value={[explode]} onValueChange={v=>setExplode(Array.isArray(v)?v[0]:v)} /><button onClick={()=>setExplode(0)}>{tx("Reassemble")}</button></TabsContent><TabsContent value="joints"><h3>{tx("Move one joint")}</h3><p>{tx("Orange marks the rotation axis. The connected bodies are tinted blue-green. Changing joints restores the zero-angle pose.")}</p><div className="duck-joints" role="group" aria-label={tx("Choose a joint")}>{model?.bodies.filter(b=>b.joint).map(b=><button key={b.name} aria-pressed={jointBody===b.name} onClick={()=>{setJointBody(b.name);setAngle(0);setHidden([]);setIsolated(null);}}>{label(b.joint!.name)}</button>)}</div>{joint?.joint&&<><label id="angle-label">{label(joint.joint.name)} <output>{angle.toFixed(0)}{tx("°")}</output></label><Slider aria-labelledby="angle-label" disabled={!ready} min={degrees(joint.joint.range[0])} max={degrees(joint.joint.range[1])} step={1} value={[angle]} onValueChange={v=>setAngle(clampAngle(joint,Array.isArray(v)?v[0]:v))}/><p className="duck-meta">{tx("Model limits:")}{" "}{degrees(joint.joint.range[0]).toFixed(0)}{tx("° to")}{" "}{degrees(joint.joint.range[1]).toFixed(0)}{tx("°. All other joints remain at 0°.")}</p><button onClick={()=>setAngle(0)}>{tx("Reset pose")}</button></>}<p className="duck-warning">{tx("Pose demonstration only: no gravity, collisions, ground contact, or balance calculation. Model angle limits do not guarantee a collision-free pose.")}</p></TabsContent></Tabs>
      </aside>
    </div>
    <div className="duck-camera" role="group" aria-label={tx("Camera views")}><span>{tx("Camera")}</span>{['fit','front','side','top'].map(p=><button key={p} disabled={!ready} onClick={()=>view(p)}>{tx(p==='fit'?'Fit robot':p+' view')}</button>)}</div>
    <section className="duck-lesson"><p className="duck-eyebrow">{tx("PREDICT · TRY · EXPLAIN")}</p><h2>{tx("If the hip turns, does only the hip move?")}</h2><p>{tx("A joint connects two bodies. Rotating it moves the attached body and everything connected farther along the chain. Try these three short investigations.")}</p><div className="duck-activity-tabs">{activities.map((a,i)=><button key={a.title} aria-pressed={activity===i} onClick={()=>startActivity(i)}>{i+1}{tx(".")}{" "}{tx(a.title)}</button>)}</div><article className="duck-activity"><h3>{tx(activities[activity].question)}</h3><p>{tx(activities[activity].try)}</p><button onClick={()=>setAnswer(!answer)} aria-expanded={answer}>{tx(answer?'Hide explanation':'Show explanation')}</button>{answer&&<p>{tx(activities[activity].explanation)}</p>}</article></section>
    <section className="duck-sources"><h2>{tx("What this model does—and does not—tell us")}</h2><p>{tx("This is the released Microduck simulation assembly, not a complete manufacturing or purchase list. It contains")}{" "}{model?model.bodies.reduce((n,b)=>n+b.geoms.length,0):'…'}{" "}{tx("visible component instances,")}{" "}{model?new Set(model.bodies.flatMap(b=>b.geoms.map(g=>g.mesh))).size:'…'}{" "}{tx("distinct geometry files, and")}{" "}{model?model.bodies.filter(b=>b.joint).length:'…'}{" "}{tx("adjustable joints. Repeated motor shapes are counted separately from controllable joints.")}</p><details><summary>{tx("Sources, assumptions, and attribution")}</summary><p>{tx("Geometry and the body hierarchy come from Pollen Robotics’ Microduck Simulator snapshot, dated by its pinned revision below. The starting pose uses zero for every hinge angle. The torso is fixed; no physics engine runs here. The mouth has no independent control in this selected hierarchy.")}</p><p>{tx("The training repository states that its 3D model files use Creative Commons BY-SA-NC; its source code uses Apache 2.0. The notice does not specify a Creative Commons version. These educational assets are reproduced with their attribution, without claiming a different license. Review the upstream terms before redistributing them, especially for commercial use.")}</p><ul><li><a href={sourceURL} target="_blank" rel="noreferrer">{tx("Pinned geometry and body hierarchy · Pollen Robotics")}</a></li><li><a href="https://github.com/pollen-robotics/microduck_rl#license" target="_blank" rel="noreferrer">{tx("Upstream training repository and license notice")}</a></li><li><a href="https://github.com/pollen-robotics/microduck" target="_blank" rel="noreferrer">{tx("Physical robot software and version-specific hardware")}</a></li></ul>{part&&<p className="duck-meta">{tx("Selected geometry:")}{" "}{part.name}{tx(". Body:")}{" "}{part.body}{tx(".")}</p>}</details><h3>{tx("Where the course goes next")}</h3><p>{tx("Structure and joint motion are the starting point. Later lessons can connect sensor measurements to feedback control, then examine learned walking and evaluate its limits. Those lessons are not implemented in this release.")}</p></section>
  </main>;
}
