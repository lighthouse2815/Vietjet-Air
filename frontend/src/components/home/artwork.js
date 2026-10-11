// Artwork is resolved by the backend CMS, including caption compatibility.
export function getHeroArtwork(item) { const artwork = item?.details?.artwork; return Array.isArray(artwork) && artwork.length ? artwork : undefined; }
export function getContentArtwork(item) { const artwork = item?.details?.artwork; return Array.isArray(artwork) && artwork.length ? artwork : undefined; }
