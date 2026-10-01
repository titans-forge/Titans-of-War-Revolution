# Diagonal infantry artwork — pass 32

Four original 1536 × 1024 PNG sheets add 40 action cutouts: Continental, British, German and militia, each with carry, fire, reload, guard and thrust in front-diagonal and rear-diagonal views. Left diagonal views mirror the corresponding right views. Existing side and front/rear artwork is retained.

Files are under `public/images/units/`, named `revolution-infantry-diagonal-{continental,british,german,militia}-v1.png`. Source SHA-256 hashes, frame bounds, ground anchors and foreground-island seeds are recorded in `src/battle/infantryDiagonalAtlas.js`. Exact generation prompts, references and original output locations are in `docs/INFANTRY_DIAGONAL_GENERATION.json`.

These sheets were created with the built-in OpenAI image-generation tool, not the Forge local imaging models. The tool did not provide a verifiable model version. The first Continental result was rejected because the thrust resembled an aiming pose. Its corrected successor and the three matching uniform variants were accepted. Generated originals remain intact at their recorded paths; project copies are also unmodified.

The current four profiles remain illustrative, shared identities. The German profile retains its existing black tricorn. This pass does not establish exact regiment-specific uniform or equipment authenticity. Ferguson still uses the shared brown rifle profile.

## Extraction and animation

Some complete soldiers have overlapping rectangular bounds without touching painted silhouettes. Runtime magenta keying followed by seeded, eight-connected foreground extraction keeps each entire soldier and excludes neighboring weapons or boots. Tests account for every keyed source pixel exactly once, preserve owned RGBA values and require clear padded edges. No raster repainting or destructive source cropping was performed.

Eight viewing sectors use a roughly four-degree hysteresis margin to avoid flickering at direction boundaries. All five poses in both diagonal views and the existing front/rear views must be available before enabling the new sectors for a profile. Incomplete sets fall back to the existing renderer.

Diagonal walking deforms the carry cutout using actual distance traveled; it is not an authored multi-frame walk cycle. The upper body remains stable while alternating feet move along the displayed diagonal. Mirrored origins and mesh scales preserve the ground anchor. Each figure retains at most two depth meshes; discarded meshes are removed from hit testing. Canvas retains static depth-facing carry artwork.

The metadata construction script and rejected experiments are retained in the Codex workspace `work/revolution-pass32/`. Geometry tests sample the full phase cycle, including mirrored placement and all diagonal volley directions.
