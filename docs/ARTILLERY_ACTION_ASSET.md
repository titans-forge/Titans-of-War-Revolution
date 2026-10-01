# Artillery action artwork

Project source: `public/images/units/revolution-artillery-actions-v1.png`.

Generated with the built-in image-generation tool using the existing `public/images/units/revolution-artillery-v1.png` as an inspected style/uniform reference. Original result:

`[private provenance path omitted]`

SHA-256: `e35319d8282b6bd2f7d87a4ca4d4aeeadb6e36d4a08180a6202c7c805a54deba`.

1536 × 1024 RGB PNG with magenta background, not an alpha PNG. Source remains unchanged. Runtime keying, six-pixel source gutters and two-pixel isolated texture padding remove the background and protect edges. Four measured complete subjects: rammer prepared, rammer leaning forward, shot carrier, gun captain reaching with linstock. The two rammer poses use the same scale, so leaning does not enlarge the man. Tool endpoints are registered to the muzzle or breech, with mirrored coordinates for left-facing batteries.

The [American Revolution Institute's reproduction artillery project](https://www.americanrevolutioninstitute.org/new-education-project-takes-aim-at-revolutionary-war-artillery/) describes the sponge, rammer and linstock roles using eighteenth-century illustrations and surviving examples. This informed the visual roles. These generated figures remain illustrative; they are not a verified reconstruction of a specific regiment or a full historical drill. The existing 3.2-second gameplay reload is compressed. One padded-tool working drawing represents both sponging and ramming; tool reversal, vent servicing, powder handling, limbers and draft horses are not yet portrayed.

Exact generation prompt:

```text
Use case: historical-scene. Production sprite sheet of exactly FOUR isolated eighteenth-century Continental artillery crewmen, 2x2 landscape layout. Reference image is ONLY for crew identity, uniforms and realistic rendering style; do not include its cannon. Top left and top right must be the SAME navy/red-coated man with black cocked hat, cream breeches, black gaiters. Top left: preparing to ram, upright with knees slightly bent, holding a LONG WOODEN RAMMER HORIZONTALLY at waist height with both hands, shaft extending to the RIGHT, end fully visible. Top right: distinct working pose of SAME man leaning his torso forward to the RIGHT, elbows extending, driving the horizontal rammer to the RIGHT at waist level. The padded tool head remains at right end, not angled up. Bottom left: shirtsleeved navy-waistcoated ammunition carrier, black cocked hat, holding ONE iron round shot in outstretched hands at waist height to the RIGHT, legs braced, no rammer. Bottom right: navy/red-coated gun captain, black cocked hat, leaning slightly and reaching with ONE linstock held in both hands to the RIGHT with its burning slow-match end angled slightly down near waist height, entirely contained. All face RIGHT in the reference's slightly elevated three-quarter side view. Keep full bodies and complete tool tips safely inside their separate cells with at least 25 pixels of clear margin, no overlaps. Equal anatomical human scale across all four, neutral light, lifelike worn cloth and leather, correct hands, ordinary human proportions. Transparent alpha background if supported, otherwise uniform solid pure magenta #FF00FF with NO checkerboard, floor, shadows or gradient. No ground plane, gun, scenery, extra crew, ammunition piles, musket, text, labels, watermark or borders. Landscape 1536x1024. This will be animated beside an existing gun; clean silhouette and horizontal rammer positions are essential.
```

No local model, API fallback runner or manual raster alteration was used. Pixel analysis measured the original source; normal game rendering extracts and keys the sprites at load time. New artwork loads only in scenarios with artillery.
