const heroArtwork = {
  "/assets/hero-campaign.webp": ["hero-campaign.jpg", "hero-campaign-mobile.jpg"],
  "/assets/hero-bay.webp": ["hero-bay.jpg", "hero-bay-mobile.jpg"],
  "/assets/hero-island.webp": ["hero-family.jpg", "hero-family-mobile.jpg"],
};

export function getHeroArtwork(image) {
  const artwork = heroArtwork[image];
  return artwork && artwork.map(file => `/assets/reference/${file}`);
}
