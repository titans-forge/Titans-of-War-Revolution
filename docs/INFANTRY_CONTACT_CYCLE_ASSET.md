# Infantry contact cycle — pass 25 artwork

Generated using the built-in image-generation tool in four sequential edit calls. No CLI/API fallback was used.

Final asset: `public/images/units/revolution-infantry-contact-thrust-v1.png`, 1536×1024 RGB PNG. SHA-256: `ab1a715cceff5c8075785f2922a77b92f57cac1e75b7ade9f2fd74c6e5498d09`.

The first three results painted a checkerboard rather than providing a transparent alpha channel. They are rejected for direct rendering and retained in local pass evidence. A repack widened the canvas and separated the figures; an unwanted bayonet on the brown rifle profile was removed. The fourth call produced an explicitly magenta-backed atlas. The game removes that key color into padded runtime textures, including correction of antialiased edge mixtures. The source PNG is not altered on disk and is intentionally not a standalone transparent cutout.

Acceptance: four complete distinct thrust silhouettes, whole weapons, right-facing identities, three tricorn profiles and one hunting-shirt profile, rifle without bayonet, no frame overlap. The test decodes the actual RGB PNG, applies the same runtime keyer, checks complete empty gutters and subject pixel counts, then checks scale and mirrored ground anchors. The original RGBA guard art remains in use. Thrust art is representative game illustration, not regiment-specific reconstruction.

The contact cycle has guard, preparation, thrust and recovery timing built from TWO authored drawings and small procedural translations/rotations. It is not a four-drawing articulated cycle. It uses simulation time, does not create damage events, and suspends offensive motion for fallback and retreat. Visible edge ranks are chosen from actual terrain-clear contact directions, including flanks.

Exact prompt sequence follows. Local rejected-image evidence is retained in `[private provenance path omitted]`.

## 01-thrust

```text
Use case: precise-object-edit
Asset type: transparent historical strategy-game infantry thrust sprite atlas, four profiles
Input image: edit target — the existing four-profile guarded close-combat atlas.
Primary request: draw the NEXT distinct pose in a bayonet/musket melee action. Keep the same four people, clothing, headgear, broad colors, equipment and right-facing three-quarter view. Each figure pushes the musket forward at waist/chest height with both arms extending, front knee bending slightly and torso leaning forward. This is a forceful close-combat reach, NOT aiming down sights or firing. The rear foot stays planted. Rifleman keeps his original rifle without an added bayonet.
Composition: same 2x2 order: Continental blue/buff, British red, German blue/red with black tricorn, brown hunting-shirt rifleman. Make each COMPLETE figure and COMPLETE weapon small enough to fit inside its own quadrant with at least 35 pixels of transparent margin on every side. Shrink subjects uniformly if necessary to keep all bayonet tips safely inside their cells; no weapon enters another cell. Equal hat-to-boot height among the four, whole boots visible, grounded stance.
Style: preserve existing realistic painted game sprite detail, natural wool/linen/leather and metal, restrained lighting.
Output: genuine RGBA PNG with zero-alpha empty pixels. Empty backdrop, no floor, no shadow, no checkerboard, no text, no border, no additional people, no extra limbs or weapons, no blood. Do not simply copy the guard pose: elbows must visibly extend and the musket must reach forward.
```

## 02-repack

```text
Use case: background-extraction
Asset type: game-ready transparent four-profile infantry thrust sprite atlas
Edit target: the four right-facing soldiers in the input image.
Remove the entire checkerboard and replace it with genuine zero-alpha transparency (RGBA PNG). Keep the four complete figures, their exact thrust poses, people, uniforms, equipment, weapon tips and colors. Repack the four cutouts into a LANDSCAPE 1536x1024 canvas, two columns by two rows, leaving at least 40 transparent pixels around each full figure AND its complete weapon. Uniformly shrink each cutout enough that no subject or bayonet crosses the middle of the canvas or the center row. Preserve the existing quadrant order. Whole bodies and whole weapons must be present, with visible empty transparent gutters. No drawn background, no floor, no checkerboard, no text, no border or additional objects.
```

## 03-rifle-correction

```text
Use case: background-extraction
Edit target: this exact 1536x1024 four-soldier atlas.
Make the background TRULY TRANSPARENT: erase the checkerboard into zero-alpha pixels, output actual RGBA PNG. This is an extraction, not a new illustration. Keep every soldier at exactly the same pixel location and size, preserve all existing poses and colors. One correction: the bottom-right brown hunting-shirt rifleman must have only his rifle barrel, with NO bayonet blade or spike extending past its muzzle. The other three muskets keep their bayonets. Do not add, rearrange, repaint, resize or crop any figure or any other equipment. No checkerboard in the final pixels. No backdrop, floor, shadow, border or text.
```

## 04-chroma

```text
Use case: precise-object-edit
Edit target: the exact four-soldier atlas supplied.
Change ONLY the checkerboard backdrop to one perfectly flat, uniform chroma-key magenta color, RGB(255,0,255), hex #FF00FF. This is an opaque RGB sprite atlas for a game that removes magenta during rendering. Do NOT simulate transparency. No checkerboard. No gradient. No lighting on the backdrop. Preserve all four soldiers, exact pixel positions, scale, thrust poses, clothes, weapon details and complete weapon tips. Keep the bottom-right rifle without a bayonet as shown. The entire empty backdrop, including spaces between arms, legs, weapon and body, must be the SAME solid pure magenta. No magenta lighting or reflected color on soldiers.
```
