'use client';

import { useEffect, useRef, useState } from 'react';

type Frame = {time:number; poses:number[][]};
type Episode = {name:string; frames:Frame[]; behavior_passed:boolean; fell:boolean};
type Geometry = {vertices:number[];faces:number[];color:number[]};
type Motion = {geometry:Geometry[];episodes:Episode[]};

export default function RecordedMotionDemo() {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<any>(null);
  const [data,setData]=useState<Motion|null>(null);
  const [episode,setEpisode]=useState(0);
  const [index,setIndex]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [status,setStatus]=useState('Loading the recorded motion…');

  useEffect(()=>{
    let disposed=false; let cleanup=()=>{};
    (async()=>{
      const [THREE,{OrbitControls},motionResponse]=await Promise.all([
        import('three'),import('three/addons/controls/OrbitControls.js'),fetch('/microduck/demo-motion.json.gz')
      ]);
      if(!motionResponse.ok) throw new Error('The recorded demonstration could not be loaded.');
      const packed=await motionResponse.arrayBuffer();let text='';
      try {text=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).text();} catch {text=new TextDecoder().decode(packed);}
      const motion:Motion=JSON.parse(text);
      if(disposed||!host.current)return;
      const scene=new THREE.Scene(); scene.background=new THREE.Color('#081827');
      const camera=new THREE.PerspectiveCamera(42,1,.001,100); camera.up.set(0,0,1);camera.position.set(.55,-.65,.38);
      const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.current.appendChild(renderer.domElement);
      const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,.13);controls.enableDamping=true;controls.update();
      scene.add(new THREE.HemisphereLight(0xffffff,0x56667a,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(1,-1,2);scene.add(light);
      const grid=new THREE.GridHelper(3,30,0x526b86,0x273c53);grid.rotation.x=Math.PI/2;scene.add(grid);
      const meshes=motion.geometry.map(g=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(g.vertices,3));geometry.setIndex(g.faces);geometry.computeVertexNormals();const material=new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(...g.color.slice(0,3) as [number,number,number]),roughness:.6,metalness:.15});const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);return mesh;});
      const pose=(frame:Frame)=>frame.poses.forEach((p,i)=>{const mesh=meshes[i];if(!mesh)return;mesh.position.set(p[0],p[1],p[2]);const m=new THREE.Matrix4().set(p[3],p[4],p[5],0,p[6],p[7],p[8],0,p[9],p[10],p[11],0,0,0,0,1);mesh.quaternion.setFromRotationMatrix(m);});
      const observer=new ResizeObserver(()=>{if(!host.current)return;const {width,height}=host.current.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});observer.observe(host.current);
      let frameId=0;const draw=()=>{controls.update();renderer.render(scene,camera);frameId=requestAnimationFrame(draw);};draw();
      player.current={pose};setData(motion);pose(motion.episodes[0].frames[0]);setStatus('Recorded simulation ready.');
      cleanup=()=>{cancelAnimationFrame(frameId);observer.disconnect();controls.dispose();renderer.dispose();renderer.domElement.remove();meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});player.current=null;};
    })().catch(e=>{if(!disposed)setStatus(e instanceof Error?e.message:'The recorded demonstration could not start.');});
    return()=>{disposed=true;cleanup();};
  },[]);

  const frames=data?.episodes[episode]?.frames??[];
  useEffect(()=>{if(frames[index])player.current?.pose(frames[index]);},[frames,index]);
  useEffect(()=>{if(!playing||frames.length<2)return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%frames.length),100);return()=>clearInterval(timer);},[playing,frames.length]);
  const choose=(value:number)=>{setEpisode(value);setIndex(0);setPlaying(false);};
  const current=frames[index];
  return <div className="duck-motion-player">
    <div className="duck-motion-stage"><div ref={host}/><p role="status">{status}</p><span>Drag to rotate · Scroll or pinch to zoom</span></div>
    <div className="duck-motion-controls">
      <label>Recorded trial<select value={episode} disabled={!data} onChange={e=>choose(Number(e.target.value))}>{data?.episodes.map((e,i)=><option value={i} key={e.name}>{e.name}</option>)}</select></label>
      <button disabled={!frames.length} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Play recording'}</button>
      <label className="duck-motion-timeline">Timeline<input aria-label="Recorded motion timeline" type="range" min="0" max={Math.max(0,frames.length-1)} value={index} disabled={!frames.length} onChange={e=>{setPlaying(false);setIndex(Number(e.target.value));}}/></label>
      <output>{current?.time.toFixed(1)??'0.0'} s</output>
    </div>
  </div>;
}
