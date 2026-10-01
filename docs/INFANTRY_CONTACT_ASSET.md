# Infantry contact atlas acceptance

One guarded pose is safe for integration. No thrust pose is accepted.

The accepted built-in image-generation asset is `public/images/units/revolution-infantry-contact-guard-v1.png`, a 1254×1254 RGBA PNG with SHA-256 `6c8ec6076c38e93585814ee90fe106710140dcf75be95e659cab7db121182e9a`. Whole-image alpha analysis at threshold 32 found exactly four large connected subjects:

| Profile | Whole subject extent, inclusive | Pixels | Separation |
| --- | --- | ---: | --- |
| Continental | x 43–642, y 9–599 | 97,458 | 10 transparent x pixels before British |
| British | x 653–1248, y 10–598 | 97,528 | 5 transparent pixels before canvas edge |
| German auxiliary | x 52–644, y 628–1222 | 98,562 | 22 transparent x pixels before rifleman |
| Brown rifle | x 667–1218, y 633–1222 | 99,370 | 35 transparent pixels before canvas edge |

The original equal 627-pixel cells clipped metadata around both left-profile bayonets. Asset pixels were not clipped. Metadata now uses four disjoint variable-width frames divided only through verified transparent gaps: x=647 above, x=655 below, and y=614 between rows. Every connected subject, including its complete weapon, falls inside exactly one frame with no neighboring subject pixels.

Generated with the built-in image tool. Exact accepted prompt:

```text
Use case: historical-scene
Asset type: transparent 2x2 game sprite atlas for an American Revolution battlefield
Primary request: create exactly four isolated full-body infantry figures in a clear guarded close-combat stance, musket held horizontally at waist/chest height, body braced and alert, all facing screen-right. Top-left representative Continental soldier in dark navy coat with buff facings and white crossbelts; top-right representative British regular in red coat with white facings and white crossbelts; bottom-left representative German auxiliary in dark blue coat with red facings, white crossbelts, and a black tricorne with pale trim; bottom-right representative brown-clad rifleman/frontier profile in brown hunting shirt and round brimmed hat.
Composition/framing: exact 2x2 grid, one complete disjoint figure centered in each quadrant, consistent apparent body height and boot line, generous transparent padding around every figure, no overlap between quadrants. Every body, hat, both boots, hands, musket stock, barrel, and muzzle must be fully visible and uncut. Line infantry profiles 0, 1, and 2 may have a coherent complete socket bayonet attached; brown rifle profile has no bayonet.
Style/medium: detailed semi-realistic cutout game art matching existing photographic-painterly Revolution infantry sprite sheets, consistent lighting and camera angle.
Scene/backdrop: genuinely transparent RGBA background, no ground, shadow, scenery, smoke, text, labels, grid lines, or borders.
Constraints: exactly four people and four complete weapons; anatomically coherent hands and limbs; weapons straight and plausible; all figures face screen-right; guarded posture must read as close combat without showing impact, injury, firing, muzzle flash, or blood.
Avoid: cropped weapons, cropped hats or boots, merged silhouettes, extra people, duplicate limbs, extra weapons, modern equipment, logos, watermark, text, checkerboard background, black background.
```

Two generated follow-ups remain rejected outside the candidate under `[private provenance path omitted]`. Both are opaque RGB images with baked checkerboards. One is the otherwise distinct reach/thrust pose; it is unsafe for scene integration. No raster editing or alpha fabrication was performed.
