# Infantry uniform rig artwork

Source: `public/images/units/revolution-infantry-uniform-rig-v1.png`.
SHA-256: `f1fee032e69ab1d59c3f80e7291491b99329e36be50d1c269f5fd7911d3cfcdb`.
1448 x 1086 RGB PNG, approximately 1.8 MB. Generated with the built-in image tool. Original:
`[private provenance path omitted]`.

Six disconnected authored parts: British red/white torso, German blue/red torso with tricorn, brown hunting-shirt torso, tan breeches thigh, brown gaiter calf and brown shoe. Existing inspected Continental parts and the approved march atlas provided cutout, camera, uniform and material references. British and German profiles share the approved pale breeches and black gaiters; the brown-clad profile uses its own authored legs. These remain representative visual identities, not regiment-specific reconstructions. The existing profile 3 assignment is preserved, including its shared use for provincial, militia, rifle and British rifle formations; that historical simplification is not resolved by this pass.

Source PNG remains unchanged. Runtime chroma keying, measured frames and two-pixel padded textures produce transparency. All six complete subjects retain their muzzle tips, hands, fringes and joint overlaps. New torso hip anchors match the Continental hat-to-hip height; limb pivots register to the same skeletal geometry. Exact measurements live in `src/battle/infantryRigSprites.js`. Tests decode the real pixels, verify full source coverage, transparent gutters, opaque joint anchors and mirror registration.

Requested output size was 2048 x 1536; the tool returned 1448 x 1086. Metadata uses the actual returned dimensions. No CLI fallback, manual raster editing or local model runner was used.

Exact generation arguments:

```json
{
  "referenced_image_paths": [
    "[private provenance path omitted]",
    "[private provenance path omitted]"
  ],
  "prompt": "Use case: historical-scene. Production 2D skeletal-animation PARTS SHEET, exactly SIX disconnected clothed character cutouts in a 3-column by 2-row grid, landscape 2048x1536. Image 1 is the approved cutout/pose/material reference; image 2 supplies the other three uniforms. TOP ROW, three upper bodies: LEFT British red coat with white facings, white crossbelts, black tricorn; CENTER German dark blue coat with red cuffs/lapels, white crossbelts and black TRICORN (no mitre or tall hat); RIGHT brown fringed hunting-shirt soldier with brown brimmed hat, powder horn, shoulder bag and brown leather straps. Each upper body must match the pose and camera of image 1's torso: facing RIGHT in slightly elevated three-quarter side view, head, entire hat, arms and hands, entire carried shoulder musket including muzzle tip, backpack and full coat tails or shirt hem, ending at the pelvis. NO LEGS OR FEET attached below these upper bodies. Preserve lifelike cloth, skin, metal and leather detail. Natural restrained uniform colors. Same anatomical scale across the three torsos, generous empty margins, no crossing cell boundaries. BOTTOM ROW contains THREE separate brown-clad soldier LEG PARTS only: LEFT one straight vertical upper-leg segment hip-to-knee in tan cloth breeches with realistic folds and round joint overlap ends, no boot/calf; CENTER one straight vertical lower-leg segment knee-to-ankle in dark brown leather gaiter, no thigh and NO FOOT, rounded overlap ends all dark leather, no pale cuffs; RIGHT one isolated dark brown leather buckled shoe with toes facing RIGHT and level sole, short dark leather ankle overlap, no long calf. Leg parts may be larger than torso scale for detail. These are disconnected CLOTHED parts for game animation, no bare limbs. Actual transparent background if supported, otherwise pure uniform magenta #FF00FF background, no checkerboard, gradient, floor, shadows, text, labels, borders, extra parts, complete figures or duplicated objects. Six separate parts only."
}
```
