# Infantry art pass

Built-in image generation produced two integrated RGBA PNG atlases in public/images/units. No CLI/API fallback was used. Original generated outputs remain in the Codex generated_images directory. The renderer defines measured subframes without modifying the PNGs.

Carry source: exec-c63479a5-ad04-451d-8101-f73698c4d89e.png, 1245x1263. Firing source: exec-8a7d26e6-97af-4ace-9cfb-de71f4c6c6f0.png, 1086x1448; only the third column is used. Two edit attempts painted a checkerboard into opaque images and were rejected. The first atlas's first two columns incorrectly show aiming while walking and are unused.

Generic Continental, British, Hessian and militia infantry silhouettes replace the geometric infantry. Horsemen, artillery, terrain and standards remain unchanged. Carry poses receive small phase-offset movement sway, flip with travel facing, and switch briefly to firing poses on a volley. Casualty-driven visible figure counts remain unchanged. These are not full multi-frame walking or reloading animations.

The uniforms are illustrative archetypes, not authenticated individual regimental reconstructions. Hessian firing pose is withheld because its facings do not match the carry image; small details, mirrored equipment and exact headgear need specialist review before claiming historical precision. Alpha presence, frame bounds, production build, mechanics regressions and browser rendering are acceptance checks.

Next priorities: matching artillery/cavalry artwork; flags with historically verified designs; consistent multi-pose uniforms and walking/reloading cycles; map-specific objectives and human balance testing.
