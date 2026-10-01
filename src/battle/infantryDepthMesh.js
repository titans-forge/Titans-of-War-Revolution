import Phaser from 'phaser';
import {depthMeshGeometry,depthStrideState,weightedDepthOffset} from './infantryDepthMotion.js';
export function createInfantryDepthMesh(scene,sprite) {
 if(scene.game.renderer.type!==Phaser.WEBGL)return null;
 const data=depthMeshGeometry(sprite),mesh=scene.add.mesh(0,0,sprite.runtimeKey,'body',data.vertices,data.uvs);
 mesh.setSize(data.width,data.height).setOrtho(data.width,data.height);mesh.hideCCW=false;
 mesh.depthRig={data,sprite,phase:null};mesh.originX=data.pivot.x/data.width;mesh.originY=data.pivot.y/data.height;return mesh;
}
export function poseInfantryDepthMesh(mesh,phase,height,x,y,flipX=false) {
 const {data,sprite}=mesh.depthRig;
 if(mesh.depthRig.phase!==phase){
  const state=depthStrideState(phase,sprite.view);
  for(let i=0;i<mesh.vertices.length;i++) {const p=data.samples[i],o=weightedDepthOffset(p.weights,state);mesh.vertices[i].x=(p.x+o.x)/data.factor;mesh.vertices[i].y=-(p.y+o.y)/data.factor;}
  mesh.setOrtho(data.width,data.height);mesh.preUpdate();mesh.depthRig.phase=phase;
 }
 mesh.originX=flipX?1-data.pivot.x/data.width:data.pivot.x/data.width;
 mesh.setScale((flipX?-1:1)*height/sprite.bodyHeight,height/sprite.bodyHeight).setPosition(x,y).setVisible(true);
}
