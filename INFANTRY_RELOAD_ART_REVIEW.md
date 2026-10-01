# Pass 23 infantry reload art review

## Result

`public/images/units/revolution-infantry-reload-v1.png` is approved as a four-profile reload atlas. It is a 1254 x 1254 RGBA PNG with genuine transparency. Each quadrant contains one complete, separated figure and musket. Both hands visibly work near the lock, making the pose distinct from carry and aim.

Profiles 0, 1, and 3 preserve the broad Continental blue-coat, British red-coat, and brown hunting-shirt identities of the existing sheets. Profile 2 follows the approved German replacement art: black tricorn, navy coat, red cuffs and facings. These are representative game identities; no regiment-specific reconstruction is claimed.

The initial generation had a baked checkerboard and remains outside the candidate at `../evidence/pass23-reload/reload-atlas-generation.png`. A background-extraction edit preserved the figures and produced the approved RGBA asset.

## Measured registration

Measurements use alpha >20. Frames add eight pixels around meaningful bounds where canvas space permits. They are disjoint and preserve complete weapons.

| Profile | Meaningful alpha bounds | Runtime frame | Body top | Boot line | Body height | Boot anchor |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 0 | `(152,28) 465x596` | `(144,20) 481x612` | 28 | 623 | 596 | `(324,623)` |
| 1 | `(770,35) 468x586` | `(762,27) 484x602` | 35 | 620 | 586 | `(943,620)` |
| 2 | `(155,644) 459x585` | `(147,636) 475x601` | 644 | 1228 | 585 | `(324,1228)` |
| 3 | `(763,655) 479x574` | `(755,647) 495x590` | 655 | 1228 | 574 | `(934,1228)` |

Runtime metadata is in `src/battle/infantryReloadSprites.js`. `reloadSpritePlacement(profile, bodyHeight, facing)` scales from measured hat-to-boot height and mirrors the measured boot anchor. It returns `null` for an unapproved profile so callers can retain existing art.

This atlas supplies one reload pose per profile. It is not a skeletal animation or a complete reload cycle.

## Accepted runtime integration

`TrentonBattlefield.jsx` loads the atlas once, creates the four named frames directly from this metadata, and requests `reloadSpritePlacement(profile, figure.height * .9, facing)`. The placement scale therefore uses measured hat-to-boot height rather than the diagonal musket span. Its frame-relative origins hold the measured boot anchor at the figure position for both facings. The 90% target matches the existing firing and German combat-pose treatment; browser review found the four profiles grounded at readable size.

`infantryPose` derives the visible sequence from the existing `volleySerial`, `reload`, ammunition, movement, order, status, and contact state. It adds a small deterministic per-rank timing offset without changing simulation state. A real shot displays fire, then this reload pose, then the existing ready pose. Movement, withdrawal, fallback, reform, routing, and contact interrupt the cycle. When the last shot consumes the remaining ammunition, its brief fire pose remains visible and no further reload pose is shown.

The selected-unit weapon status is descriptive UI only. No combat interval, ammunition consumption, targeting, or damage calculation is changed by the art integration.

## Exact prompts

### Four-profile generation

```text
Use case: stylized-concept
Asset type: game-ready 2x2 reload-pose infantry sprite atlas with four isolated figures
Input images: Images 1 and 2 define the four existing profile identities and painted cutout style; Images 3 and 4 define the replacement German profile identity with black tricorn, blue coat, red cuffs/facings, and matching detail. Preserve these broad visual identities without claiming regiment-specific reconstruction.
Primary request: Create exactly four full-body infantry figures, one per quadrant, all facing viewer-right and visibly reloading a flintlock musket. Each musket is lowered diagonally or near-horizontal across the torso; both hands actively work near the lock, cartridge, or ramrod area. The pose must read clearly as reload rather than shoulder carry or aiming.
Quadrants: top-left profile 0 Continental, navy-blue coat and cream facings with black cream-trim tricorn; top-right profile 1 British, red coat and cream facings with black cream-trim tricorn; bottom-left profile 2 German auxiliary, dark navy-blue coat with distinct red cuffs and red facings, cream clothing, BLACK CREAM-TRIM TRICORN, never a mitre; bottom-right profile 3 frontier/rifle figure, brown hunting shirt and brown broad-brim hat.
Composition: square 2x2 grid without drawn dividers; exactly one complete person and one complete musket centered within each quadrant; very wide transparent gutters between all figures and canvas edges; no alpha contact or overlap across quadrant boundaries; equal body height measured hat-to-boot; all four boot bottoms share their row foot line; full hats, boots, hands, ramrods, and muzzles visible.
Style/medium: match the semi-realistic painted transparent cutout sprites in the references; readable silhouette at tactical-game scale; coherent anatomy and two-hand weapon handling.
Transparency: genuine RGBA PNG with zero-alpha empty pixels. Empty pixels may preview black. Do not draw a checkerboard.
Avoid: firing or aiming down sights, shoulder-arms carry, smoke, flash, cropped weapon, cropped body, mitre, bearskin, helmet, duplicate people, extra limbs, extra weapons, intersecting figures, checkerboard, grid lines, floor, scenery, cast shadow, text, label, border, watermark, authenticity claim.
```

### Background extraction

```text
Use case: background-extraction
Asset type: game-ready four-figure 2x2 infantry reload sprite atlas
Input image: the supplied image is the exact edit target, containing four isolated reload figures over a baked gray checkerboard.
Primary request: Remove only the entire gray checkerboard and replace it with genuine zero-alpha transparency.
Constraints: preserve all four figures exactly in their current quadrants and pixel positions; preserve faces, hats, uniforms, colors, anatomy, hands working at each lock, complete muskets, boots, proportions, spacing, and edges; output RGBA PNG; every empty pixel must be transparent.
Avoid: changing, moving, resizing, redrawing, or cropping any figure or weapon; merging figures; adding shadows, floor, scenery, checkerboard, grid, text, border, watermark, or any new object.
```
