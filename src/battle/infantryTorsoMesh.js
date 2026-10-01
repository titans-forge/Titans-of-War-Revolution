import Phaser from 'phaser';
import {torsoMeshGeometry,torsoMotionOffset} from './infantryTorsoMotion.js';

export function createInfantryTorsoMesh(scene,sprite) {
 if(scene.game.renderer.type!==Phaser.WEBGL)return null;
 const data=torsoMeshGeometry(sprite);
 const mesh=scene.add.mesh(0,0,sprite.runtimeKey,'body',data.vertices,data.uvs);
 mesh.setSize(data.width,data.height).setOrtho(data.width,data.height);
 mesh.hideCCW=false;mesh.torsoRig={data,sprite,lastPhase:null};
 return mesh;
}
export function poseInfantryTorsoMesh(mesh,phase,direction,scale,x,y) {
 const {data,sprite}=mesh.torsoRig;
 if(mesh.torsoRig.lastPhase!==phase) {
  for(let i=0;i<mesh.vertices.length;i++) {
   const sample=data.samples[i],offset=torsoMotionOffset(sample.weights,phase);
   mesh.vertices[i].x=sample.x+offset.x/sprite.scaleX;
   mesh.vertices[i].y=-sample.y-offset.y/sprite.scaleY;
  }
  mesh.setOrtho(data.width,data.height);mesh.preUpdate();mesh.torsoRig.lastPhase=phase;
 }
 // Mesh has no configurable render origin; vertices are already hip-relative.
 // Expose the matching bounds origin for the formation's shared hit testing.
 mesh.originX=direction>0?data.pivot.x/data.width:1-data.pivot.x/data.width;
 mesh.originY=data.pivot.y/data.height;
 mesh.setScale(direction*sprite.scaleX*scale,sprite.scaleY*scale).setPosition(x,y);
}
