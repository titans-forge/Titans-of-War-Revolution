# Titans of War: Revolution

> **Current licensing policy — Forge Game License 2.0 (FG2-TITANS-OF-WAR-REVOLUTION-20261015).** This licensing-only edition requires separate permission for either public hosting or AI training by above-threshold entities on qualifying new Forge-controlled material. Previously supplied gameplay/media retain MIT, earlier Forge and other applicable grants. No retroactive restriction is claimed. See [release scope](LICENSING.md), [complete current terms](LICENSE), [preserved prior terms](LICENSE-LEGACY-PRE-FORGE-2.0.txt), [offline licensing page](FORGE-LICENSING.html) and [new download](https://github.com/titans-forge/Titans-of-War-Revolution/releases/tag/forge-license-2.0-20261015). Earlier statements below describe the earlier game and preserved grants.


[Play](https://titans-forge.itch.io/titans-of-war-revolution) · [Game collection](https://github.com/titans-forge/educational-games)

The upgraded edition is supplied under [Forge Game Hosting License 1.0](LICENSE).
See [the licensing checkpoint](LICENSING.md) for covered material, the commercial
hosting threshold, retained earlier grants and separately licensed media.

A local-first historical strategy game about command, political legitimacy, logistics, and the American Revolution.

## Current campaign

The playable campaign now begins after Lexington and Concord, forms the Continental Army, contests Bunker Hill, and separates the Lee Resolution, the July 2 vote for independence, and publication of the Declaration before entering the New York campaign. It then reaches Saratoga and the French alliance and continues through Valley Forge, the frontier war, the southern campaigns, and Yorktown. It includes:

- Six persistent strategic pressures
- Three competing advisory perspectives
- Visible legacy consequences that let earlier preparations improve later choices
- Thirty linked campaign decisions across four acts
- Deterministic interactive battles at Bunker Hill, Long Island, Trenton, Brandywine, Bemis Heights, Monmouth, and Cowpens
- Fifteen campaign panoramas and seven battle-specific tactical landscapes
- Terrain-aware movement and protection on every battlefield
- Campaign inheritance: army quality, supply, support, and earlier reforms enter tactical encounters
- Decision aftermath dispatches that make costs and benefits legible before the next crisis
- Historical context with source notes
- Versioned local browser saves with export, import, reset confirmation, and migrations for earlier campaign releases
- Separate final grades for command, sustainment, statecraft, and coalition strategy
- Build-time validation for campaign routes, battles, metrics, historical primers, scene ownership, and image presence
- A recoverable error screen instead of a blank page after a rendering failure
- Desktop, tablet, and mobile layouts

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run validate
```

Validation checks the historical content graph, conditional choice modifiers, and deterministic battle engine before producing the browser build. Phaser is loaded only when a tactical encounter begins and is emitted as a separate cacheable vendor bundle.

## How to play

Strategic turns present defensible approaches with different political, military, fiscal, and diplomatic costs; brief historical interludes connect especially consequential acts to their public effects. High metrics become harder to raise, and strong armies continue to consume stores. Seven decisions open tactical battles where formations can move, change frontage, hold, volley, reform, or withdraw.

The game does not require AI, an account, an API key, or an internet connection after the files are loaded. Progress remains in the browser unless the player exports a save.

## Design direction

This repository is separate from *Titans of War: Civil War*. The campaign is organized around four acts: Rebellion, Survival, Global War, and Southern Decision. Tactical encounters are used selectively where battlefield command materially changes the strategic story.

Previously supplied code retains its MIT grant; current policy is recorded in `LICENSING.md`. Generated historical reconstructions are documented separately in `MEDIA_RIGHTS.md`; they are interpretive game art, not primary sources.
