import assert from 'node:assert/strict';
import fs from 'node:fs';
import {publicAsset} from '../src/game/publicAsset.js';
for(const folder of ['campaign','battles','units'])for(const name of fs.readdirSync(`public/images/${folder}`)){
 const path=publicAsset(`/images/${folder}/${name}`);
 assert.equal(new URL(path,'https://example.test/12345/game/index.html').pathname,`/12345/game/images/${folder}/${name}`);
 assert.equal(new URL(path,'https://example.test/').pathname,`/images/${folder}/${name}`);
}
console.log('Public asset URLs retain both nested and root deployment directories.');
