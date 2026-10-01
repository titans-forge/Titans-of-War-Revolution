import assert from 'node:assert/strict';
import {TrentonEngine} from '../src/battle/trentonEngine.js';
import {weaponStatus} from '../src/battle/infantryAnimation.js';

// All three scenarios formerly produced one or two shots during approach.
for(const id of ['trenton','brandywine','monmouth']) {
 const battle=new TrentonEngine(17761226,id),gun=battle.formations.find(u=>u.type==='artillery'),enemy=battle.formations.find(u=>u.side==='crown');
 battle.attack(gun.id,enemy.id);const ammo=gun.ammunition;let seenMoving=false,seenShot=false,serial=gun.volleySerial;
 for(let i=0;i<1400&&!seenShot;i++) {
  battle.tick(.05);
  if(gun.moving) {
   seenMoving=true;assert.equal(gun.ammunition,ammo,'approaching '+id+' gun cannot consume ammunition');
   assert.equal(gun.volleySerial,serial,'approaching '+id+' gun cannot fire');
   assert.match(weaponStatus(gun),/Moving battery/);
  }
  if(gun.volleySerial>serial){seenShot=true;assert.equal(gun.moving,false);}
 }
 assert.ok(seenMoving&&seenShot,id+' must approach, halt and successfully fire');
}

{
 const battle=new TrentonEngine(17761226,'trenton'),gun=battle.formations.find(u=>u.id==='knox'),enemy=battle.formations.find(u=>u.id==='rall');
 battle.attack(gun.id,enemy.id);
 for(let i=0;i<400&&gun.x<500;i++)battle.tick(.05);
 battle.order(gun.id,'volley');
 assert.ok(gun.moving&&gun.volleyRequested,'volley requests a halt but the moving state remains until the next simulation tick');
 assert.match(weaponStatus(gun),/Moving battery.*volley queued/);
 const before=JSON.stringify({ammo:gun.ammunition,reload:gun.reload,serial:gun.volleySerial,request:gun.volleyRequested,target:enemy.strength});
 battle.fire(gun,enemy,100);
 assert.equal(JSON.stringify({ammo:gun.ammunition,reload:gun.reload,serial:gun.volleySerial,request:gun.volleyRequested,target:enemy.strength}),before,'direct rejected fire has no damage, ammo or reload side effects');
 // Stop inside range with the queued request still active. The next eligible
 // tick fires once; a paused tick cannot deliver a second shot.
 for(let i=0;i<10&&gun.volleySerial===0;i++)battle.tick(.05);
 assert.equal(gun.volleySerial,1);assert.equal(gun.volleyRequested,false);assert.equal(gun.ammunition,gun.initialAmmunition-1);
 const serial=gun.volleySerial;battle.tick(0);assert.equal(gun.volleySerial,serial);
}
console.log('Artillery fire discipline passed: three real approaches cannot fire on the move, stationary fire resumes, queued volley survives, rejected fire is inert, and pause cannot duplicate shots.');
