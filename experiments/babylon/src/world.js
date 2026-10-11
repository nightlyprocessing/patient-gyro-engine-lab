export const BUILD='babylon-lab-0.1';
export const SPEED=3.2;
export const SPAWNS=[{x:6,z:-1,yaw:-Math.PI/2},{x:6,z:3,yaw:-Math.PI/2}];
// Shared horizontal collision volumes, in metres. Door is at the truck's rear.
export const SOLIDS=[
 [-2.02,-1.78,-4.1,4.1],[1.78,2.02,-4.1,4.1],[-2.02,2.02,3.88,4.12],
 [-2.02,-0.7,-4.12,-3.88],[0.7,2.02,-4.12,-3.88],
 [-1.7,-.65,-2.6,3.4],[.7,1.7,1.8,3.5],[1.8,2.52,-1.8,1.8],
 [6.5,9.5,4.8,6.8],[6.5,9.5,-6.8,-4.8],[-4.8,-3.4,1.2,2.6],
 [-15,15,10,14],[-15,15,-14,-10],[-15,-10,-14,14],[11.5,15,-14,14]
];
export function blocked(x,z){return SOLIDS.some(([a,b,c,d])=>x>a-.28&&x<b+.28&&z>c-.28&&z<d+.28)||Math.abs(x)>14||Math.abs(z)>13;}
export function move(p,dx,dz,dt,sprint=false){
 const length=Math.hypot(dx,dz);if(!Number.isFinite(length))return {...p};if(length>1){dx/=length;dz/=length;}
 const distance=(sprint?4.6:SPEED)*Math.max(0,Math.min(.35,dt));
 const steps=Math.max(1,Math.ceil(distance/.1));let {x,z}=p;
 for(let i=0;i<steps;i++){if(!blocked(x+dx*distance/steps,z))x+=dx*distance/steps;if(!blocked(x,z+dz*distance/steps))z+=dz*distance/steps;}
 return {...p,x,z};
}
export function npcAt(created,now){
 const t=((now-created)/1000)%40;
 const route=[[4.35,0,0],[4.35,0,12],[5.6,3.7,18],[7,3.7,23],[7,-3.6,31],[4.35,0,40]];
 for(let i=1;i<route.length;i++)if(t<=route[i][2]){
  const a=route[i-1],b=route[i],f=(t-a[2])/(b[2]-a[2]||1);
  return {x:a[0]+(b[0]-a[0])*f,z:a[1]+(b[1]-a[1])*f,yaw:i===1?-Math.PI/2:Math.atan2(b[0]-a[0],b[1]-a[1]),walking:i>1};
 }
 return {x:4.35,z:0,yaw:-Math.PI/2,walking:false};
}
