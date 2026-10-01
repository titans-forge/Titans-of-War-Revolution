# Pass 24 infantry march art review

## Result

Approved `revolution-infantry-march-a-v1.png` and `revolution-infantry-march-b-v1.png`: two 1254 x 1254 RGBA atlases covering profiles 0-3. Phase A is a wide planted stride. Phase B is a visibly distinct passing step: knees are closer, the near-side trailing leg bends, and its heel rises. This is a practical two-pose march alternation, not a full gait cycle and not a claim that the generator reliably preserved anatomical left/right limb identity.

All figures face right and retain their broad identities. The German profile uses a black tricorn, navy coat, and red cuffs/facings. Muskets and bodies are complete. Whole-image connected-component analysis found exactly four major subjects in each atlas. Phase A component rectangles are `(246,22)-(490,630)`, `(875,22)-(1118,630)`, `(247,636)-(501,1230)`, and `(878,637)-(1132,1230)`. Phase B rectangles are `(241,7)-(476,633)`, `(829,10)-(1065,633)`, `(243,638)-(481,1241)`, and `(832,634)-(1063,1242)`. These full-subject rectangles do not overlap; the closest phase-B right-column pair is adjacent across the y=633/634 split. Runtime extraction should copy each complete measured rectangle to its own padded canvas texture before filtering.

Metadata in `src/battle/infantryMarchSprites.js` records those whole-subject alpha bounds, disjoint extraction frames, hat-to-ground body heights, and grounded boot anchors. `marchSpritePlacement(profile, frameIndex, bodyHeight, facing)` returns `null` for invalid inputs. Source-atlas rectangles themselves should not be sampled directly with linear filtering where they meet the row split; the canvas extraction step supplies the transparent padding.

Two attempted phase-B edits were rejected because their limb silhouettes duplicated phase A. They remain outside the candidate in `[private provenance path omitted]` (local audit evidence outside the game). The approved result makes only the narrower passing-step claim above.

## Provenance and prompts

Built-in image generation was used for both atlas generations and background extraction. The phase-A prompt required four right-facing shoulder-arms figures in a wide stride, with profiles 0/1/2/3 in quadrant order, genuine alpha, complete vertical muskets, equal body height, and no overlap. Its extraction prompt changed only the baked checkerboard to zero-alpha transparency.

The canonical record below includes the complete accepted prompt texts so it remains self-contained after promotion.

### Exact accepted phase-A generation prompt

```text
Use case: stylized-concept
Asset type: game-ready 2x2 infantry march atlas, stride phase A
Input images: Image 1 defines the four profile identities and upright shoulder-arms carry; Image 2 reinforces the four current uniform identities and painted cutout style; Image 3 defines the replacement German profile with black tricorn, navy coat, red cuffs and facings.
Primary request: Create exactly four full-body infantry figures, one centered in each quadrant, marching toward viewer-right in the SAME stride phase: LEFT LEG visibly forward and RIGHT LEG visibly back. Each carries one complete flintlock musket vertically at shoulder arms. This is phase A of a paired stride, not a standing pose.
Quadrants: top-left profile 0 Continental navy coat/cream facings/black cream-trim tricorn; top-right profile 1 British red coat/cream facings/black cream-trim tricorn; bottom-left profile 2 German auxiliary dark navy coat/distinct red cuffs and facings/cream clothing/BLACK CREAM-TRIM TRICORN, never a mitre; bottom-right profile 3 brown hunting shirt and brown broad-brim hat.
Pose and registration: all face right; identical upright torso orientation; left thigh and boot clearly lead toward viewer-right, right boot trails; whole vertical musket including muzzle and butt visible; equal hat-to-boot body height; same row foot line; grounded natural anatomy.
Composition: square 2x2 without drawn dividers; exactly one person and musket per quadrant; wide empty gutters around figures, between rows and columns, and above every muzzle; no alpha contact across quadrant boundaries.
Transparency: genuine RGBA PNG with zero-alpha empty pixels. Do not draw checkerboard.
Avoid: right-leg-forward pose, mirrored/reversed facing, aiming, firing, reload, cropped muzzle/boots, mitre, extra people, extra limbs, extra weapons, overlapping figures, floor, shadow, scenery, checkerboard, grid, text, border, watermark, authenticity claim.
```

### Exact accepted phase-A extraction prompt

```text
Use case: background-extraction
Asset type: game-ready four-profile march phase-A atlas
Input image: exact edit target, four isolated marching figures on baked gray checkerboard.
Primary request: Remove only the checkerboard and replace it with genuine zero-alpha transparency.
Constraints: preserve every figure, vertical musket, uniform, hat, face, pack, leg pose, boot, pixel position, scale, spacing, color, and edge exactly; output RGBA PNG; complete muzzles and boots.
Avoid: moving, redrawing, resizing, cropping, or changing any subject; checkerboard, floor, shadow, scenery, text, border, watermark, added object.
```

### Exact accepted phase-B generation prompt

```text
Use case: stylized-concept
Asset type: fresh game-ready 2x2 infantry march atlas, stride phase B
Input images: Images 1-3 define the four profile identities, upright shoulder-arms equipment, and style. Image 4 is phase A and is supplied only to avoid repeating its wide planted stride.
Primary request: Generate exactly four right-facing marching figures in a clearly different PASSING-STEP phase. For every figure, the NEAR-SIDE leg (the leg visually in front of the other leg) trails toward viewer-left with knee bent and HEEL RAISED off the ground; the FAR-SIDE leg passes forward beneath the torso toward viewer-right and is partly occluded at the thighs. Knees are closer together than phase A. This must visibly change limb bend and overlap from Image 4.
Quadrants: top-left profile 0 navy Continental, cream facings, black tricorn; top-right profile 1 red British, cream facings, black tricorn; bottom-left profile 2 German auxiliary, navy coat, distinct red cuffs/facings, cream clothing, BLACK TRICORN, no mitre; bottom-right profile 3 brown hunting shirt and broad-brim brown hat.
Identity and equipment: match the same faces, uniform colors, hats, packs, straps, right-facing torso orientation, and one complete upright vertical shoulder-arms flintlock per figure. Preserve weapon on the same body side; do not mirror phase A.
Composition: square 2x2, one full body per quadrant, wide separation, equal hat-to-ground body height, row ground lines, complete muzzle and boots, no contact across quadrants.
Transparency: genuine RGBA PNG with zero-alpha empty pixels; do not draw checkerboard.
Avoid: phase-A wide straight-legged stance, both heels flat, unchanged limb occlusion, whole-figure mirror, left-facing figure, fused/crossed/extra legs, aiming, firing, reload, cropped weapon/body, mitre, duplicates, overlap, floor, shadow, scenery, checkerboard, grid, text, border, watermark.
```

The accepted phase-B generation prompt required the near-side leg to trail with bent knee and raised heel, the far-side leg to pass beneath the torso, closer knees than phase A, unchanged right-facing identity/equipment, full vertical muskets, and four separated quadrants. Its exact extraction prompt was:

```text
Use case: background-extraction
Asset type: game-ready four-profile march passing-step phase-B atlas
Input image: exact edit target, four isolated marching figures over baked gray checkerboard.
Primary request: Remove only the checkerboard and replace it with genuine zero-alpha transparency.
Constraints: preserve every figure exactly, including the near-side trailing bent leg with raised heel, far-side planted leg, vertical musket, full muzzle, boots, uniform, hat, face, pack, pixel position, size, spacing, colors, and edges; output RGBA PNG.
Avoid: changing gait or limb occlusion, moving, redrawing, resizing, cropping, checkerboard, floor, shadow, scenery, text, border, watermark, added object.
```

These are representative game profiles, not regiment-specific uniform reconstructions.
