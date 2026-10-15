# Licensing checkpoint: Titans of War: Revolution

Checkpoint: **FG-LIC-20260930-04-GH1**. Prepared September 30, 2026.
This checkpoint accompanies the upgraded edition approved for publication under
the Forge Game Hosting License on September 30, 2026.

## Upgraded edition and migration boundary

The owner confirms the game has been substantially updated since its first
licensed release. Those existing gameplay upgrades are distinct from this
source migration: the migration itself changes packaging and documentation,
not gameplay or media. The current release policy is the Forge license for
Titans Forge-controlled material within its stated scope, subject to existing
grants and separately licensed components. Retaining a legacy MIT notice does
not automatically license future additions under MIT.

## Current policy and earlier MIT grants

The current project policy is [Forge Game Hosting License 1.0](LICENSE), a
source-available licence rather than an OSI-approved open-source licence. For
newly covered material only, companies with gross annual revenue over
US$1,000,000 need a separate agreement to publicly host their own playable copy.
See the full terms for scope, exemptions and preserved platform permissions.

The selected original source includes an MIT notice, retained byte-for-byte in
[LICENSE-LEGACY-MIT.txt](LICENSE-LEGACY-MIT.txt). Its SHA-256 is
`f5ba04d99816b6e73a183fcba80bfdcdab78c82a075a21f183fe4ca4dfaa1cd9`. Previously MIT-licensed material remains usable and hostable
under MIT. This export cannot make identical earlier MIT material exclusively
Forge-licensed. No old release is overwritten. In particular, the itch build
selected for this export already contained an MIT notice, and the rebuilt
original application/media members match that archived build byte-for-byte.
Its existing grants therefore cannot be treated as revoked by this checkpoint.
The prior working-file snapshot is identified by SHA-256 `401a40c26d3b1b70887c23ea30486df5fe2a6f75ce3bf3e25c39807a3b380b06`;
there is no invented prior Git commit. The preserved runtime-file hashes are
listed in [SOURCE_SNAPSHOT.json](SOURCE_SNAPSHOT.json).

Newly authored checkpoint documents and release-notice staging support are
offered under the Forge terms. Owner-controlled upgraded game material not
already granted under MIT or other terms is also covered by the Forge release
policy. This checkpoint does not claim an exclusive Forge grant over identical
previously MIT-supplied material. Future covered game changes need an identifiable
release boundary. Dependencies, media and prior grants retain their own terms;
the root licence is not a blanket claim over third-party or generated assets.
See [MEDIA_RIGHTS.md](MEDIA_RIGHTS.md) and [the public media inventory](docs/MEDIA_PROVENANCE_PUBLIC.json).

`npm run build` stages rights notices after the build. Direct Vite invocation
does not perform that lifecycle step: run `node scripts/stage-release-licenses.mjs`
and then its `--check` mode before redistributing a direct build.
The source-publication preflight verified 65 of 65 original application/media
members against the recorded itch archive. Licensing notices were checked
separately. This is a payload-identity check, not a complete legal rights audit.
No private Git history is exported.
