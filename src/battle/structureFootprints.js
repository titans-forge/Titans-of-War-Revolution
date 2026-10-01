import {formationFootprint} from './formationContact.js';
// Ground footprints authored against the existing painted 1200 x 680 maps.
// These are navigation obstacles, not surveyed plans or occupiable garrisons.
export const STRUCTURE_FOOTPRINTS = {
  trenton: [{id:'old-barracks',x1:286,x2:506,y1:252,y2:292}],
  long_island: [{id:'vechte-house',x1:772,x2:847,y1:257,y2:279}],
  brandywine: [{id:'ring-house',x1:404,x2:489,y1:189,y2:211}],
  saratoga: [{id:'neilson-house',x1:594,x2:706,y1:474,y2:498}],
  monmouth: [{id:'craig-house',x1:624,x2:682,y1:197,y2:213}],
};
export const structuresFor = id => STRUCTURE_FOOTPRINTS[id] || [];
export const expandedStructure = (s,unit) => {const size=unit?formationFootprint(unit):{x:0,y:0};const margin=unit?.navigationMargin||0;const p={x:size.x+margin,y:size.y+margin};return {...s,x1:s.x1-p.x,x2:s.x2+p.x,y1:s.y1-p.y,y2:s.y2+p.y};};
export const structurePolygon = s => [{x:s.x1,y:s.y1},{x:s.x2,y:s.y1},{x:s.x2,y:s.y2},{x:s.x1,y:s.y2}];
