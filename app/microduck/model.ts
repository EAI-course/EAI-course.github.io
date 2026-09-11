export type Body = { name: string; parent: string | null; pos: number[]; quat: number[]; joint: null | { name: string; axis: number[]; pos: number[]; range: number[] }; geoms: {mesh: string; pos: number[]; quat: number[]; color: number[]}[] };
export type Model = { bodies: Body[] };
export const sourceURL = 'https://huggingface.co/spaces/pollen-robotics/microduck-simulator/tree/023172c8a7d629b5258d90364c13bafe013abbfa/app/public/robot/mjlab';
const partNames:Record<string,string>={'xl330.stl':'XL330 servo motor','np_f970.stl':'Battery pack','seeed_bearing__configuration__22x16x4.stl':'Bearing · 22 × 16 × 4','seeed_bearing__configuration_default.stl':'Bearing','banana_pcb_locker.stl':'Electronics retaining bracket','pcb__raspberry_pi_zero_2_w.stl':'Raspberry Pi Zero 2 W board','elec_rpi_robot_hat_pcb.stl':'Robot electronics board','noenoeil.stl':'Eye detail','yaw2roll.stl':'Hip connecting bracket','hip_l.stl':'Hip bracket'};
export const label = (s: string) => partNames[s] || s.replace(/\.stl$/, '').replace(/_+/g, ' ').trim();
const bodyNames: Record<string,string> = {trunk_base:'Torso',yaw2roll:'Left hip · yaw',hip_l:'Left hip · roll',upper_leg_left:'Left upper leg',leg:'Left lower leg',ankle_left:'Left ankle and foot',neck:'Neck',neck_pitch:'Head · pitch',yaw_roll_motion:'Head · yaw',jaw_soft:'Head and face',bearing_roll:'Right hip · yaw',hip_l_2:'Right hip · roll',upper_leg_right:'Right upper leg',leg_2:'Right lower leg',ankle_right:'Right ankle and foot'};
export const bodyLabel = (name:string) => bodyNames[name] || label(name);
export function descendants(model: Model, root: string): Set<string> {
  const result = new Set([root]);
  let changed = true;
  while(changed) { changed=false; for(const body of model.bodies) if(body.parent && result.has(body.parent) && !result.has(body.name)) {result.add(body.name);changed=true;} }
  return result;
}
export const degrees = (radians:number) => radians*180/Math.PI;
export function clampAngle(body:Body, angle:number) { if(!body.joint || !Number.isFinite(angle)) throw new Error('Choose a valid joint angle.'); return Math.max(degrees(body.joint.range[0]), Math.min(degrees(body.joint.range[1]), angle)); }
export function partDescription(name:string) {
  if(name==='trunk_base.stl') return 'The torso frame holds the central assembly. The neck and both leg chains attach to this body, making it the reference for our joint demonstrations.';
  if(name==='motor_support.stl') return 'This bracket locates a motor in the head assembly. It moves with its attachment group while holding the motor in place relative to that group.';
  if(name==='power_support.stl') return 'This support belongs to the torso’s power assembly. Its shape shows how that assembly fits into the body; wiring is not represented.';
  if(name.includes('upper_leg')||name==='leg.stl'||name.includes('ankle')||name.includes('foot_')||name==='hip_l.stl'||name==='yaw2roll.stl') return 'This is a structural part of the leg. Follow its attachment group in Joint motion to see how a hip, knee, or ankle rotation changes its pose.';
  if(name.includes('neck')||name==='yaw_roll_motion.stl') return 'This part belongs to the chain connecting the torso to the head. A joint earlier in that chain moves the parts attached farther along it.';
  if(name.includes('lens')) return 'This component belongs to the camera’s optical assembly. It helps locate the view into the scene; this lab does not render a simulated camera image.';
  if(name.includes('jaw')||name.includes('mouth')||name==='face_part.stl'||name==='noenoeil.stl') return 'This is part of the face assembly. It follows the head in this model; the mouth is not exposed as a separate adjustable joint.';
  if(name.includes('xl330')) return 'A servo motor combines a motor, gears, and position control. It turns a joint toward a commanded angle. Its attachment group is shown below; a visible motor is not automatically a separate controllable joint.';
  if(name.includes('bearing')) return 'A bearing supports a rotating connection while allowing relative motion. It guides and supports the joint; unlike a motor, it does not command the rotation.';
  if(name.includes('shell')) return 'An outer shell encloses the robot’s internal components. Hide it to inspect the components behind it; the shell is not itself an actuator.';
  if(name.includes('sole')) return 'The sole is the bottom surface of the foot. On a real robot it contacts the ground. This viewer only displays its pose, so it cannot tell you whether that contact will support the robot.';
  if(name.includes('camera')) return 'The camera provides visual observations. A separate perception system must interpret those images; displaying a camera here does not mean the walking controller consumes images.';
  if(name.includes('raspberry')) return 'This released assembly depicts a Raspberry Pi computing board. It represents the selected simulation model, not a guarantee of the computer used in every physical Microduck version.';
  if(name.includes('np_f970')) return 'This shape represents the battery pack. It supplies electrical energy on the physical robot; energy use and battery life are not calculated in this viewer.';
  if(name.includes('speaker')) return 'The speaker converts an electrical audio signal into sound. It is shown as part of the assembly; this lab does not play or synthesize robot audio.';
  if(name.includes('pcb')) return 'This component is associated with the electronics assembly. Its geometry shows placement, not an electrical schematic or a complete description of the board’s signals.';
  return 'This mechanical component is part of the released robot assembly. Its shape and attachment show how it fits with neighboring parts. Exact manufacturing dimensions and load capacity are not established by this viewer.';
}
