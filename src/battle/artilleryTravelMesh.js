import Phaser from 'phaser';
import {artilleryTravelGeometry,artilleryTravelOffset} from './artilleryTravelMotion.js';
export function createArtilleryTravelMesh(scene,sprite) {
 if(scene.game.renderer.type!==Phaser.WEBGL||!scene.textures.exists(sprite.runtimeKey))return null;
 const data=artilleryTravelGeometry(sprite),mesh=scene.add.mesh(0,0,sprite.runtimeKey,'body',data.vertices,data.uvs);
 mesh.setSize(data.width,data.height).setOrtho(data.width,data.height);mesh.hideCCW=false;
 mesh.artilleryTravelRig={data,sprite,lastState:null};return mesh;
}
export function poseArtilleryTravelMesh(mesh,state,x,y,flipX) {
 const rig=mesh.artilleryTravelRig,{data}=rig;
 const previous=rig.lastState;
 if(!previous||['left','right'].some(foot=>previous[foot].x!==state[foot].x||previous[foot].y!==state[foot].y)){
  for(let i=0;i<mesh.vertices.length;i++){
   const sample=data.samples[i],offset=artilleryTravelOffset(sample.weights,state);
   mesh.vertices[i].x=sample.x+offset.x/data.factor;mesh.vertices[i].y=-sample.y-offset.y/data.factor;
  }
  mesh.setOrtho(data.width,data.height);mesh.preUpdate();rig.lastState=state;
 }
 mesh.originX=flipX?1-data.pivot.x/data.width:data.pivot.x/data.width;mesh.originY=data.pivot.y/data.height;
 mesh.setPosition(x,y).setScale((flipX?-1:1)*data.factor,data.factor).setVisible(true);
}
