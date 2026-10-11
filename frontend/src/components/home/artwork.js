const heroArtwork = {
  "/assets/hero-campaign.webp": [
    "hero-campaign.jpg",
    "hero-campaign-mobile.jpg",
  ],
  "/assets/hero-bay.webp": ["hero-bay.jpg", "hero-bay-mobile.jpg"],
  "/assets/hero-island.webp": ["hero-family.jpg", "hero-family-mobile.jpg"],
  ...Object.fromEntries(
    ["japan", "anniversary", "korea", "groups", "transfer", "loyalty"].map(
      (name) => [
        `/assets/reference/hero-${name}.jpg`,
        [`hero-${name}.jpg`, `hero-${name}-mobile.jpg`],
      ],
    ),
  ),
};
// Only replace the seeded artwork while its editable captions remain unchanged.
const heroCaptions = {
  "/assets/hero-campaign.webp": [
    "12H RỒI,\nBAY VUI THÔI!",
    "Ưu đãi dành riêng cho trải nghiệm demo\nNhập DEMO10 tại bước xác nhận",
  ],
  "/assets/hero-bay.webp": [
    "MỞ KẾT NỐI BẦU TRỜI",
    "Bay đến những điều tuyệt vời · Trải nghiệm đặt vé độc lập",
  ],
  "/assets/hero-island.webp": [
    "BAY VUI, KHÁM PHÁ MỚI",
    "Khởi hành cùng những hành trình đáng nhớ",
  ],
  ...Object.fromEntries(
    [
      ["japan", "Bay đến Nhật Bản"],
      ["anniversary", "Sẵn sàng hóa rồng, tung cánh toàn cầu"],
      ["korea", "Bay khắp Hàn Quốc"],
      ["groups", "Bay theo đoàn, vui ngập tràn"],
      ["transfer", "Khám phá Trung Quốc"],
      ["loyalty", "Đặc quyền hội viên SkyJoy"],
    ].map(([name, title]) => [
      `/assets/reference/hero-${name}.jpg`,
      [title, "Banner tham chiếu · Giá và giao dịch của hệ thống là demo"],
    ]),
  ),
};

export function getHeroArtwork(banner) {
  const captions = heroCaptions[banner?.image];
  if (
    !captions ||
    banner.title !== captions[0] ||
    banner.description !== captions[1]
  )
    return undefined;
  const artwork = heroArtwork[banner.image];
  return artwork && artwork.map((file) => `/assets/reference/${file}`);
}

const contentArtwork = {
  FEATURE: { "/assets/cabin.webp": ["skyjoy.jpg", "skyjoy-mobile.jpg"] },
  SHOP: { "/assets/shopping.webp": ["shopping.jpg", "shopping-mobile.jpg"] },
  SERVICE: {
    "/assets/family.webp": ["insurance.png"],
    "/assets/cargo.webp": ["cargo.webp"],
    "/assets/cabin.webp": ["bank.jpg"],
  },
  TRAVEL: {
    "/assets/resort.webp": ["hotel.webp"],
    "/assets/japan.webp": ["holiday.webp"],
    "/assets/hero-bay.webp": ["low-fares.webp"],
  },
  DESTINATION: Object.fromEntries(
    [
      ["quang-binh", "jpg"],
      ["gia-lai", "png"],
      ["nghe-an", "webp"],
      ["ha-noi", "jpg"],
      ["ho-chi-minh", "png"],
      ["phu-quoc", "jpg"],
    ].map(([name, extension], i) => [
      `/assets/${name}.webp`,
      [`destination-${i}.${extension}`],
    ]),
  ),
};

export function getContentArtwork(item) {
  if (
    item.category === "FEATURE" &&
    (item.title !== "Tận hưởng chuyến bay" ||
      item.description !== "Thêm tiện ích, thêm niềm vui trên mỗi hành trình")
  )
    return undefined;
  if (
    item.category === "SHOP" &&
    (item.title !== "Mua sắm, giải trí trên mây" ||
      item.description !==
        "Yêu hàng hiệu, vui mỗi chuyến đi · Khám phá dịch vụ trên chuyến bay")
  )
    return undefined;
  const artwork = contentArtwork[item.category]?.[item.image];
  return artwork && artwork.map((file) => `/assets/reference/${file}`);
}
