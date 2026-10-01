# Pass 22 German infantry sprite review

## Result

Two standalone sprites are integrated and approved after close-up browser review in Trenton:

- `public/images/units/german-tricorn-carry-v2.png`
- `public/images/units/german-tricorn-fire-v2.png`

Both are 1254 × 1254 RGBA whole textures. They show the same representative German auxiliary identity: black tricorn, navy-blue coat, red cuffs and facings, cream clothing, white crossbelts, black gaiters, and similar equipment. The existing versioned sheets remain unchanged.

The original three-call pass produced two RGB firing attempts and then recovered one genuine-alpha firing cutout. Root review confirmed its full muzzle is visibly intact and its 14-pixel meaningful right gutter is adequate for a standalone whole texture, which has no adjacent atlas frame or source crop. The earlier 15% gutter rule was an inappropriate atlas-style constraint and is withdrawn.

Two additional authorized calls produced and extracted the matching carry pose. No reload pose was generated or claimed.

## Measured evidence

The firing image occupies x=129–1239 and y=58–1188 at alpha >20. Its body height is 1131 pixels from tricorn top through boot line, with boot anchor (477, 1188).

The carry image occupies x=402–854 and y=12–1236 at alpha >20; its vertical musket creates the alpha top. Its body begins at the measured tricorn top y=174 and ends at boot line y=1236, a body height of 1063 pixels, with boot anchor (635, 1236). Integrators should scale carry by 1131/1063 and use each normalized boot anchor. This matches body size without shrinking the figure because of the carry musket.

Runtime registration uses an eight-pixel transparent pad around the measured meaningful bounds: carry frame (394, 4, 469, 1241), fire frame (121, 50, 1127, 1147). Original PNG pixels are unchanged. Both poses use bodyHeight = figure.height × 0.9, excluding the upright musket from scale, with mirrored boot anchors to prevent foot jumps. Construction also starts with the new carry texture, avoiding a legacy-frame flash.

Runtime metadata and SHA-256 values are in `src/battle/germanTricornSprites.js`. The textures remain discrete posed states, not a full gait, firing, or reload cycle. They are representative art, not regiment-specific reconstructions.

## Review boundary

- Actual RGBA transparency, verified from the file channel and decoded alpha.
- Black tricorn, navy-blue coat, red cuffs, and no universal grenadier headgear.
- One coherent full body and one complete musket.
- Complete subject and weapon inside each standalone source texture, with no adjacent atlas frame; padded Phaser frames retain the complete subject and weapon.
- One isolated connected subject with no checkerboard pixels.
- Body height measured from hat top to boot line, plus a boot-bottom anchor.
- Carry and firing are approved separately; reload remains absent.
- Representative game art only, with no regiment-specific authenticity claim.

## Exact prompts

### Attempt 1: firing generation

```text
Use case: stylized-concept
Asset type: single game-ready 2D tactical infantry firing sprite
Input images: Image 1 is a style and uniform-palette reference, especially its lower-left blue-coat German auxiliary figure; Image 2 is a style and aiming-pose reference only. Do not copy the mitre headgear from either reference.
Primary request: Create one full-body representative German auxiliary infantryman aiming a flintlock musket toward viewer-right, ready to fire.
Subject: dark navy-blue coat, red cuffs and red lapel accents, cream waistcoat and breeches, white crossbelts, black gaiters, small pack, and a BLACK TRICORN hat with narrow cream trim. Generic auxiliary identity, not a grenadier or regiment reconstruction.
Style/medium: match the supplied semi-realistic painted cutout sprites, clean realistic anatomy, coherent two-handed shoulder grip.
Composition/framing: exactly one soldier centered on a large square transparent canvas; full body and entire musket visible; at least 15 percent empty transparent gutter on every edge; boots share a clear horizontal foot line; musket barrel does not approach the canvas edge; consistent right-facing side view.
Constraints: genuine RGBA transparent background; exactly one person, two arms, two hands, two legs, one musket; no mitre, bearskin, helmet, smoke, muzzle flash, bayonet crop, shadow, floor, scenery, checkerboard, grid, label, text, border, or watermark; no historical-authenticity claim.
```

### Attempt 2: firing generation

```text
Use case: stylized-concept
Asset type: one isolated transparent-background game sprite, not a sprite sheet
Input images: style references only for semi-realistic painted cutout rendering and the lower-left blue-coat/red-cuff palette. Generate a new subject; do not edit either image.
Primary request: One full-body generic German auxiliary infantryman aiming one flintlock musket toward viewer-right. He wears a black tricorn with cream edge trim, dark navy-blue coat, red cuffs and lapel accents, cream waistcoat/breeches, white crossbelts, black gaiters, and a small pack.
Composition: one person centered; whole body, boots, hands, hat, pack, and entire musket visible; generous empty gutter at least 20 percent on all four sides; boot bottoms on one level; natural proportions and coherent two-hand shoulder grip.
Transparency requirement: actual transparent alpha outside the soldier. Do not paint or depict a checkerboard. The empty region should contain zero-alpha pixels and may appear solid black in the tool preview. Output RGBA PNG.
Avoid: mitre, bearskin, helmet, grenadier headgear, second person, extra limbs, extra weapon, cropped barrel, smoke, flash, shadow, floor, scenery, texture, checkerboard, grid, text, border, watermark, authenticity claim.
```

### Attempt 3: background extraction

```text
Use case: background-extraction
Asset type: single game-ready infantry sprite cutout
Input image: edit target is the supplied single German tricorn firing figure on a baked gray checkerboard.
Primary request: Remove only the entire gray checkerboard background and replace it with genuine transparent alpha.
Constraints: preserve the soldier, black tricorn, face, clothing, red cuffs, anatomy, hands, musket, pack, boots, proportions, position, scale, colors, and edges exactly; output RGBA PNG; no checkerboard pixels, floor, scenery, shadow, text, border, watermark, crop, added object, or changed subject. The empty area must be zero-alpha transparent pixels.
```

### Carry generation

```text
Use case: stylized-concept
Asset type: single game-ready transparent 2D infantry carry sprite
Input images: Image 1 is the exact character identity, uniform, palette, face, body-scale, black-tricorn, and rendering-style reference to match. Image 2 is a shoulder-arms pose reference only; do not copy its tall mitre.
Primary request: Create the same representative German auxiliary infantryman from Image 1 in a calm full-body shoulder-arms carry pose, standing/mid-step toward viewer-right with one flintlock musket held vertically against the shoulder.
Identity invariants: same black tricorn with cream trim; same dark navy-blue coat, red cuffs and lapel accents, cream waistcoat and breeches, white crossbelts, black gaiters, pack, face, anatomy, equipment, lighting, detail, and painted cutout style as Image 1. Generic auxiliary, not grenadier-specific or a regiment reconstruction.
Composition: exactly one full-body soldier on a square canvas; one complete vertical musket; boots on a clear common foot line; enough transparent space above the muzzle and around the whole person; body vertical height from tricorn top to boot line should match Image 1 even though the vertical musket extends higher; center the BODY around x=477/1254 and place boot line near y=1188/1254 to match Image 1 registration.
Transparency requirement: genuine zero-alpha transparent background, RGBA PNG. Empty pixels may preview black. Do not draw checkerboard.
Avoid: mitre, bearskin, helmet, second person, aiming pose, firing pose, reload pose, extra limbs, extra weapon, cropped muzzle or boots, smoke, flash, shadow, floor, scenery, checkerboard, grid, text, border, watermark, authenticity claim.
```

### Carry background extraction

```text
Use case: background-extraction
Asset type: single game-ready German tricorn carry sprite cutout
Input image: edit target is the supplied one-soldier shoulder-arms image on a baked gray checkerboard.
Primary request: Remove only the entire checkerboard and replace it with genuine transparent alpha.
Constraints: preserve the soldier, black tricorn, face, navy coat, red cuffs and facings, cream clothing, anatomy, hand, vertical musket, pack, boots, proportions, pixel position, scale, colors, and edges exactly; keep the complete muzzle and both boots; output RGBA PNG with zero-alpha empty pixels; no checkerboard, floor, scenery, shadow, text, border, watermark, crop, added object, or changed subject.
```

## Record correction and remaining work

Both original v1 German carry and firing sprites wear mitres; the earlier pass21 statement that only firing changed to that headgear was incorrect. This pass replaces both with a matching representative tricorn pair. Infantry elsewhere retains existing identity profiles.

The built-in imagegen tool generated and extracted both approved sprites. Rejected RGB/checkerboard intermediates remain outside the game under `work/revolution-pass22/evidence/pass22-sprites/`. Exact prompts above record the unsuccessful constraints as well as the accepted extraction attempts.

Remaining: dedicated reload, marching, and close-combat sprite cycles; broader regiment-specific historical research before authenticity claims. The firing pose in stationary melee has a small procedural thrust, not a distinct bayonet-combat drawing.
