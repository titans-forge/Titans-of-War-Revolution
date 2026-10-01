import Phaser from 'phaser';
import {cavalryContactGeometry,cavalryContactResponse,cavalryContactOffset} from './cavalryContactMotion.js';
export function createCavalryContactMesh(scene,sprite) {
 if(scene.game.renderer.type!==Phaser.WEBGL)return null;
 const data=cavalryContactGeometry(sprite),mesh=scene.add.mesh(0,0,sprite.runtimeKey,'body',data.vertices,data.uvs);
 mesh.setSize(data.width,data.height).setOrtho(data.width,data.height);mesh.hideCCW=false;
 mesh.cavalryRig={data,sprite,lastTime:null,lastProgress:null,lastPhase:null};return mesh;
}
export function poseCavalryContactMesh(mesh,contact,time,phase,height,x,y,flipX) {
 const rig=mesh.cavalryRig,{data,sprite}=rig;
 if(rig.lastTime!==time||rig.lastProgress!==contact.progress||rig.lastPhase!==phase){
  const response=cavalryContactResponse(contact,time,phase);
  for(let i=0;i<mesh.vertices.length;i++){
   const s=data.samples[i],o=cavalryContactOffset(s.weights,response);
   mesh.vertices[i].x=(s.x+o.x)/data.factor;mesh.vertices[i].y=-(s.y+o.y)/data.factor;
  }
  mesh.setOrtho(data.width,data.height);mesh.preUpdate();rig.lastTime=time;rig.lastProgress=contact.progress;rig.lastPhase=phase;
 }
 mesh.originX=flipX?1-data.pivot.x/data.width:data.pivot.x/data.width;mesh.originY=data.pivot.y/data.height;
 mesh.setScale((flipX?-1:1)*height/sprite.bodyHeight,height/sprite.bodyHeight).setPosition(x,y).setVisible(true);
}
