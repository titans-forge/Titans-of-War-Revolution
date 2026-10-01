# Mounted combat and artillery movement artwork

Generated using the built-in image tool, with inspected existing cavalry and artillery artwork as references. Source PNGs remain unchanged; ordinary runtime keying and padded texture extraction provide transparency. No manual raster edits or CLI fallback. Exact frames and anchors are in `src/battle/supportActionSprites.js`.

The cavalry sheet has two poses for each existing mounted identity, with common horse anchors and anatomical scale. The artillery sheet has two connected gun-and-three-crew working postures, anchored to the existing 64-pixel gun. The first three separate crew images are replaced while hauling; any fourth/fifth crew remain present. Depleted crews, routing and guarded backward fallback retain individual crew and the existing gun.

These are illustrative animations. The gun sheet does not supply a complete anatomically alternating walk cycle: one pushing man repeats his leading leg, and wheel rotation is not continuous. It improves the visible connection between hands and carriage, but does not depict limbers, horse teams or a full drill. Cavalry guard/cut poses do not produce gameplay hits.

## Mounted guard and cut

Source: `public/images/units/revolution-cavalry-contact-v1.png` (1536 x 1024 RGB PNG). SHA-256: `29795dde7fff920fe87dcb07e637f7db861337e8518898ea537e8fa7dbee7ffa`.

Original: `[private provenance path omitted]`.

Exact generation arguments:

```json
{
  "referenced_image_paths": [
    "[private provenance path omitted]"
  ],
  "prompt": "Use case: historical-scene. Production 2D mounted close-combat sprite sheet, exactly FOUR complete horse-and-rider cutouts, 2x2 grid, landscape 1536x1024. Reference supplies the two existing identities, horse colors, tack, helmets and camera. TOP ROW Continental cream-coated cavalry on bay horse with black mane, BOTTOM ROW green-coated British Legion cavalry on chestnut horse. Both columns show SAME horse/rider identity per row. LEFT COLUMN: braced standing horse all four hooves grounded, rider alert, sword raised near shoulder in a defensive guard, left hand holds reins. RIGHT COLUMN: same horse standing in same position with all four hooves grounded, rider leans slightly forward, right arm and saber extending FORWARD to the RIGHT in a controlled cut at a nearby mounted opponent; left hand still grips reins. Clearly different guard and extended-cut silhouettes. Horses never rear or leap. Same horse and helmet-to-ground scale in all four cells, same camera, same rider face and same saddlery. Entire sword blade and tip, tail, four hooves and helmet plume inside each cell with at least 25px clear margins. Facing RIGHT, slightly elevated side three-quarter view matching reference. Lifelike worn wool, polished saber, leather, realistic horse anatomy. No opponent, blood, smoke, ground, shadows, text or borders. Actual transparent background if supported, otherwise solid uniform pure magenta #FF00FF with no gradient or checkerboard. This is animation artwork; guard and cut must share the same horse position and anatomical scale."
}
```

## Artillery hand-hauling

Source: `public/images/units/revolution-artillery-haul-v1.png` (1536 x 1024 RGB PNG). SHA-256: `a43147e468657ec54f137a9fa097a131b3df6fb08f091bc612f59f8dde6ec457`.

Original: `[private provenance path omitted]`.

Exact generation arguments:

```json
{
  "referenced_image_paths": [
    "[private provenance path omitted]"
  ],
  "prompt": "Use case: historical-scene. Production 2D game sprite sheet: TWO complete Revolutionary War field-gun hand-hauling groups, stacked vertically in two equal cells. Landscape 1536x1024. Reference supplies exact field gun bronze barrel, wooden carriage, iron-shod wooden wheels and Continental blue/red artillery crew uniform. Each cell contains SAME gun and THREE crewmen actively manhandling it to the RIGHT over a short battlefield distance, gun muzzle points RIGHT. TWO men to LEFT/rear grip and push the carriage trail or crossbar, leaning forward with hands visibly contacting solid wood; ONE man at far wheel steadies/pushes its rim with both hands. No one stands in front of the muzzle. Clear mechanically credible connection between crew hands and gun, enough room for feet, no intersecting people. TOP CELL first step: visible near leg of the two pushing men ahead to right, far leg behind; BOTTOM CELL opposite step with their near legs back left and far legs forward right. Gun itself is identical size/angle/location within both cells, same wheel centers, same men with different bent knees and slight torso lean. Lifelike materials, readable wheel spokes, correct worn 18th-century clothing, black tricorns and gaiters. Slightly elevated three-quarter side view matching reference. Full barrel, trail, wheels and every crew head/hand/foot entirely inside each cell with wide transparent gutters. This is a mobile hand-hauling gun, no men carrying rammers, no loaded firing stance, no discharge or smoke, no horses or modern equipment, no ground plane or cast shadows. Actual transparent background if supported, otherwise solid pure magenta #FF00FF with no checkerboard, gradients, text, labels or borders."
}
```
