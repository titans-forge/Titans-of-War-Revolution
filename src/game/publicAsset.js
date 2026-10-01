// Resolve authored public paths relative to the hosted game, including itch.io's nested directory.
export const publicAsset = path => `${import.meta.env?.BASE_URL || './'}${path.replace(/^\/+/, '')}`;
