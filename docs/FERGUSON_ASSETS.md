# Ferguson rifle profile — pass 34

The new infantry profile 4 is assigned only to `brandywine:ferguson`. American riflemen and militia retain profile 3. The existing representative British Union standard remains unchanged.

## Historical basis and limits

The [Queen's Royal Surrey regimental history](https://www.queensroyalsurreys.org.uk/personalities/ferguson/major-patrick-ferguson.html) describes the experimental corps wearing green cloth supplied for them in 1777. The [Brandywine Battlefield history](https://ushistory.org/brandywine/special/art09.htm) also describes the green-clad rifle company. The [National Park Service's Ferguson Rifle page](https://home.nps.gov/kimo/learn/historyculture/ferguson-rifle.htm) identifies the weapon as a breech-loading rifle that did not require a ramrod, and places the experimental corps at Brandywine.

Those sources justify distinguishing the corps with green clothing and a reload pose at the breech. They do not establish every garment, facing, headgear, strap or equipment detail used here. The black cocked hat, off-white facings, cream breeches, gaiters and equipment are consistent illustrative choices for the game, not a verified reconstruction of a surviving uniform. The generated rifle and trigger-guard detail are approximate, not an exact mechanical model or a loading tutorial. No faster firing rate or other combat advantage was introduced by this art pass.

## Original assets

| Project asset under `public/images/units/` | Accepted content |
| --- | --- |
| `revolution-ferguson-depth-v1.png` | 10 front/rear carry, fire, breech reload, guard and thrust cutouts. Four unused stride drawings remain in the original sheet for provenance. |
| `revolution-ferguson-diagonal-v1.png` | 10 corresponding front-diagonal/rear-diagonal cutouts. |
| `revolution-ferguson-side-v1.png` | Five side action cutouts and the separate carry torso used with the existing cream-breeches/black-gaiter articulated legs. |

Left-facing views mirror the corresponding side and diagonal artwork. All eight heading sectors therefore resolve to matching actions. Registration, source SHA-256 hashes, foreground island seeds, ground anchors and torso joint/scale are recorded in `src/battle/fergusonAtlas.js`. Runtime keying and connected-foreground extraction preserve the owned source pixels while excluding neighboring silhouettes. Original PNG files are intact. A dedicated torso motion mask follows this drawing's free sleeve and coat tail, protecting the face, rifle barrel and gripping hand during articulated walking.

Generation used the built-in OpenAI image-generation tool, not the Forge local image models or fallback CLI. Exact prompts, references and original output paths are retained in `docs/FERGUSON_GENERATION.json`. No verifiable model version was returned by the tool. The first side sheet was rejected because its thrust resembled aiming; the targeted corrected side sheet is the accepted project copy. All generated originals remain at their recorded locations.

The complete-profile check requires all 25 action cutouts, the green torso and the three shared leg parts. If any is unavailable, Ferguson uses the previous complete profile 3 throughout, with its source atlases preloaded. Duplicate source keys are deduplicated before loading. The metadata builder and visual fixtures are retained in the Codex workspace `work/revolution-pass34/`.
