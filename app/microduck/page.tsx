'use client';

import { useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { type Body, type Model, label, bodyLabel, descendants, degrees, clampAngle, partDescription, sourceURL } from './model';
import './microduck.css';
import RecordedMotionDemo from './RecordedMotionDemo';


export default function MicroduckLab() {
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
  useEffect(()=>{document.title='Microduck · From body to behavior';document.documentElement.lang='en';},[]);

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
  automation.current={model,ready,mode,selected,jointBody,angle,explode,hidden,isolated,switchMode,reset};
  useEffect(()=>{
    const context=(document as any).modelContext;if(!context?.registerTool)return;
    const lifetime=new AbortController();
    const read=()=>{const s=automation.current;const r=runtime.current;return {ready:s.ready,mode:s.mode,selected:s.selected,jointBody:s.jointBody,angleDegrees:s.angle,explodePercent:s.explode,hidden:s.hidden,isolated:s.isolated,parts:s.model?.bodies.flatMap((b:Body)=>b.geoms.map((g,i)=>({id:b.name+':'+i,label:label(g.mesh)})))??[],joints:s.model?.bodies.filter((b:Body)=>b.joint).map((b:Body)=>({body:b.name,name:b.joint!.name,limitsDegrees:b.joint!.range.map(degrees)}))??[],transforms:r?.meshes.map((m:any)=>{m.updateWorldMatrix(true,false);return {id:m.userData.id,visible:m.visible,position:m.getWorldPosition(new r.THREE.Vector3()).toArray(),quaternion:m.getWorldQuaternion(new r.THREE.Quaternion()).toArray()};})??[]};};
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
    <header className="duck-header"><a href="/">← Embodied AI course</a><nav aria-label="Microduck learning path"><a href="#mechanics">Mechanics</a><a href="#system">System</a><a href="#learn">Learn</a><a href="#local">Local setup</a><a href="https://github.com/pollen-robotics/microduck" target="_blank" rel="noreferrer">Upstream ↗</a></nav></header>
    <section className="duck-hero">
      <img src="/microduck/microduck-studio-demo.jpg" alt="The Microduck robot in its simulation and control interface" />
      <div className="duck-hero-shade" />
      <div className="duck-hero-copy"><p className="duck-eyebrow">MICRODUCK · SYSTEM OVERVIEW</p><h1>A small robot.<br/><em>A complete system.</em></h1><p>Microduck turns a simple question—how can a two-legged robot walk?—into a full journey through mechanics, electronics, software, control, and learning.</p><div><a href="#mechanics">Explore the robot ↓</a><a href="#system">See the whole system →</a></div></div>
      <div className="duck-hero-facts"><span><b>Two legs</b>A real balance problem</span><span><b>Many layers</b>Body to behavior</span><span><b>One goal</b>Learn by building</span></div>
    </section>
    <section className="duck-overview" id="system"><div><p className="duck-eyebrow">WHY MICRODUCK?</p><h2>One robot connects the whole course.</h2></div><p>A walking robot cannot succeed through one model alone. Its body must carry loads, its sensors must estimate motion, its software must coordinate devices, and its controller must turn a requested movement into safe joint targets. Microduck makes those connections small enough to inspect, but rich enough to matter.</p></section>
    <section className="duck-path" id="learn"><article><span>01</span><h3>Mechanical structure</h3><p>Start with the physical arrangement. See how shells, joints, links, and feet form two connected kinematic chains.</p><a href="#mechanics">Open the 3D explorer ↓</a></article><article><span>02</span><h3>Hardware</h3><p>Follow power, sensing, computation, and actuation. Learn what each component contributes to reliable movement.</p><a href="#hardware">Read the overview ↓</a></article><article><span>03</span><h3>Software</h3><p>Trace a command from the user interface through robot services, safety checks, and the motor bus.</p><a href="#software">Follow the command path ↓</a></article><article><span>04</span><h3>Walking and learning</h3><p>Watch a simulated policy, measure what it does, and separate a successful model run from reliable walking.</p><a href="#training">Enter the learning lab ↓</a></article></section>
    <section className="duck-section-intro" id="mechanics"><p className="duck-eyebrow">PART 01 · MECHANICS</p><h2>Look inside before asking it to move.</h2><p>The interactive model below shows how the released simulation assembly is organized. Select a part, separate the assembly, or move one joint to see which connected bodies follow.</p></section>
    <div className="duck-title"><div><p className="duck-eyebrow">MICRODUCK A TO Z</p><h1>From parts to motion.</h1></div><p>Explore the body. Discover how its parts move together.</p></div>
    <div className="duck-toolbar"><span>Released simulation assembly</span><button onClick={reset}>Reset everything</button></div>
    <div className="duck-workspace">
      <aside className="duck-parts"><h2>Inside Microduck</h2><p>Select a part here or in the model.</p><div className="duck-partlist">{groups.map(section=><details key={section.title} open><summary>{section.title}</summary>{model?.bodies.filter(b=>section.names.has(b.name)).map(b=><details key={b.name} open={part?.body===b.name}><summary>{bodyLabel(b.name)} <small>{b.geoms.length}</small></summary>{b.geoms.map((g,i)=><button key={i} aria-pressed={selected===b.name+':'+i} onClick={()=>setSelected(b.name+':'+i)}>{label(g.mesh)}{hidden.includes(b.name+':'+i)?' · hidden':''}</button>)}</details>)}</details>)}</div></aside>
      <section className="duck-stage" aria-label="Interactive robot model"><div ref={mount} className="duck-canvas" />{!ready&&<div className="duck-loading" role="status">{error?<><p>{error}</p><button onClick={()=>setRetry(v=>v+1)}>Retry loading</button></>:<p>Loading the robot’s geometry…</p>}</div>}<div className="duck-stage-note">Drag to rotate · Scroll or pinch to zoom</div></section>
      <aside className="duck-inspector"><p className="duck-eyebrow">SELECTED PART</p><h2>{part?label(part.name):'Trunk base'}</h2><p>{part?partDescription(part.name):'Choose a component to inspect it.'}</p><p>Attached to <strong>{part?bodyLabel(part.body):'the torso'}</strong>. Parts in this group move together.</p>
      <div className="duck-actions"><button disabled={!ready} onClick={()=>setHidden(h=>h.includes(selected)?h.filter(id=>id!==selected):[...h,selected])}>{hidden.includes(selected)?'Show part':'Hide part'}</button><button disabled={!ready} aria-pressed={isolated===selected} onClick={()=>{setHidden(h=>h.filter(id=>id!==selected));setIsolated(isolated===selected?null:selected);}}>{isolated===selected?'End isolation':'Isolate part'}</button><button onClick={()=>{setHidden([]);setIsolated(null);}}>Show all</button></div>
      {(hidden.length>0||isolated)&&<p role="status">{isolated?'Only the isolated component is shown.':`${hidden.length} component${hidden.length===1?' is':'s are'} hidden.`}</p>}
      <hr/><Tabs value={mode} onValueChange={v=>switchMode(String(v))}><TabsList aria-label="Exploration mode"><TabsTrigger value="assembly">Assembly</TabsTrigger><TabsTrigger value="joints">Joint motion</TabsTrigger></TabsList><TabsContent value="assembly"><h3>Look inside</h3><p>Separate the shapes to reveal hidden components. This is an illustration, not a disassembly procedure.</p><label id="explode-label">Exploded view <output>{explode}%</output></label><Slider aria-labelledby="explode-label" disabled={!ready} value={[explode]} onValueChange={v=>setExplode(Array.isArray(v)?v[0]:v)} /><button onClick={()=>setExplode(0)}>Reassemble</button></TabsContent><TabsContent value="joints"><h3>Move one joint</h3><p>Orange marks the rotation axis. The connected bodies are tinted blue-green. Changing joints restores the zero-angle pose.</p><div className="duck-joints" role="group" aria-label="Choose a joint">{model?.bodies.filter(b=>b.joint).map(b=><button key={b.name} aria-pressed={jointBody===b.name} onClick={()=>{setJointBody(b.name);setAngle(0);setHidden([]);setIsolated(null);}}>{label(b.joint!.name)}</button>)}</div>{joint?.joint&&<><label id="angle-label">{label(joint.joint.name)} <output>{angle.toFixed(0)}°</output></label><Slider aria-labelledby="angle-label" disabled={!ready} min={degrees(joint.joint.range[0])} max={degrees(joint.joint.range[1])} step={1} value={[angle]} onValueChange={v=>setAngle(clampAngle(joint,Array.isArray(v)?v[0]:v))}/><p className="duck-meta">Model limits: {degrees(joint.joint.range[0]).toFixed(0)}° to {degrees(joint.joint.range[1]).toFixed(0)}°. All other joints remain at 0°.</p><button onClick={()=>setAngle(0)}>Reset pose</button></>}<p className="duck-warning">Pose demonstration only: no gravity, collisions, ground contact, or balance calculation. Model angle limits do not guarantee a collision-free pose.</p></TabsContent></Tabs>
      </aside>
    </div>
    <div className="duck-camera" role="group" aria-label="Camera views"><span>Camera</span>{['fit','front','side','top'].map(p=><button key={p} disabled={!ready} onClick={()=>view(p)}>{p==='fit'?'Fit robot':p+' view'}</button>)}</div>
    <section className="duck-lesson"><p className="duck-eyebrow">PREDICT · TRY · EXPLAIN</p><h2>If the hip turns, does only the hip move?</h2><p>A joint connects two bodies. Rotating it moves the attached body and everything connected farther along the chain. Try these three short investigations.</p><div className="duck-activity-tabs">{activities.map((a,i)=><button key={a.title} aria-pressed={activity===i} onClick={()=>startActivity(i)}>{i+1}. {a.title}</button>)}</div><article className="duck-activity"><h3>{activities[activity].question}</h3><p>{activities[activity].try}</p><button onClick={()=>setAnswer(!answer)} aria-expanded={answer}>{answer?'Hide explanation':'Show explanation'}</button>{answer&&<p>{activities[activity].explanation}</p>}</article></section>
    <section className="duck-system-stories">
      <article id="hardware"><p className="duck-eyebrow">PART 02 · HARDWARE</p><h2>The body makes every action physical.</h2><p>Motors create joint torque, bearings guide rotation, and the feet exchange forces with the ground. Sensors report joint motion and body orientation, while the onboard computer and power system keep the control loop running. A policy can only command movements that this physical system can produce.</p><ul><li><b>Actuation</b><span>Motors turn desired joint positions into torque and motion.</span></li><li><b>Sensing</b><span>Joint and body measurements tell the controller what happened.</span></li><li><b>Computation</b><span>Onboard services connect commands, estimates, and motor targets.</span></li></ul><a className="duck-primary-link" href="/microduck-lab/hardware.html">Study the hardware in detail →</a></article>
      <article id="software"><p className="duck-eyebrow">PART 03 · SOFTWARE</p><h2>A request is not yet an action.</h2><p>When a user asks Microduck to walk forward, the request moves through several software layers. The runtime interprets the command, assembles the current observation, evaluates the movement policy, applies limits, and sends targets to the motors. Each layer answers a different question and can fail in a different way.</p><ol><li><span>1</span><p><b>Request</b>The user specifies the intended movement.</p></li><li><span>2</span><p><b>Observe</b>The robot measures its joints and orientation.</p></li><li><span>3</span><p><b>Decide</b>The policy proposes the next joint targets.</p></li><li><span>4</span><p><b>Protect and apply</b>Safety logic checks the proposal before hardware execution.</p></li></ol><a className="duck-primary-link" href="/microduck-lab/software.html">Follow the full software path →</a></article>
      <article id="training"><p className="duck-eyebrow">PART 04 · WALKING & TRAINING</p><h2>Learning is an experiment, not a magic step.</h2><p>During reinforcement learning, many simulated robots try actions and receive rewards. The policy improves by using that experience, but a higher reward does not automatically mean the robot walks straight, stops correctly, or transfers to hardware. Those claims require separate measurements.</p><div className="duck-training-status"><b>What the demonstration shows</b><p>The embedded viewer below replays joint motion saved from a reference MuJoCo evaluation. It is not a video, live physics, or a policy running in your browser. You can rotate the 3D view and inspect the recorded motion without leaving this page.</p></div></article>
    </section>
    <section className="duck-embedded-demo" aria-labelledby="demo-title"><div><p className="duck-eyebrow">RECORDED SIMULATION</p><h2 id="demo-title">See the result, then learn how to reproduce it.</h2><p>This reference gives every student a concrete starting point. The playback shows what MuJoCo calculated during a saved evaluation. Use it to understand the output and controls; use the local workflow below to evaluate your own model.</p></div><div className="duck-demo-frame"><RecordedMotionDemo/></div><p className="duck-demo-caption"><b>Recorded reference evaluation.</b> Camera movement and timeline controls are interactive. Robot motion is replayed from saved data; no physics is running on the website.</p></section>
    <section className="duck-local-guide" id="local"><div className="duck-local-intro"><p className="duck-eyebrow">RUN IT ON YOUR MAC</p><h2>Your model belongs in your local simulator.</h2><p>The public website is the shared example. Your own training and evaluation stay on your computer, where Python can use MuJoCo and read the policy you produced. The local browser page is only the interface; the companion Python process performs the evaluation.</p></div><ol><li><span>01</span><div><h3>Get the course project</h3><p>Clone the course repository and open the <code>microduck-training-lab</code> directory. The repository keeps the interface, evaluation code, and expected file formats together.</p></div></li><li><span>02</span><div><h3>Prepare the simulator</h3><p>Use Python 3.12 with MuJoCo, ONNX Runtime, NumPy, and the required BAM motor model. Keep this Mac environment separate from Linux-only CUDA packages.</p></div></li><li><span>03</span><div><h3>Train and export a policy</h3><p>The training recipe produces a policy that maps 61 observation values to 14 joint targets. Preserve the robot revision, recipe, and model checksum with every run so the result remains traceable.</p></div></li><li><span>04</span><div><h3>Evaluate locally in MuJoCo</h3><p>Start the local companion with <code>python server.py</code>, open the local address it prints, and choose <strong>Run local tests</strong>. MuJoCo then calculates new stand, walk, and turn trials from your policy.</p></div></li><li><span>05</span><div><h3>Judge the behavior</h3><p>Inspect the recorded motion together with speed, heading, balance, stopping, and fall measurements. A completed training run means only that optimization ended; these tests determine whether the learned behavior matches the task.</p></div></li></ol><div className="duck-guide-note"><b>Course-ready local training is still being completed.</b><p>The evaluation path already runs on the Mac. The exact Mac training command and dependency setup will be published after that workflow is validated end to end. Until then, the website does not imply that local training is ready.</p><a href="https://github.com/memxlife/EmbodiedAI-V2/tree/main/microduck-training-lab" target="_blank" rel="noreferrer">Open the local lab guide on GitHub ↗</a></div></section>
    <section className="duck-sources"><h2>What this model does—and does not—tell us</h2><p>This is the released Microduck simulation assembly, not a complete manufacturing or purchase list. It contains {model?model.bodies.reduce((n,b)=>n+b.geoms.length,0):'…'} visible component instances, {model?new Set(model.bodies.flatMap(b=>b.geoms.map(g=>g.mesh))).size:'…'} distinct geometry files, and {model?model.bodies.filter(b=>b.joint).length:'…'} adjustable joints. Repeated motor shapes are counted separately from controllable joints.</p><details><summary>Sources, assumptions, and attribution</summary><p>Geometry and the body hierarchy come from Pollen Robotics’ Microduck Simulator snapshot, dated by its pinned revision below. The starting pose uses zero for every hinge angle. The torso is fixed; no physics engine runs here. The mouth has no independent control in this selected hierarchy.</p><p>The training repository states that its 3D model files use Creative Commons BY-SA-NC; its source code uses Apache 2.0. The notice does not specify a Creative Commons version. These educational assets are reproduced with their attribution, without claiming a different license. Review the upstream terms before redistributing them, especially for commercial use.</p><ul><li><a href={sourceURL} target="_blank" rel="noreferrer">Pinned geometry and body hierarchy · Pollen Robotics</a></li><li><a href="https://github.com/pollen-robotics/microduck_rl#license" target="_blank" rel="noreferrer">Upstream training repository and license notice</a></li><li><a href="https://github.com/pollen-robotics/microduck" target="_blank" rel="noreferrer">Physical robot software and version-specific hardware</a></li></ul>{part&&<p className="duck-meta">Selected geometry: {part.name}. Body: {part.body}.</p>}</details></section>
  </main>;
}
