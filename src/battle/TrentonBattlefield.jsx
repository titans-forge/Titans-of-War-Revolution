import {publicAsset} from '../game/publicAsset.js';
import {captureBattleCheckpoint,restoreBattleCheckpoint} from './battleCheckpoint.js';
import {landmarkAt,landmarkMovementNote} from './historicalLandmarks.js';
import {ARTILLERY_MARCH_SPRITES,artilleryMarchReady,artilleryMarchFrame,artilleryMarchPlacement} from './artilleryMarchSprites.js';
import {artilleryTransport} from './artilleryTransport.js';
import {ARTILLERY_TRAVEL_SPRITES,artilleryTravelState} from './artilleryTravelMotion.js';
import {createArtilleryTravelMesh,poseArtilleryTravelMesh} from './artilleryTravelMesh.js';
import {resolveInfantryProfile,infantryProfileLoadSet,specialInfantryProfile} from './infantrySpecialProfiles.js';
import {retainSpriteIslands,spriteIslandSeeds} from './spriteIslands.js';
import {infantryHeading,infantryHeadingPresentation} from './infantryHeading.js';
import {directionalVolleySamples} from './infantryVolleyVisuals.js';
import {infantryFacing,directionalInfantryPose} from './infantryFacing.js';
import {ALL_INFANTRY_DIRECTIONAL_SPRITES,directionalSources,directionalProfileReady,diagonalProfileReady,directionalSpritePlacement,directionalSprite} from './infantryDirectionalSprites.js';
import {createInfantryDepthMesh,poseInfantryDepthMesh} from './infantryDepthMesh.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Phaser from 'phaser';
import { TrentonEngine, TRENTON_WORLD } from './trentonEngine.js';
import { getBattleDefinition } from './battleDefinitions.js';
import { addStandard, animateStandard } from './standards.js';
import { GERMAN_TRICORN_SPRITES, germanSpritePlacement } from './germanTricornSprites.js';
import { INFANTRY_RELOAD_SPRITES, reloadSpritePlacement } from './infantryReloadSprites.js';
import { INFANTRY_MARCH_SPRITES, marchSpritePlacement } from './infantryMarchSprites.js';
import { INFANTRY_CONTACT_SPRITES, INFANTRY_THRUST_SPRITES, contactSpritePlacement } from './infantryContactSprites.js';
import { createInfantryTorsoMesh, poseInfantryTorsoMesh } from './infantryTorsoMesh.js';
import { infantryStrideRig } from './infantryStrideRig.js';
import { infantryRigSprites, infantryRigTextures, infantryRigSources, rigPartPlacement } from './infantryRigSprites.js';
import { infantryActionFrame } from './infantryActionFrames.js';
import { infantryContactCycle, contactFrontRanks } from './infantryContactCycle.js';
import { artilleryCrewAction, artilleryCrewStation } from './artilleryAnimation.js';
import { ARTILLERY_ACTION_SPRITES, artillerySpritePlacement } from './artillerySprites.js';
import {createCavalryContactMesh,poseCavalryContactMesh} from './cavalryContactMesh.js';
import { artilleryHaulReady, cavalryContactReady, CAVALRY_CONTACT_SPRITES, ARTILLERY_HAUL_SPRITES, cavalryContactPlacement, artilleryHaulPlacement } from './supportActionSprites.js';
import { cavalryContactCycle, artilleryHaulFrame } from './supportActionMotion.js';
import { cavalryMotionFrame } from './cavalryMotion.js';
import { CAVALRY_TROT_SPRITES, cavalrySpritePlacement } from './cavalrySprites.js';
import { keyMagentaPixels } from './spriteChroma.js';
import { infantryPose } from './infantryAnimation.js';
import { getUnitIdentity } from './unitIdentity.js';
import { travelPhase, firingOrigin, infantryBodyMotion } from './figureMotion.js';
import { issueCommand } from './commandReceipt.js';

import { inFormationContact } from './formationContact.js';
import { BRANDYWINE_FORD, segmentClear } from './terrainNavigation.js';
import { commandIndicator } from './commandIndicator.js';
import { containsUnitArt } from './unitSelection.js';

const SIDE = {
  continental: { coat: 0x315b78, trim: 0xd9b84d, standard: 0x244f75 },
  crown: { coat: 0xb43d35, trim: 0xe2d5bb, standard: 0xb8322e },
};

function figureSlots(unit) {
  const capacity = unit.type === 'artillery' ? 5 : unit.type === 'cavalry' ? 18 : 48;
  const count = Math.max(1, Math.round(capacity * unit.strength / unit.initialStrength));
  const columns = unit.type === 'cavalry' ? 6 : unit.formationMode === 'column' ? 6 : unit.formationMode === 'open' ? 12 : 12;
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => ({
    x: (index % columns - (columns - 1) / 2) * (unit.type === 'cavalry' ? 27 : unit.formationMode === 'open' ? 16 : unit.formationMode === 'column' ? 10 : 11),
    y: (Math.floor(index / columns) - (rows - 1) / 2) * (unit.type === 'cavalry' ? 19 : unit.formationMode === 'open' ? 15 : 12),
    index,
  }));
}

export class TrentonScene extends Phaser.Scene {
  constructor(options) {
    super('Trenton');
    this.options = options;
    this.groups = new Map();
  }

  command(type, value) {
    const event = issueCommand(this.engine, this.options.selectedId, type, value);
    if (this.engine) this.options.onSnapshot(this.engine.snapshot());
    if (event) this.options.onAction?.(event);
    this.saveCheckpoint();
    return event;
  }

  saveCheckpoint() {
    if(!this.engine || !this.options.onCheckpoint)return;
    const camera=this.cameras.main;
    this.options.onCheckpoint({engine:captureBattleCheckpoint(this.engine),selectedId:this.options.selectedId,camera:{x:camera.scrollX,y:camera.scrollY,zoom:camera.zoom}});
    this.checkpointElapsed=0;
  }

  preload() {
    const loadImage = (key, path) => this.load.image(key, publicAsset(path));
    if (getBattleDefinition(this.options.battleId).formations?.some(unit=>unit.type==='cavalry')) {
      loadImage(CAVALRY_TROT_SPRITES[0][0].key, CAVALRY_TROT_SPRITES[0][0].path);
      loadImage(CAVALRY_CONTACT_SPRITES[0][0].key,CAVALRY_CONTACT_SPRITES[0][0].path);
    }
    loadImage('cavalry-atlas', '/images/units/revolution-cavalry-v1.png');
    if (getBattleDefinition(this.options.battleId).formations?.some(unit=>unit.type==='artillery')) {
      for(const sprite of [ARTILLERY_MARCH_SPRITES[0][0],ARTILLERY_MARCH_SPRITES[0][2]])loadImage(sprite.key,sprite.path);
      loadImage(ARTILLERY_ACTION_SPRITES[0].key,ARTILLERY_ACTION_SPRITES[0].path);
      loadImage(ARTILLERY_HAUL_SPRITES[0].key,ARTILLERY_HAUL_SPRITES[0].path);
    }
    loadImage('artillery-atlas', '/images/units/revolution-artillery-v1.png');
    for(const state of ['carry','fire']){const sprite=GERMAN_TRICORN_SPRITES[state];loadImage(sprite.key,sprite.path);}
    const rigProfiles=getBattleDefinition(this.options.battleId).formations.filter(unit=>unit.type==='infantry').flatMap(unit=>{const p=getUnitIdentity(this.options.battleId,unit).infantryProfile;return infantryProfileLoadSet(p);});
    const infantrySources=new Map([...directionalSources(rigProfiles),...infantryRigSources(rigProfiles)].map(s=>[s.key,s]));
    for(const source of infantrySources.values())loadImage(source.key,source.path);
    loadImage('infantry-carry', '/images/units/revolution-infantry-carry-v1.png');
    loadImage('infantry-fire', '/images/units/revolution-infantry-v1.png');
    loadImage(INFANTRY_RELOAD_SPRITES[0].key, INFANTRY_RELOAD_SPRITES[0].path);
    for (const poses of INFANTRY_MARCH_SPRITES) loadImage(poses[0].key, poses[0].path);
    loadImage(INFANTRY_CONTACT_SPRITES[0].key, INFANTRY_CONTACT_SPRITES[0].path);
    loadImage(INFANTRY_THRUST_SPRITES[0].key, INFANTRY_THRUST_SPRITES[0].path);
    loadImage(`battlefield-${this.options.battleId}`, `/images/battles/${this.options.battleId.replace('_', '-')}.webp`);
  }

  create() {
    // Atlas frames are measured against alpha bounds; assets stay unmodified.
    if (this.textures.exists('artillery-atlas')) {
      [[84,103,804,388],[967,5,363,493],[265,523,297,476],[968,503,416,495]].forEach(([x,y,w,h],index) => this.textures.get('artillery-atlas').add(index,0,x,y,w,h));
    }
    if (this.textures.exists('cavalry-atlas')) {
      [[201,16,468,490],[838,16,543,488],[195,517,473,488],[831,519,551,480]].forEach(([x,y,w,h],index) => this.textures.get('cavalry-atlas').add(index,0,x,y,w,h));
    }
    for (const sprite of [...ALL_INFANTRY_DIRECTIONAL_SPRITES,...CAVALRY_TROT_SPRITES.flat(),...ARTILLERY_ACTION_SPRITES,...infantryRigTextures(),...CAVALRY_CONTACT_SPRITES.flat(),...ARTILLERY_HAUL_SPRITES,...ARTILLERY_TRAVEL_SPRITES,...ARTILLERY_MARCH_SPRITES.flat()]) {
      const f=sprite.frame,p=sprite.padding;
      if(this.textures.exists(sprite.key) && !this.textures.exists(sprite.runtimeKey)) {
        const texture=this.textures.createCanvas(sprite.runtimeKey,f.width+p*2,f.height+p*2);
        texture.context.drawImage(this.textures.get(sprite.key).getSourceImage(),f.x,f.y,f.width,f.height,p,p,f.width,f.height);
        const pixels=texture.context.getImageData(0,0,texture.width,texture.height);
        keyMagentaPixels(pixels.data);if(sprite.islands)retainSpriteIslands(pixels.data,texture.width,texture.height,spriteIslandSeeds(sprite));texture.context.putImageData(pixels,0,0);
        texture.refresh();texture.add('body',0,0,0,texture.width,texture.height);
      }
    }
    const carry = [[248,0,218,619],[829,12,204,612],[261,635,213,609],[827,635,222,608]];
    const firing = [[761,41,285,298],[761,394,285,300],[756,727,292,329],[762,1101,282,304]];
    for (const [key, frames] of [['infantry-carry',carry],['infantry-fire',firing]]) {
      if (this.textures.exists(key)) frames.forEach(([x,y,w,h],index) => this.textures.get(key).add(index,0,x,y,w,h));
    }
    for(const state of ['carry','fire']){const s=GERMAN_TRICORN_SPRITES[state],f=s.frame;if(this.textures.exists(s.key))this.textures.get(s.key).add('body',0,f.x,f.y,f.width,f.height);}
    for (const profile of [0,1,2,3]) {
      const sprite=INFANTRY_RELOAD_SPRITES[profile],f=sprite.frame;
      if(this.textures.exists(sprite.key))this.textures.get(sprite.key).add(`reload-${profile}`,0,f.x,f.y,f.width,f.height);
      const contact=INFANTRY_CONTACT_SPRITES[profile],c=contact.frame;
      if(this.textures.exists(contact.key))this.textures.get(contact.key).add(`contact-${profile}-0`,0,c.x,c.y,c.width,c.height);
      const thrust=INFANTRY_THRUST_SPRITES[profile],fth=thrust.frame,pth=thrust.padding;
      if(this.textures.exists(thrust.key) && !this.textures.exists(thrust.runtimeKey)) {
        const texture=this.textures.createCanvas(thrust.runtimeKey,fth.width+pth*2,fth.height+pth*2);
        texture.context.drawImage(this.textures.get(thrust.key).getSourceImage(),fth.x,fth.y,fth.width,fth.height,pth,pth,fth.width,fth.height);
        const pixels=texture.context.getImageData(0,0,texture.width,texture.height);
        keyMagentaPixels(pixels.data);texture.context.putImageData(pixels,0,0);
        texture.refresh();texture.add('body',0,0,0,texture.width,texture.height);
      }
      for (const poses of INFANTRY_MARCH_SPRITES) {
        const march=poses[profile],m=march.frame,p=march.padding;
        if(this.textures.exists(march.key) && !this.textures.exists(march.runtimeKey)) {
          // Separate tightly packed source frames before WebGL filtering so a
          // boot cannot sample the next profile's musket across an atlas seam.
          const texture=this.textures.createCanvas(march.runtimeKey,m.width+p*2,m.height+p*2);
          texture.context.drawImage(this.textures.get(march.key).getSourceImage(),m.x,m.y,m.width,m.height,p,p,m.width,m.height);
          texture.refresh();
          texture.add('body',0,0,0,m.width+p*2,m.height+p*2);
        }
      }
    }
    this.definition = getBattleDefinition(this.options.battleId);
    const checkpoint=this.options.checkpoint;
    const restored=checkpoint && restoreBattleCheckpoint(checkpoint.engine,this.options.battleId,this.options.campaignContext);
    this.engine = restored || new TrentonEngine(this.options.seed, this.options.battleId, this.options.campaignContext);
    if(checkpoint)this.options.onRestore?.({restored:Boolean(restored),error:restored?'':'This checkpoint is incompatible or damaged. The battle starts from deployment.'});
    this.cameras.main.setBounds(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
    if(restored && checkpoint.camera){
      const {x,y,zoom}=checkpoint.camera;
      if(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(zoom)&&zoom>=.8&&zoom<=2&&Math.abs(x)<=1200&&Math.abs(y)<=680){this.cameras.main.setZoom(zoom);this.cameras.main.setScroll(x,y);}
    }
    this.flushCheckpoint=()=>this.saveCheckpoint();
    this.hideCheckpoint=()=>{if(document.visibilityState==='hidden')this.saveCheckpoint();};
    window.addEventListener('pagehide',this.flushCheckpoint);
    document.addEventListener('visibilitychange',this.hideCheckpoint);
    this.events.once('shutdown',()=>{window.removeEventListener('pagehide',this.flushCheckpoint);document.removeEventListener('visibilitychange',this.hideCheckpoint);});
    this.drawTerrain();
    // Non-interactive hover text must never consume a move/attack click.
    this.landmarkLabel=this.add.text(0,0,'',{fontFamily:'Georgia',fontSize:'13px',color:'#f1e4c4',backgroundColor:'#17201dea',padding:{x:9,y:6},wordWrap:{width:240}}).setDepth(950).setVisible(false);
    this.input.on('pointermove',pointer=>{
      const point=pointer.positionToCamera(this.cameras.main);
      const landmark=this.hoveredId ? null : landmarkAt(this.options.battleId,point);
      this.landmarkLabel.setVisible(Boolean(landmark));
      if(landmark){
        this.landmarkLabel.setText(landmark.name+'\n'+landmark.description+'\n'+landmarkMovementNote(this.options.battleId,landmark.id));
        const view=this.cameras.main.worldView;
        this.landmarkLabel.setPosition(Math.max(view.x+4,Math.min(view.right-this.landmarkLabel.width-4,point.x+12)),Math.max(view.y+4,Math.min(view.bottom-this.landmarkLabel.height-4,point.y+16)));
      }
    });
    this.input.on('gameout',()=>this.landmarkLabel.setVisible(false));
    if (this.options.battleId === 'brandywine') {
      const {x,y,radius}=BRANDYWINE_FORD;
      this.add.graphics().setDepth(-990).lineStyle(1.5,0xe5ce91,.65).strokeCircle(x,y,radius);
      this.add.text(x,y+radius+7,'RIVER CROSSING',{fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,0).setDepth(-989);
    }
    if (this.options.battleId === 'bunker_hill') {
      this.add.text(700,18,'↑ WITHDRAWAL THROUGH THE NECK',{fontFamily:'Arial',fontSize:'11px',color:'#c9e5e3',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,0).setDepth(-989);
    }
    if (this.definition.counterattackObjective) {
      const rule=this.definition.counterattackObjective, z=rule.lineZone;
      const marks=this.add.graphics().setDepth(-990).lineStyle(2,0xe5ce91,.6);
      for (const [x,y,dx,dy] of [[z.x1,z.y1,1,1],[z.x2,z.y1,-1,1],[z.x1,z.y2,1,-1],[z.x2,z.y2,-1,-1]]) {
        marks.lineBetween(x,y,x+16*dx,y); marks.lineBetween(x,y,x,y+16*dy);
      }
      this.add.text((z.x1+z.x2)/2,z.y2+10,'CONTINENTAL LINE',{fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,0).setDepth(-989);
      for (const [id,point] of Object.entries(rule.fallback)) {
        marks.lineStyle(1.5,0x9dcccf,.55).strokeCircle(point.x,point.y,rule.rallyRadius);
        this.add.text(point.x-rule.rallyRadius-5,point.y,`${id.startsWith('morgan') ? 'MORGAN' : 'PICKENS'}\nRALLY`,{fontFamily:'Arial',fontSize:'10px',color:'#c9e5e3',backgroundColor:'#142621cc',padding:{x:4,y:3},align:'right'}).setOrigin(1,.5).setDepth(-989);
      }
    }
    if(this.definition.escape){
      const rule=this.definition.escape, marks=this.add.graphics().setDepth(-990);
      marks.lineStyle(2,0xd8bb83,.8).strokeCircle(rule.x,rule.y,rule.exitRadius);
      marks.lineStyle(1.5,0xd8bb83,.65);
      for(let angle=0;angle<Math.PI*2;angle+=.24)marks.beginPath().arc(rule.x,rule.y,rule.blockRadius,angle,angle+.1).strokePath();
      this.add.text(rule.x,rule.y-rule.exitRadius-10,'SOUTHERN ESCAPE ROAD',{fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,1).setDepth(-989);
    }
    if (this.definition.evacuation?.kind === 'road') {
      const rule=this.definition.evacuation, z=rule.screenZone;
      const marks=this.add.graphics().setDepth(-990);
      marks.lineStyle(2,0xe5ce91,.65);
      for(const [x,y,dx,dy] of [[z.x1,z.y1,1,1],[z.x2,z.y1,-1,1],[z.x1,z.y2,1,-1],[z.x2,z.y2,-1,-1]]) {
        marks.lineBetween(x,y,x+18*dx,y); marks.lineBetween(x,y,x,y+18*dy);
      }
      marks.lineStyle(2,0x9dcccf,.7).strokeCircle(rule.exitX,rule.exitY,rule.exitRadius);
      marks.lineStyle(1.5,0x9dcccf,.65);
      for(let angle=0;angle<Math.PI*2;angle+=.24) marks.beginPath().arc(rule.exitX,rule.exitY,rule.blockRadius,angle,angle+.1).strokePath();
      this.add.text((z.x1+z.x2)/2,z.y1-12,'FORD APPROACHES',{fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,1).setDepth(-989);
      this.add.text(rule.exitX,rule.exitY-rule.exitRadius-10,'CHESTER ROAD EXIT',{fontFamily:'Arial',fontSize:'11px',color:'#c9e5e3',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,1).setDepth(-989);
    } else if (this.definition.evacuation) {
      const { exitX, screenX } = this.definition.evacuation;
      const markers = this.add.graphics().setDepth(-990);
      for (const [x,color] of [[exitX,0x9dcccf],[screenX,0xd6bd7a]]) {
        markers.lineStyle(1,color,.35);
        for(let y=85;y<640;y+=24)markers.lineBetween(x,y,x,y+10);
      }
      this.add.text(exitX-12,58,'← EVACUATION', {fontFamily:'Arial',fontSize:'11px',color:'#c9e5e3',backgroundColor:'#142621cc',padding:{x:4,y:4}}).setOrigin(1,0).setDepth(-989);
      this.add.text(screenX+8,58,'FORWARD SCREEN →', {fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:4}}).setDepth(-989);
    }
    if (this.definition.defenseObjective) {
      const {x1,x2,y1,y2} = this.definition.defenseObjective.zone;
      const marks = this.add.graphics().setDepth(-990);
      marks.lineStyle(2,0xe5ce91,.65);
      for (const [x,y,dx,dy] of [[x1,y1,1,1],[x2,y1,-1,1],[x1,y2,1,-1],[x2,y2,-1,-1]]) {
        marks.lineBetween(x,y,x+18*dx,y);
        marks.lineBetween(x,y,x,y+18*dy);
      }
      this.add.text((x1+x2)/2,y1-10,(this.definition.defenseObjective.zone.label || 'Position').toUpperCase(), {fontFamily:'Arial',fontSize:'11px',color:'#ebdbaa',backgroundColor:'#142621cc',padding:{x:4,y:3}}).setOrigin(.5,1).setDepth(-989);
    }
    this.selection = this.add.ellipse(0, 0, 160, 62, 0xd7b34a, 0.1).setStrokeStyle(3, 0xe6c75f).setVisible(false).setDepth(900);
    this.commandLine = this.add.graphics().setDepth(880);
    this.commandLabel = this.add.text(0, 0, '', {fontFamily:'Arial',fontSize:'11px',color:'#fff4d8',backgroundColor:'#18201c',padding:{x:4,y:3}}).setOrigin(.5,1).setDepth(881).setVisible(false);
    for (const unit of this.engine.formations) this.createFormation(unit);
    this.input.on('pointerdown', (pointer, objects) => {
      if (pointer.event?.target !== this.game.canvas) return;
      if (objects.length && !pointer.event.shiftKey) return;
      if (!this.options.selectedId) return;
      const point = pointer.positionToCamera(this.cameras.main);
      this.command('ground-move', point);
    });
    this.options.onSnapshot(this.engine.snapshot());
    this.saveCheckpoint();
  }

  drawTerrain() {
    const key = `battlefield-${this.options.battleId}`;
    if (this.textures.exists(key)) {
      this.add.image(TRENTON_WORLD.width / 2, TRENTON_WORLD.height / 2, key).setDisplaySize(TRENTON_WORLD.width, TRENTON_WORLD.height).setDepth(-1000);
      this.add.rectangle(600, 340, 1200, 680, 0x101812, 0.14).setDepth(-999);
      this.add.text(24, 20, `${this.definition.location.toUpperCase()} · ${this.definition.date.toUpperCase()}`, { fontFamily: 'Arial', fontSize: '13px', color: '#f1ead7', backgroundColor: 'rgba(12,16,13,.72)', padding: { x: 9, y: 7 } }).setDepth(-998).setAlpha(0.9);
      return;
    }
    const g = this.add.graphics();
    if (this.options.battleId === 'bunker_hill') {
      g.fillStyle(0x8e9a6c).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0x6e7f55, 0.85).fillEllipse(650, 280, 820, 410);
      g.fillStyle(0x879665).fillEllipse(440, 410, 620, 310);
      g.fillStyle(0x466679).fillRect(0, 585, 1200, 95);
      g.fillStyle(0xb8a47b).fillRect(930, 0, 270, 120);
      const redoubt = this.definition.defenseObjective.zone;
      g.lineStyle(10, 0x67523a).strokeRect(redoubt.x1, redoubt.y1, redoubt.x2-redoubt.x1, redoubt.y2-redoubt.y1);
      g.lineStyle(7, 0x8e7958).strokeLineShape(new Phaser.Geom.Line(350, 465, 705, 450));
      g.lineStyle(6, 0x65553f).strokeLineShape(new Phaser.Geom.Line(180, 540, 930, 565));
      for (let i = 0; i < 36; i += 1) {
        const x = (i * 113) % 1200;
        const y = 35 + (i * 79) % 500;
        g.fillStyle(0x43573a, 0.72).fillCircle(x, y, 14 + (i % 3) * 5);
      }
      this.add.text(redoubt.x1, redoubt.y1-35, "PRESCOTT'S REDOUBT", { fontFamily: 'Georgia', fontSize: '18px', color: '#2d3426' }).setAlpha(0.78);
      this.add.text(840, 620, 'MYSTIC RIVER', { fontFamily: 'Arial', fontSize: '14px', color: '#d8e3e8', letterSpacing: 3 }).setAlpha(0.8);
      this.add.text(935, 38, 'CHARLESTOWN', { fontFamily: 'Georgia', fontSize: '23px', color: '#4b3d2f' }).setAlpha(0.7);
      return;
    }
    if (this.options.battleId === 'long_island') {
      g.fillStyle(0x788668).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0x536f7c).fillRect(0, 0, 245, TRENTON_WORLD.height);
      g.fillStyle(0x9a8b69).fillRect(245, 110, 135, 460);
      g.lineStyle(9, 0x594c38).strokeLineShape(new Phaser.Geom.Line(380, 105, 380, 575));
      g.lineStyle(7, 0x6d5c43).strokeLineShape(new Phaser.Geom.Line(385, 165, 1000, 110));
      g.lineStyle(7, 0x6d5c43).strokeLineShape(new Phaser.Geom.Line(385, 360, 1050, 285));
      g.lineStyle(7, 0x6d5c43).strokeLineShape(new Phaser.Geom.Line(385, 505, 1045, 555));
      g.fillStyle(0x4a5d3e, 0.82);
      for (let i = 0; i < 62; i += 1) {
        const x = 410 + (i * 89) % 770;
        const y = 25 + (i * 137) % 620;
        g.fillCircle(x, y, 10 + (i % 4) * 4);
      }
      g.lineStyle(7, 0x5d4a35).strokeRect(270, 190, 125, 305);
      this.add.text(265, 155, 'BROOKLYN LINES', { fontFamily: 'Georgia', fontSize: '18px', color: '#2e3529' }).setAlpha(0.8);
      this.add.text(28, 310, 'EAST RIVER', { fontFamily: 'Arial', fontSize: '14px', color: '#d8e3e8', letterSpacing: 3 }).setAngle(-90).setAlpha(0.8);
      this.add.text(855, 28, 'JAMAICA PASS', { fontFamily: 'Georgia', fontSize: '17px', color: '#ddd5b8' }).setAlpha(0.78);
      return;
    }
    if (this.options.battleId === 'brandywine') {
      g.fillStyle(0x7f8f67).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0x657d55, 0.72);
      for (let i = 0; i < 58; i += 1) g.fillCircle(30 + (i * 97) % 1140, 20 + (i * 139) % 630, 11 + (i % 4) * 4);
      g.lineStyle(38, 0x527584).beginPath().moveTo(180,270).lineTo(240,390).lineTo(540,520).lineTo(960,700).strokePath();
      g.lineStyle(8, 0xb0a57c).strokeLineShape(new Phaser.Geom.Line(170, 610, 540, 520));
      g.lineStyle(7, 0xa5936c).strokeLineShape(new Phaser.Geom.Line(540, 520, 1050, 430));
      g.fillStyle(0xc0ad7e).fillRect(495, 510, 86, 18);
      
      this.add.text(595, 530, 'CHADDS FORD', { fontFamily: 'Georgia', fontSize: '18px', color: '#263226' }).setAlpha(0.8);
      this.add.text(245, 600, 'ROAD TO CHESTER', { fontFamily: 'Arial', fontSize: '14px', color: '#e6dfc7', letterSpacing: 2 }).setAlpha(0.82);
      this.add.text(713, 615, 'BRANDYWINE CREEK', { fontFamily: 'Arial', fontSize: '13px', color: '#dce9ed', letterSpacing: 2 }).setAngle(-86).setAlpha(0.82);
      return;
    }
    if (this.options.battleId === 'saratoga') {
      g.fillStyle(0x667b54).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0x526643, 0.9).fillEllipse(410, 350, 700, 580);
      g.fillStyle(0x486f7d).fillRect(1080, 0, 120, TRENTON_WORLD.height);
      g.lineStyle(10, 0x9d8761).strokeLineShape(new Phaser.Geom.Line(970, 0, 1010, 680));
      g.lineStyle(8, 0x5c4b34).strokeLineShape(new Phaser.Geom.Line(300, 205, 625, 170));
      g.lineStyle(8, 0x5c4b34).strokeLineShape(new Phaser.Geom.Line(285, 385, 640, 350));
      g.lineStyle(8, 0x5c4b34).strokeLineShape(new Phaser.Geom.Line(305, 545, 650, 505));
      g.fillStyle(0x3f5438, 0.9);
      for (let i = 0; i < 76; i += 1) g.fillCircle(35 + (i * 83) % 1010, 20 + (i * 127) % 640, 10 + (i % 5) * 3);
      this.add.text(300, 88, 'BEMIS HEIGHTS', { fontFamily: 'Georgia', fontSize: '22px', color: '#e0d6b7' }).setAlpha(0.82);
      this.add.text(1100, 440, 'HUDSON RIVER', { fontFamily: 'Arial', fontSize: '13px', color: '#deebee', letterSpacing: 2 }).setAngle(-90).setAlpha(0.85);
      this.add.text(905, 36, 'ROAD NORTH', { fontFamily: 'Arial', fontSize: '13px', color: '#e2d8ba', letterSpacing: 2 }).setAlpha(0.82);
      return;
    }
    if (this.options.battleId === 'monmouth') {
      g.fillStyle(0x9a9a69).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0xafa56f, 0.78);
      for (let i = 0; i < 18; i += 1) g.fillRect(35 + (i * 151) % 1080, 30 + (i * 83) % 570, 95 + (i % 3) * 28, 52);
      g.fillStyle(0x5d7651, 0.84);
      for (let i = 0; i < 50; i += 1) g.fillCircle(25 + (i * 107) % 1150, 18 + (i * 149) % 640, 9 + (i % 4) * 4);
      g.lineStyle(13, 0xb19d70).strokeLineShape(new Phaser.Geom.Line(1150, 105, 80, 610));
      g.lineStyle(7, 0x6e5c43).strokeLineShape(new Phaser.Geom.Line(690, 0, 610, 680));
      g.lineStyle(28, 0x61775d, 0.72).strokeLineShape(new Phaser.Geom.Line(430, 0, 520, 680));
      g.fillStyle(0x8a7455).fillRect(845, 105, 70, 42);
      g.fillStyle(0x4f4538).fillTriangle(838, 105, 880, 76, 922, 105);
      this.add.text(815, 48, 'MONMOUTH COURTHOUSE', { fontFamily: 'Georgia', fontSize: '18px', color: '#3a3327' }).setAlpha(0.82);
      this.add.text(390, 575, 'ROAD TO ENGLISHTOWN', { fontFamily: 'Arial', fontSize: '13px', color: '#e3dbc2', letterSpacing: 2 }).setRotation(-0.42).setAlpha(0.82);
      this.add.text(535, 250, 'MORASS AND BROKEN GROUND', { fontFamily: 'Arial', fontSize: '12px', color: '#e0e5d8', letterSpacing: 2 }).setAngle(83).setAlpha(0.72);
      return;
    }
    if (this.options.battleId === 'cowpens') {
      g.fillStyle(0x879367).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
      g.fillStyle(0x9c9a70, 0.5).fillEllipse(620, 350, 930, 530);
      g.fillStyle(0x4a603f, 0.92);
      for (let i = 0; i < 58; i += 1) {
        const edge = i % 2 === 0;
        const x = edge ? 20 + (i * 73) % 1160 : 80 + (i * 149) % 1040;
        const y = edge ? (i % 4 < 2 ? 28 + (i * 37) % 95 : 555 + (i * 31) % 95) : 35 + (i * 157) % 610;
        g.fillCircle(x, y, 10 + (i % 4) * 4);
      }
      g.lineStyle(9, 0xa58e64, 0.9).strokeLineShape(new Phaser.Geom.Line(1080, 90, 145, 610));
      g.lineStyle(5, 0x6e6047, 0.65).strokeLineShape(new Phaser.Geom.Line(1020, 650, 835, 25));
      g.fillStyle(0x5f704d, 0.38).fillEllipse(370, 430, 420, 185);
      this.add.text(390, 55, 'OPEN GRAZING GROUND', { fontFamily: 'Georgia', fontSize: '20px', color: '#e1d9ba' }).setAlpha(0.82);
      this.add.text(162, 575, 'ROAD TO THE BROAD RIVER', { fontFamily: 'Arial', fontSize: '13px', color: '#e7dec4', letterSpacing: 2 }).setRotation(-0.48).setAlpha(0.82);
      this.add.text(70, 465, 'WOODED REAR', { fontFamily: 'Arial', fontSize: '12px', color: '#e0e7d8', letterSpacing: 2 }).setAlpha(0.78);
      return;
    }
    g.fillStyle(0xb7b8ad).fillRect(0, 0, TRENTON_WORLD.width, TRENTON_WORLD.height);
    g.fillStyle(0x888b82, 0.62);
    for (let i = 0; i < 55; i += 1) g.fillEllipse((i * 97) % 1200, (i * 173) % 680, 120, 28);
    g.fillStyle(0x675d4d).fillRect(0, 510, 1200, 48);
    g.fillStyle(0x3c5361).fillRect(0, 558, 1200, 34);
    g.lineStyle(5, 0x76644d).strokeLineShape(new Phaser.Geom.Line(490, 0, 560, 680));
    g.lineStyle(3, 0x9b8669).strokeLineShape(new Phaser.Geom.Line(720, 0, 635, 680));
    for (let i = 0; i < 10; i += 1) {
      const x = 730 + (i % 5) * 62;
      const y = 110 + Math.floor(i / 5) * 120;
      g.fillStyle(0x725947).fillRect(x, y, 48, 28);
      g.fillStyle(0x3d3b35).fillTriangle(x - 5, y, x + 24, y - 18, x + 53, y);
    }
    this.add.text(775, 45, 'TRENTON', { fontFamily: 'Georgia', fontSize: '26px', color: '#3b3329' }).setAlpha(0.65);
    this.add.text(90, 610, 'ASSUNPINK CREEK', { fontFamily: 'Arial', fontSize: '14px', color: '#d8e3e8', letterSpacing: 3 }).setAlpha(0.75);
  }

  createFormation(unit) {
    const container = this.add.container(unit.x, unit.y).setDepth(100 + unit.y).setInteractive({ hitArea: { pieces: [] }, hitAreaCallback: containsUnitArt });
    container.on('pointerdown', (pointer) => {
      if (pointer.event?.target !== this.game.canvas || pointer.event.shiftKey) return;
      pointer.event.stopPropagation?.();
      if (unit.side === 'continental' && unit.active) this.options.onSelect(unit.id);
      else if (unit.side === 'crown') this.command('target', unit.id);
    });
    container.on('pointerover', () => { this.hoveredId = unit.id; });
    container.on('pointerout', () => { if (this.hoveredId === unit.id) this.hoveredId = null; });
    this.groups.set(unit.id, container);
    this.rebuildFormation(container, unit);
  }

  rebuildFormation(container, unit) {
    container.removeAll(true);
    container.legs = [];
    container.soldiers = [];
    container.gun = null;
    container.haul = null;
    container.crewTravelStart = null;
    container.artilleryTransport = null;
    container.gunners = [];
    container.riders = [];
    const identity = getUnitIdentity(this.options.battleId, unit);
    const color = { coat: identity.coat, trim: identity.trim };
    const profile = resolveInfantryProfile(identity.infantryProfile,key=>this.textures.exists(key));
    const militia = ['american-provincial', 'american-rifle', 'american-militia', 'british-rifle'].includes(identity.faction);
    const texturedBattery = unit.type === 'artillery' && this.textures.exists('artillery-atlas');
    if (texturedBattery) {
      const direction = Math.cos(unit.facing) >= 0 ? 1 : -1;
      const count = figureSlots(unit).length;
      const addCrew = (index) => {
        const station=artilleryCrewStation(index,unit.facing,unit.moving);
        const crew = this.add.image(station.x,station.y,'artillery-atlas',station.frame).setOrigin(0.5,1).setFlipX(Math.cos(station.facing)<0);
        crew.setScale(34 / crew.height);
        container.add(crew);
        container.gunners.push({ image: crew, index, phase: index * 1.7, travelMesh:null });
      };
      for (let i=0;i<Math.min(2,count);i++) addCrew(i);
      const shadow = this.add.ellipse(0,11,64,15,0x111111,0.25);
      const gun = this.add.image(0,12,'artillery-atlas',0).setOrigin(0.5,1).setFlipX(direction < 0);
      gun.setScale(64 / gun.width);
      container.add([shadow,gun]); container.gun = gun;
      if(artilleryHaulReady(key=>this.textures.exists(key))) {
        container.haul=this.add.image(0,12,ARTILLERY_HAUL_SPRITES[0].runtimeKey,'body').setVisible(false);
        container.add(container.haul);
      }
      for (let i=2;i<count;i++) addCrew(i);
    }
    const slots=figureSlots(unit);
    for (const slot of texturedBattery ? [] : slots) {
      const shadow = this.add.ellipse(slot.x + 4, slot.y + 7, 10, 4, 0x111111, 0.28);
      if (unit.type === 'infantry' && this.textures.exists('infantry-carry') && this.textures.exists('infantry-fire')) {
        const height = 39 + (slot.index % 3) * 0.6;
        const german = profile === 2 && this.textures.exists(GERMAN_TRICORN_SPRITES.carry.key) && this.textures.exists(GERMAN_TRICORN_SPRITES.fire.key);
        const placement = specialInfantryProfile(profile) ? directionalSpritePlacement(profile,'side','carry',height*.9,Math.cos(unit.facing)<0) : german ? germanSpritePlacement('carry', height * .9, unit.facing) : null;
        const soldier = this.add.image(slot.x, slot.y + 10, placement?.key || 'infantry-carry', placement?.frame ?? profile)
          .setOrigin(placement?.originX ?? .5, placement?.originY ?? 1)
          .setScale(placement?.scale ?? height / (this.textures.getFrame('infantry-carry', profile).height))
          .setFlipX(Math.cos(unit.facing) < 0);
        container.add([shadow, soldier]);
        let rig=null;
        const parts=infantryRigSprites(profile);
        if(parts && Object.values(parts).every(s=>this.textures.exists(s.runtimeKey))) {
          rig={};
          for(const name of ['farThigh','farFoot','farCalf','nearThigh','nearFoot','nearCalf','torso']) {
            const part=name==='torso'?'torso':name.replace(/^(far|near)/,'').toLowerCase();
            const image=((name==='torso' && createInfantryTorsoMesh(this,parts[part])) || this.add.image(0,0,parts[part].runtimeKey,'body')).setVisible(false);
            if(name.startsWith('far'))image.setTint(0xd1d1d1);
            container.add(image);rig[name]=image;
          }
        }
        container.soldiers.push({ image: soldier, rig, depthRigs:{}, directionalReady:directionalProfileReady(profile,key=>this.textures.exists(key)), diagonalReady:diagonalProfileReady(profile,key=>this.textures.exists(key)), profile, x: slot.x, y: slot.y + 10, height, phase: slot.index * 1.73 });
        continue;
      }
      if (unit.type === 'cavalry' && this.textures.exists('cavalry-atlas')) {
        const profile = identity.cavalryProfile;
        const rider = this.add.image(slot.x, slot.y + 13, 'cavalry-atlas',profile).setOrigin(0.5,1).setFlipX(Math.cos(unit.facing)<0);
        const height = 45 + (slot.index % 3)*0.5;
        rider.setScale(height/rider.height);
        shadow.setDisplaySize(32,7);
        container.add([shadow,rider]);
        container.riders.push({image:rider,contactMeshes:{},profile,height,x:slot.x,y:slot.y+13,phase:slot.index*1.61});
        continue;
      }
      if (unit.type === 'cavalry') {
        const horse = this.add.ellipse(slot.x, slot.y + 1, 17, 8, unit.side === 'continental' ? 0x604936 : 0x4b3528).setStrokeStyle(1, 0x241c17);
        const rider = this.add.rectangle(slot.x - 1, slot.y - 6, 6, 10, color.coat).setStrokeStyle(1, 0x20231f);
        const head = this.add.circle(slot.x - 1, slot.y - 13, 3, 0xc89b74).setStrokeStyle(1, 0x32251e);
        const saber = this.add.rectangle(slot.x + 6, slot.y - 10, 1.5, 16, 0xc8c5b8).setRotation(-0.65);
        container.add([shadow, horse, rider, head, saber]);
        continue;
      }
      const coatColor = militia ? (slot.index % 3 === 0 ? 0x6a5844 : slot.index % 3 === 1 ? 0x53604a : 0x5f5143) : color.coat;
      const rearLeg = this.add.rectangle(slot.x - 2, slot.y + 7, 2.5, 7, 0xd7d0bd).setRotation(-0.08);
      const frontLeg = this.add.rectangle(slot.x + 2, slot.y + 7, 2.5, 7, 0xc8c0ab).setRotation(0.08);
      const body = this.add.rectangle(slot.x, slot.y, unit.type === 'artillery' ? 11 : 8, unit.type === 'artillery' ? 7 : 14, coatColor).setStrokeStyle(1, 0x20231f);
      const facing = Math.cos(unit.facing) >= 0 ? 1 : -1;
      const belt = this.add.rectangle(slot.x + facing, slot.y - 1, 1.4, 13, 0xe6dfc9).setRotation(facing * -0.48);
      const head = this.add.circle(slot.x, slot.y - 9, 3.4, 0xc89b74).setStrokeStyle(1, 0x32251e);
      const hat = this.add.ellipse(slot.x, slot.y - 13, 9, 3.2, militia ? 0x514638 : 0x171b19).setStrokeStyle(1, 0x050605);
      const musket = this.add.rectangle(slot.x + facing * 6, slot.y - 1, 1.7, 22, 0x45372b).setRotation(facing * -0.13);
      const bayonet = this.add.rectangle(slot.x + facing * 7.5, slot.y - 13, 1, 6, 0xd7d6cc).setRotation(facing * -0.13);
      container.legs.push({ rearLeg, frontLeg, phase: slot.index * 1.7 });
      container.add([shadow, rearLeg, frontLeg, musket, bayonet, body, belt, head, hat]);
    }
    addStandard(this, container, unit, this.options.battleId);
    // Labels and health bars must never turn nearby ground into a selection target.
    container.input.hitArea.pieces = container.list.slice();
    const bar = this.add.rectangle(0, 35, 82, 6, 0x181b18).setStrokeStyle(1, 0xddd5bd);
    const fill = this.add.rectangle(-40, 35, 80 * unit.strength / unit.initialStrength, 4, unit.status === 'routed' ? 0xa94e3e : 0xd1b24f).setOrigin(0, 0.5);
    container.add([bar, fill]);
    container.healthBar = bar;
    container.healthFill = fill;
    container.caption = this.add.text(0, -65, '', { fontFamily: 'Arial', fontSize: '13px', color: '#fff4d8', backgroundColor: '#18201c', padding: { x: 6, y: 4 } }).setOrigin(0.5, 1);
    container.add(container.caption);
    container.lastFacing = Math.cos(unit.facing) >= 0 ? 1 : -1;
    container.lastVisualCount = figureSlots(unit).length;
    container.lastMode = unit.formationMode;
    container.lastStatus = unit.status;
    container.lastVolley = unit.volleySerial;
  }

  showVolley(unit) {
    const direction = Math.cos(unit.facing) >= 0 ? 1 : -1;
    if (unit.type === 'artillery') {
      const group = this.groups.get(unit.id);
      const scale = group?.scaleX || 1;
      const muzzleX = unit.x + direction * 29 * scale;
      const muzzleY = unit.y - 11 * scale;
      const flash = this.add.circle(muzzleX,muzzleY,7,0xffd68a,0.85).setDepth(710 + unit.y);
      this.tweens.add({targets:flash,alpha:0,scale:1.5,duration:100,onComplete:()=>flash.destroy()});
      for (let i=0;i<3;i++) {
        const smoke = this.add.circle(muzzleX + direction * i * 8,muzzleY-i*3,12+i*5,0xd4cfc1,0.4).setDepth(700+unit.y);
        this.tweens.add({targets:smoke,x:smoke.x+direction*36,y:smoke.y-22,scale:2,alpha:0,duration:1400,onComplete:()=>smoke.destroy()});
      }
      return;
    }
    const group=this.groups.get(unit.id);
    if(group?.soldiers?.[0]?.directionalReady && group.infantryView!=='side') {
      for(const point of directionalVolleySamples(unit,group.soldiers,group.infantryView,group.scaleX,group.infantryFlipX)) {
        const smoke=this.add.circle(point.x,point.y,5,0xe7e3d5,.35).setDepth(700+unit.y);
        this.tweens.add({targets:smoke,x:point.x+point.dx,y:point.y+point.dy-8,scale:2,alpha:0,duration:850,onComplete:()=>smoke.destroy()});
      }
      return;
    }
    for (let index = 0; index < 5; index += 1) {
      const smoke = this.add.circle(unit.x + direction * (58 + index * 7), unit.y - 22 + index * 10, 10 + index * 2, 0xe7e3d5, 0.35).setDepth(700 + unit.y);
      this.tweens.add({ targets: smoke, x: smoke.x + direction * 26, y: smoke.y - 15, alpha: 0, scale: 1.8, duration: 850, onComplete: () => smoke.destroy() });
    }
  }

  showContactDust() {
    if(this.engine.outcome!=='undecided'||this.engine.time<(this.nextContactDust||0))return;
    this.nextContactDust=this.engine.time+.65;
    const units=this.engine.formations.filter(u=>u.active&&u.engaged);
    for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++) {
      const a=units[i],b=units[j];
      if(!inFormationContact(a,b)||!segmentClear(this.options.battleId,a,b))continue;
      for(let k=0;k<2;k++) {
        const dust=this.add.circle((a.x+b.x)/2+(k-.5)*11,(a.y+b.y)/2+3,3+k,0xb8aa8d,.2).setDepth(700+(a.y+b.y)/2);
        this.tweens.add({targets:dust,y:dust.y-7,scale:2,alpha:0,duration:420,onComplete:()=>dust.destroy()});
      }
    }
  }

  update(_, delta) {
    if (!this.engine) return;
    const dt = Math.min(delta / 1000, 0.05) * this.options.speed;
    this.tweens.timeScale = this.options.speed;
    if (dt > 0) { this.engine.tick(dt); this.showContactDust(); }
    for (const unit of this.engine.formations) {
      const container = this.groups.get(unit.id);
      if (!container) continue;
      const previousTravel=container.travelPhase || 0;
      container.travelPhase = travelPhase(container.lastPosition, unit, previousTravel);
      container.lastPosition = { x: unit.x, y: unit.y };
      container.x = unit.x;
      container.y = unit.y;
      container.setVisible(unit.active);
      container.setDepth(100 + unit.y);
      container.setAlpha(unit.status === 'routed' ? 0.55 : 1);
      const perspectiveScale = 0.82 + unit.y / TRENTON_WORLD.height * 0.22;
      container.rigTravel=(container.rigTravel || 0)+(container.travelPhase-previousTravel)/perspectiveScale;
      container.setScale(perspectiveScale);
      const visualCount = figureSlots(unit).length;
      const fired = unit.volleySerial !== container.lastVolley;
      if (container.lastVisualCount !== visualCount || container.lastMode !== unit.formationMode || container.lastStatus !== unit.status || container.lastFacing !== (Math.cos(unit.facing) >= 0 ? 1 : -1)) {
        this.rebuildFormation(container, unit);
      }
      container.infantryHeading=infantryHeading(unit.facing,container.infantryHeading);
      const presentation=infantryHeadingPresentation(container.infantryHeading);
      container.infantryView=container.soldiers[0]?.diagonalReady?presentation.view:infantryFacing(unit.facing,container.infantryView);
      container.infantryFlipX=container.soldiers[0]?.diagonalReady?presentation.flipX:false;
      if (fired) {
        container.lastShotAt = this.engine.time;
        container.firingUntil = this.engine.time + 0.35;
        this.showVolley(unit);
        container.lastVolley = unit.volleySerial;
      }
      const inspecting = this.hoveredId === unit.id;
      container.healthBar.setVisible(inspecting);
      container.healthFill.setVisible(inspecting).setDisplaySize(80 * unit.strength / unit.initialStrength, 4);
      container.caption.setVisible(inspecting).setText(`${unit.name} · ${Math.round(unit.strength)} · ${unit.engaged ? 'Close combat' : unit.status === 'steady' ? unit.order : unit.status}`);
      animateStandard(container, this.engine.time);
      const inContact=unit.active && unit.status==='steady' && unit.engaged && !unit.moving && !['fallback','withdraw'].includes(unit.order);
      if(inContact)container.contactSince ??= this.engine.time;
      else container.contactSince=null;
      const opponents=inContact ? this.engine.formations.filter(enemy=>enemy.active && enemy.status==='steady' && enemy.side!==unit.side && inFormationContact(unit,enemy) && segmentClear(this.options.battleId,unit,enemy)) : [];
      const mountedFront=contactFrontRanks(unit,opponents,container.riders,27,19);
      for (const rider of container.riders) {
        const frame = cavalryMotionFrame(unit,container.travelPhase,rider.phase);
        const contact=cavalryContactCycle(unit,this.engine.time,rider.phase,container.contactSince,mountedFront.has(rider));
        const contactArt=contact && cavalryContactReady(rider.profile,key=>this.textures.exists(key)) ? cavalryContactPlacement(rider.profile,contact.frame,rider.height,unit.facing) : null;
        for(const mesh of Object.values(rider.contactMeshes))mesh.setVisible(false);
        let contactMesh=null;
        if(contactArt) {
          contactMesh=rider.contactMeshes[contact.frame];
          if(!contactMesh) {
            contactMesh=createCavalryContactMesh(this,CAVALRY_CONTACT_SPRITES[rider.profile/2][contact.frame]);
            if(contactMesh){rider.contactMeshes[contact.frame]=contactMesh;container.addAt(contactMesh,container.getIndex(rider.image)+1);container.input.hitArea.pieces.push(contactMesh);}
          }
        }
        rider.image.setVisible(!contactMesh);
        if(contactMesh){poseCavalryContactMesh(contactMesh,contact,this.engine.time,rider.phase,rider.height,rider.x,rider.y,Math.cos(unit.facing)<0);continue;}
        const art = contactArt && this.textures.exists(contactArt.key) ? contactArt : frame===null ? null : cavalrySpritePlacement(rider.profile,frame,rider.height,unit.facing);
        if(art && this.textures.exists(art.key)) {
          if(rider.image.texture.key!==art.key)rider.image.setTexture(art.key,art.frame);
          rider.image.setOrigin(art.originX,art.originY).setScale(art.scale);
        } else {
          // A missing authored pose, halt or guarded backward fallback must
          // not strand a horse on a lifted-leg drawing or show a blank unit.
          if(rider.image.texture.key!=='cavalry-atlas' || rider.image.frame.name!==rider.profile)rider.image.setTexture('cavalry-atlas',rider.profile);
          rider.image.setOrigin(.5,1).setScale(rider.height/rider.image.height);
        }
        rider.image.setFlipX(Math.cos(unit.facing)<0).setPosition(rider.x,rider.y).setRotation(0);
      }
      if (container.gun) {
        const haulFrame=artilleryHaulFrame(unit,container.travelPhase);
        const availableHaulArt=container.haul && haulFrame!==null && artilleryHaulReady(key=>this.textures.exists(key)) ? artilleryHaulPlacement(haulFrame,unit.facing) : null;
        container.artilleryTransport=artilleryTransport(container.artilleryTransport,unit,this.engine.time,Boolean(availableHaulArt));
        const haulArt=container.artilleryTransport.mode==='haul'?availableHaulArt:null;
        container.gun.setVisible(!haulArt);
        if(container.haul)container.haul.setVisible(Boolean(haulArt));
        if(haulArt)container.haul.setTexture(haulArt.key,haulArt.frame).setOrigin(haulArt.originX,haulArt.originY).setScale(haulArt.scale).setFlipX(Math.cos(unit.facing)<0).setPosition(0,12);
        const elapsed = this.engine.time - (container.lastShotAt ?? -100);
        const recoil = elapsed < 0.65 ? 3 * Math.max(0,1-elapsed/0.65) : 0;
        const direction = Math.cos(unit.facing) >= 0 ? 1 : -1;
        container.gun.x = -direction * recoil;
        if(unit.moving)container.crewTravelStart??=container.travelPhase;else container.crewTravelStart=null;
        for (const crew of container.gunners) {
          if(crew.travelMesh)crew.travelMesh.setVisible(false);
          crew.image.setVisible(!haulArt || crew.index>=3);
          const station=artilleryCrewStation(crew.index,unit.facing,unit.moving);
          const deployment=container.artilleryTransport.positions?.[crew.index]||null;
          const position=deployment||station;
          const action=artilleryCrewAction(unit,crew.index);
          const art=action ? artillerySpritePlacement(action.frame,34,station.facing) : null;
          if(art && this.textures.exists(art.key)) {
            if(crew.image.texture.key!==art.key)crew.image.setTexture(art.key,art.frame);
            crew.image.setOrigin(art.originX,art.originY).setScale(art.scale);
          } else {
            if(crew.image.texture.key!=='artillery-atlas'||crew.image.frame.name!==station.frame)crew.image.setTexture('artillery-atlas',station.frame);
            crew.image.setOrigin(.5,1).setScale(34/crew.image.height);
          }
          const travel=artilleryTravelState(unit,container.travelPhase,crew.phase,container.crewTravelStart);
          const sprite=ARTILLERY_TRAVEL_SPRITES[station.frame-1];
          const marchFrame=artilleryMarchFrame(deployment?{...unit,moving:true}:unit,deployment?deployment.travel:container.travelPhase,crew.phase);
          const marchArt=marchFrame!==null&&artilleryMarchReady(station.frame-1,key=>this.textures.exists(key))?artilleryMarchPlacement(station.frame-1,marchFrame,position.facing):null;
          if(crew.image.visible && marchArt){
            crew.image.setTexture(marchArt.key,marchArt.frame).setOrigin(marchArt.originX,marchArt.originY).setScale(marchArt.scale);
          } else if(crew.image.visible && travel && this.textures.exists(sprite.runtimeKey)) {
            if(!crew.travelMesh){
              crew.travelMesh=createArtilleryTravelMesh(this,sprite);
              if(crew.travelMesh){container.addAt(crew.travelMesh,container.getIndex(crew.image)+1);container.input.hitArea.pieces.push(crew.travelMesh);}
            }
            if(crew.travelMesh){poseArtilleryTravelMesh(crew.travelMesh,travel,position.x,position.y,Math.cos(position.facing)<0);crew.image.setVisible(false);}
          }
          crew.image.setFlipX(Math.cos(position.facing)<0).setPosition(position.x,position.y).setRotation(0);
        }
      }
      const front=contactFrontRanks(unit,opponents,container.soldiers,unit.formationMode==='open'?16:unit.formationMode==='column'?10:11,unit.formationMode==='open'?15:12);
      for (const figure of container.soldiers) {
        for(const mesh of Object.values(figure.depthRigs))mesh.setVisible(false);
        const view=figure.directionalReady?container.infantryView:'side';
        const depthPose=view!=='side'?directionalInfantryPose(unit,container.travelPhase,this.engine.time,figure.phase,container.contactSince,front.has(figure)):null;
        const depthArt=depthPose?directionalSpritePlacement(figure.profile,view,depthPose,figure.height*.9,container.infantryFlipX):null;
        if(depthArt) {
          if(figure.rig)for(const image of Object.values(figure.rig))image.setVisible(false);
          let mesh=null;
          if(depthPose.startsWith('march')) {
            if(!figure.depthRigs[view]) {
              // Keep at most two direction meshes per figure. Remove discarded
              // meshes from hit testing as well as rendering when turns replace them.
              const oldest=Object.keys(figure.depthRigs)[0];
              if(Object.keys(figure.depthRigs).length>=2){const discarded=figure.depthRigs[oldest];container.input.hitArea.pieces=container.input.hitArea.pieces.filter(piece=>piece!==discarded);discarded.destroy();delete figure.depthRigs[oldest];}
              mesh=createInfantryDepthMesh(this,directionalSprite(figure.profile,view));
              if(mesh){figure.depthRigs[view]=mesh;container.addAt(mesh,container.getIndex(figure.image)+1);container.input.hitArea.pieces.push(mesh);}
            } else mesh=figure.depthRigs[view];
          }
          figure.image.setVisible(!mesh);
          if(mesh)poseInfantryDepthMesh(mesh,container.rigTravel/(figure.height*.9/36)+Math.sin(figure.phase)*.22,figure.height*.9,figure.x,figure.y,container.infantryFlipX);
          else {
            figure.image.setTexture(depthArt.key,depthArt.frame).setOrigin(depthArt.originX,depthArt.originY).setFlipX(depthArt.flipX)
              .setScale(depthArt.scale).setPosition(figure.x,figure.y).setRotation(0);
          }
          continue;
        }
        const rigPose=figure.rig ? infantryStrideRig(unit,container.rigTravel/(figure.height*.9/36),figure.phase,figure.height*.9) : null;
        if(figure.rig)for(const image of Object.values(figure.rig))image.setVisible(Boolean(rigPose));
        figure.image.setVisible(!rigPose);
        if(rigPose) {
          const place=(name,part,point,rotation=0,length=null)=>{
            const art=rigPartPlacement(part,rigPose.scale,rigPose.direction,length,figure.profile);
            figure.rig[name].setOrigin(art.originX,art.originY).setFlipX(rigPose.direction<0)
              .setScale(art.scaleX,art.scaleY).setRotation(rotation).setPosition(figure.x+point.x,figure.y+point.y);
          };
          for(const side of ['far','near']) {
            const leg=rigPose[side];
            const segment=(part,a,b)=>place(side+part,part.toLowerCase(),a,Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2,Math.hypot(b.x-a.x,b.y-a.y));
            segment('Thigh',leg.hip,leg.knee);
            place(side+'Foot','foot',leg.ankle,leg.footRotation);
            segment('Calf',leg.knee,leg.ankle);
          }
          if(figure.rig.torso.torsoRig)poseInfantryTorsoMesh(figure.rig.torso,rigPose.phase,rigPose.direction,rigPose.scale,figure.x+rigPose.hip.x,figure.y+rigPose.hip.y);
          else place('torso','torso',rigPose.hip);
          continue;
        }
        if(specialInfantryProfile(figure.profile)) {
          const pose=directionalInfantryPose(unit,container.travelPhase,this.engine.time,figure.phase,container.contactSince,front.has(figure))||'carry';
          const art=directionalSpritePlacement(figure.profile,'side',pose,figure.height*.9,Math.cos(unit.facing)<0);
          figure.image.setTexture(art.key,art.frame).setOrigin(art.originX,art.originY).setFlipX(art.flipX)
            .setScale(art.scale).setPosition(figure.x,figure.y).setRotation(0);
          continue;
        }
        const pose = infantryPose(unit, figure.phase);
        const action=infantryActionFrame(unit,container.travelPhase,figure.phase);
        const stroke=action?.kind==='contact' ? infantryContactCycle(unit,this.engine.time,figure.phase,container.contactSince,front.has(figure)) : null;
        const actionPlacement=action?.kind==='march'
          ? marchSpritePlacement(figure.profile,action.frame,figure.height*.9,unit.facing)
          : action?.kind==='contact' ? contactSpritePlacement(figure.profile,stroke?.frame||0,figure.height*.9,unit.facing) : null;
        const guardFallback=action?.kind==='contact' ? contactSpritePlacement(figure.profile,0,figure.height*.9,unit.facing) : null;
        const actionArt=actionPlacement && this.textures.exists(actionPlacement.key) ? actionPlacement
          : guardFallback && this.textures.exists(guardFallback.key) ? guardFallback : null;
        const aiming = ['fire','ready','contact'].includes(pose);
        const loading = pose === 'reload' && this.textures.exists(INFANTRY_RELOAD_SPRITES[0].key)
          ? reloadSpritePlacement(figure.profile, figure.height * .9, unit.facing) : null;
        const german = figure.profile===2 && this.textures.exists(GERMAN_TRICORN_SPRITES.carry.key) && this.textures.exists(GERMAN_TRICORN_SPRITES.fire.key);
        let base;
        if(actionArt) {
          if(figure.image.texture.key!==actionArt.key || figure.image.frame.name!==actionArt.frame)figure.image.setTexture(actionArt.key,actionArt.frame);
          figure.image.setOrigin(actionArt.originX,actionArt.originY).setFlipX(Math.cos(unit.facing)<0);
          base=actionArt.scale;
        } else if(loading) {
          if(figure.image.texture.key!==loading.key || figure.image.frame.name!==loading.frame)figure.image.setTexture(loading.key,loading.frame);
          figure.image.setOrigin(loading.originX,loading.originY).setFlipX(Math.cos(unit.facing)<0);
          base=loading.scale;
        } else if(german) {
          const sprite=germanSpritePlacement(aiming?'fire':'carry',figure.height*.9,unit.facing);
          if(figure.image.texture.key!==sprite.key)figure.image.setTexture(sprite.key,sprite.frame);
          figure.image.setOrigin(sprite.originX,sprite.originY).setFlipX(Math.cos(unit.facing)<0);
          base=sprite.scale;
        } else {
          const firing=figure.profile!==2&&aiming;
          const key=firing?'infantry-fire':'infantry-carry';
          if(figure.image.texture.key!==key)figure.image.setTexture(key,figure.profile);
          figure.image.setOrigin(firingOrigin(firing,unit.facing),1).setFlipX(Math.cos(unit.facing)<0);
          base=(firing?figure.height*.88:figure.height)/figure.image.height;
        }
        const motion = infantryBodyMotion(unit, container.travelPhase, this.engine.time, figure.phase);
        // The new poses already contain a planted foot. Do not lift the whole
        // drawing off its ground anchor. Rear ranks keep their guarded line.
        if(actionArt)motion.lift=0;
        if(actionArt && action.kind==='contact') {
          motion.x=stroke?.x||0;motion.rotation=stroke?.rotation||0;motion.scaleY=1;
        }
        figure.image.setScale(base, base * motion.scaleY)
          .setPosition(figure.x + motion.x, figure.y - motion.lift).setRotation(motion.rotation);
      }
      for (const leg of container.legs) {
        const stride = unit.moving ? Math.sin(container.travelPhase + leg.phase) * 0.35 : 0;
        leg.rearLeg.setRotation(-0.08 + stride);
        leg.frontLeg.setRotation(0.08 - stride);
      }
    }
    const selected = this.engine.formations.find((unit) => unit.id === this.options.selectedId);
    this.selection.setVisible(Boolean(selected?.active && selected.status !== 'routed')).setPosition(selected?.x || 0, selected?.y || 0);
    const indicator = commandIndicator(selected, this.engine.outcome, this.engine.formations);
    this.commandLine.clear();
    this.commandLabel.setVisible(Boolean(indicator?.showLabel));
    if (indicator) {
      const {x,y,color,label,drawLine} = indicator;
      this.commandLine.lineStyle(2,color,.65);
      if (drawLine) {
        const dx=x-selected.x,dy=y-selected.y,length=Math.hypot(dx,dy);
        for(let start=0;start<length;start+=16) {
          const end=Math.min(start+8,length);
          this.commandLine.lineBetween(selected.x+dx*start/length,selected.y+dy*start/length,selected.x+dx*end/length,selected.y+dy*end/length);
        }
      }
      this.commandLine.strokeCircle(x,y,9);
      this.commandLabel.setText(label).setPosition(x,y-13);
      // Keep the label legible near map edges without moving the destination itself.
      this.commandLabel.x=Math.max(this.commandLabel.width/2+4,Math.min(TRENTON_WORLD.width-this.commandLabel.width/2-4,x));
    }
    this.checkpointElapsed=(this.checkpointElapsed||0)+delta;
    if(this.checkpointElapsed>=1000 || this.checkpointSpeed!==this.options.speed || this.checkpointOutcome!==this.engine.outcome){
      this.saveCheckpoint();this.checkpointSpeed=this.options.speed;this.checkpointOutcome=this.engine.outcome;
    }
    this.snapshotElapsed = (this.snapshotElapsed || 0) + delta;
    if (this.snapshotElapsed >= 100 || this.lastSelected !== this.options.selectedId || this.lastOutcome !== this.engine.outcome) {
      this.snapshotElapsed = 0;
      this.lastSelected = this.options.selectedId;
      this.lastOutcome = this.engine.outcome;
      this.options.onSnapshot(this.engine.snapshot());
    }
  }
}

export const TrentonBattlefield = forwardRef(function TrentonBattlefield({ battleId = 'trenton', campaignContext, speed, selectedId, onSelect, onSnapshot, onAction, checkpoint, onCheckpoint, onRestore }, ref) {
  const host = useRef(null);
  const game = useRef(null);
  const scene = useRef(null);
  const battleSeed = { bunker_hill: 17750617, long_island: 17760827, brandywine: 17770911, saratoga: 17771007, monmouth: 17780628, cowpens: 17810117, trenton: 17761226 }[battleId] || 17761226;
  const options = useRef({ battleId, campaignContext, speed, selectedId, onSelect, onSnapshot, onAction, checkpoint, onCheckpoint, onRestore, seed: battleSeed });
  Object.assign(options.current, { battleId, campaignContext, speed, selectedId, onSelect, onSnapshot, onAction, checkpoint, onCheckpoint, onRestore });

  useEffect(() => {
    const activeScene = new TrentonScene(options.current);
    scene.current = activeScene;
    game.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      width: TRENTON_WORLD.width,
      height: TRENTON_WORLD.height,
      transparent: false,
      backgroundColor: '#101812',
      scene: activeScene,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false },
    });
    return () => game.current?.destroy(true);
  }, [battleId]);

  useImperativeHandle(ref, () => ({
    locateLandmark: (landmark) => {
      const active=scene.current;
      if(active){active.cameras.main.setZoom(1.5).centerOn(landmark.x,landmark.y);active.landmarkLabel.setVisible(false);}
    },
    attack: (id) => scene.current?.command('target', id),
    focus: () => {
      const activeScene = scene.current;
      const unit = activeScene?.engine?.formations.find(entry => entry.id === options.current.selectedId && entry.active);
      if (unit) activeScene.cameras.main.centerOn(unit.x, unit.y);
    },
    pan: (dx, dy) => { const camera = scene.current?.cameras?.main; if (camera) { camera.scrollX += dx / camera.zoom; camera.scrollY += dy / camera.zoom; } },
    order: (order) => scene.current?.command('order', order),
    firePolicy: (policy) => scene.current?.command('fire-policy', policy),
    formation: (mode) => scene.current?.command('formation', mode),
    zoom: (delta) => {
      const camera = scene.current?.cameras?.main;
      if (camera) camera.setZoom(Math.max(0.8, Math.min(2, camera.zoom + delta)));
    },
  }), []);

  return <div className="battlefield-canvas" ref={host} aria-label={`Interactive battlefield: ${getBattleDefinition(battleId).title}`} />;
});
