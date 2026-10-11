UPDATE content_items
SET title = E'12H RỒI,\nBAY VUI THÔI!',
    description = E'Ưu đãi dành riêng cho trải nghiệm demo\nNhập DEMO10 tại bước xác nhận',
    image = '/assets/hero-campaign.webp'
WHERE category = 'HERO' AND sort_order = 1;

UPDATE content_items
SET title = 'MỞ KẾT NỐI BẦU TRỜI',
    description = 'Bay đến những điều tuyệt vời · Trải nghiệm đặt vé độc lập'
WHERE category = 'HERO' AND sort_order = 2;

UPDATE content_items
SET title = 'BAY VUI, KHÁM PHÁ MỚI',
    description = 'Khởi hành cùng những hành trình đáng nhớ',
    image = '/assets/hero-island.webp'
WHERE category = 'HERO' AND sort_order = 3;
