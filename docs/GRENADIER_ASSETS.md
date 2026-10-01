# British grenadier profile — pass 35

Profile 5 belongs only to `monmouth:grenadiers-monmouth`. Other British infantry retain profile 1; Ferguson retains profile 4. The current British Union standard remains a representative gameplay marker rather than a claim about grenadier battalion colours.

## Historical basis and limits

The [National Army Museum catalogue for “Mars in disguise or the terrors of the Bear-skin”](https://collection.nam.ac.uk/detail.php?acc=1977-07-36-1) describes a 1772 print and the 1768 order replacing grenadier companies’ embroidered cloth caps with black bearskin. This provides a period basis for the new role silhouette. It does not prove the exact field dress of every company at Monmouth.

The scarlet coat, pale facings and shoulder decoration, cap plate/cord, crossbelts, cream breeches and black gaiters form an illustrative composite. They are not a regiment-specific uniform reconstruction. Generated musket and bayonet details are approximate. The muzzle-loading pose represents a stage of loading, not the complete drill. Finer equipment handedness and mirrored views remain illustrative. No combat bonus, reload rate, ammunition or morale change accompanies this artwork.

## Accepted project assets

- `public/images/units/revolution-grenadier-side-v1.png`: five carry/fire/reload/guard/thrust cutouts and a separate matching walking torso.
- `public/images/units/revolution-grenadier-diagonal-v1.png`: ten front-diagonal/rear-diagonal action cutouts.
- `public/images/units/revolution-grenadier-depth-v1.png`: ten front/rear action cutouts.

All eight heading sectors resolve to these 25 actions by mirroring the matching views. The torso uses shared cream-breeches/black-gaiter legs and a right-weapon cloth mask that leaves the head and weapon grip steady. Whole original PNGs are retained; normal runtime chroma keying and seeded foreground extraction isolate the silhouettes. `src/battle/grenadierAtlas.js` records original-source hashes, cutout seeds, dimensions and registrations. The metadata builder is retained with the pass evidence.

`infantrySpecialProfiles.js` centralizes source selection, prior-profile loading and complete-set fallback for both Ferguson and the grenadier. All 25 action textures, the matching torso and three shared leg parts must exist. Any missing component restores the previous complete profile (British line infantry for the grenadier), preventing costume changes between actions. Other battles do not preload the grenadier PNGs.

## Generation provenance

Images were made with the built-in OpenAI image-generation tool, not a Forge local model or the fallback CLI. The tool returned no verifiable model version. [GRENADIER_GENERATION.json](GRENADIER_GENERATION.json) preserves the full prompt set, reference paths and original output paths.

The initial depth sheet’s thrust poses were rejected because they resembled shoulder firing. A targeted correction lowered the weapon and made the lunge visible. Close-up walking review then identified grounded weapons in the two rear carry drawings; targeted corrections bring the stocks to the hip to match the front and side carry poses. All intermediate originals remain at their recorded generation paths.
