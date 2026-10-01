# Infantry front and rear artwork

Generated with the built-in OpenAI image-generation tool, using the approved Continental carry image as the initial uniform/material reference. No Forge local model or CLI fallback was used. Exact prompts, reference paths and returned source paths are preserved in `INFANTRY_DIRECTIONAL_GENERATION.json`.

## Accepted sources

Four 1536 by 1024 RGB PNGs in `public/images/units/`, named `revolution-infantry-directions-{continental,british,german,militia}-v1.png`. SHA-256 values and measured frame bounds are in `src/battle/infantryDirectionalAtlas.js`.

Each source contains two rows and seven columns. Only the first five columns are accepted: carry, fire/ready, reload, guarded contact and extended contact. Top row faces toward the camera; bottom row faces away. Forty runtime cutouts cover the four existing illustrative identities. German line infantry retains the black tricorn. This does not claim regiment-specific historical reconstruction or change Ferguson's existing shared militia profile.

The final two columns are unused. Repeated image edits did not reliably reverse the leading foot, so generated walking drawings were rejected rather than enabled. The accepted Continental source is the first corrected sheet: its front contact pose holds the weapon lower than the initial aiming-like attempt. A further stride-only edit was rejected. Source PNGs remain intact; runtime extraction keys magenta, pads each accepted cutout and excludes the unaccepted stride columns. Measured crop boundaries preserve the militia guard's projecting bayonet without including it in the adjacent reload frame.

## Runtime movement

Front and rear marching use a textured mesh of the accepted carry image. Two opposing, distance-driven foot cycles project stance travel and passing-foot lift into the screen's depth axis. Leg deformation begins below the hip; head, musket, grip and upper body are fixed. It is continuous two-dimensional deformation, not a skeletal 3D walk or separately authored knee articulation. Canvas rendering retains the fixed carry drawing for these views. Side-facing soldiers retain the existing jointed leg rig and cloth motion.

Scale uses 443 source pixels per 36 game units, with shared measured ground anchors at y505 and y999. A heading dead band retains a front/rear view until the vertical component falls below .70; a new depth view requires .82. This provides four view sectors including the mirrored side artwork, not eight authored directions.

A profile must have both views and all five accepted action textures before the renderer uses it. Missing assets retain the existing side-view path. New meshes are created lazily, preserve figure-layer order and participate in visible-art hit testing. Animation follows simulation travel/time and freezes when paused. Volley smoke for front/rear views samples the occupied firing edge. Damage, ammunition, pathfinding, formations and scenario balance are unchanged.
