# Mounted movement artwork

Installed source: `public/images/units/revolution-cavalry-trot-v1.png`.

Built-in image-generation tool, reference-guided generation. Original result:

`[private provenance path omitted]`

SHA-256: `527080673a645d29e6e3ce37833f0104721bd2dbe767b56a9c38d73aef8d62c3`.

1774 × 887 RGB PNG, four columns and two rows. The requested larger dimensions were not returned. This source has a magenta background, not alpha transparency. The renderer removes it in separately padded canvas textures using the existing magenta edge-recovery function. Source pixels remain unmodified. Actual decoded image tests check every frame boundary and every visible subject pixel.

The reference was the existing `revolution-cavalry-v1.png`: Continental off-white/blue mounted identity above, British Legion green below. These retain the game's illustrative uniform identities; the generated drawings are not museum documentation of a specific individual.

Four distinct movement drawings per side show extended and lifted forelegs, with subtle near/far changes. They improve the previous single moving pose. The hindquarters remain similar between drawings: this is a limited illustrated movement cycle, not a fully anatomically articulated equine trot. The filename describes the intended action, not a claim of motion-capture accuracy. Do not advertise this as a complete locomotion system.

Each figure has a measured full-subject frame, four source pixels of clearance, two additional runtime pixels, a saddle-centered ground anchor and normalized height. Playback uses simulated travel distance and per-rider phase offsets. No added whole-horse lifting or rotation. Halt, blocked contact and guarded fallback restore the original standing pose; missing new textures also fall back to that artwork. Routed movement still animates. Stationary sword fighting and mounted backward steps remain future art work.

Exact final prompt:

```text
Use case: historical-scene. Asset type: consistent game animation sprite sheet. Reference image establishes the exact two rider identities and horse colors; create a NEW 4 columns by 2 rows sheet, eight full horse-and-rider cutouts, of a restrained working TROT, all facing RIGHT in the same slightly elevated side view. Upper row: SAME off-white coat blue facings Continental light dragoon on bay horse. Lower row: SAME green coat black facings British Legion dragoon on chestnut horse. All black crested helmets, buff breeches, black riding boots, saddle and reins, one saber held upright. Realistic anatomy, leather, cloth, hair. Each column is a genuinely different consecutive quarter of a trot gait: column1 near foreleg extended forward and near hind back, column2 legs gathering under barrel with bent lifted near fore knee, column3 OPPOSITE diagonal pair with near foreleg back and near hind forward, column4 opposite passing pose with far fore knee lifted. Do not duplicate poses, and do not move rider torso wildly. Two diagonal beat trot, four legs only, no rearing, no gallop, no extreme acrobatics. All eight have identical horse body size, saddle center aligned within each cell and same head height. Keep rider/helmet/saber fully in each cell with generous gutters. Landscape sheet around 3072 by 1536. Transparent alpha if supported, otherwise FLAT pure magenta #FF00FF background without gradients, ground shadows, floor, text, grids, checkerboards or labels. Strong neutral realistic detail matching reference, maintain broad color identities, never add modern tack.
```

Reference image role: uniform/horse identity and rendering style. The source reference was inspected before generation. No local model or fallback API runner was used.
