# Nguồn asset

- `frontend/public/assets/hero-bay.webp`: ảnh tạo mới bằng imagegen ngày 11/10/2026. Bố cục máy bay đỏ/trắng trên vịnh Hạ Long, bầu trời và vùng trống cho booking widget. Không sao chép banner hãng.
- `hero-campaign.webp`: ảnh tạo mới bằng imagegen, 1774×887; hai khách du lịch, ba món ăn trên bục tròn, máy bay đỏ/trắng nhỏ và mây hồng. Prompt yêu cầu poster hàng không nguyên bản, người/món ăn bên trái, vùng giữa và bên phải trống cho nội dung HTML và widget, không chữ/logo. Bố cục tham chiếu chiến dịch 12h; không dùng poster gốc.
- `hero-island.webp`: ảnh tạo mới bằng imagegen, 1774×887; gia đình ba người, vali vàng, máy bay nhỏ trên biển và đảo nhiệt đới. Prompt yêu cầu ảnh quảng cáo nguyên bản, nhân vật ở một phần ba trái, trời xanh thoáng ở giữa/phải, không chữ/logo. Cả hai ảnh được chuyển WebP chất lượng 84; bản PNG gốc giữ ngoài repo trong thư mục generated_images của Codex.
- `cabin`, `family`, `cargo`, `shopping`, `resort`, `japan`, `quang-binh`, `gia-lai`, `nghe-an`, `ha-noi`, `ho-chi-minh`, `phu-quoc`: 12 ảnh tạo mới trong một contact sheet, tách ô và chuyển WebP. Các địa điểm là hình minh họa được tạo, không phải ảnh tư liệu xác minh địa lý.
- KoHo: Google Fonts, giấy phép SIL Open Font License trong `frontend/public/assets/fonts/OFL.txt`. Font lưu tại repo, không cần kết nối Google khi chạy ứng dụng.
- Favicon và viền mây: SVG đơn giản tự tạo. Icons từ Lucide React (ISC).
- Chữ logo dựng bằng CSS để tham chiếu giao diện, luôn kèm nhãn mô phỏng độc lập; không dùng SVG logo gốc.
- Screenshot reference chỉ ở `docs/reference`; frontend không sử dụng chúng.

Không có ảnh/banner/font độc quyền của hãng được đưa vào asset sản phẩm. Ảnh tạo mới và font tiêu đề thay thế là khác biệt đã biết so với reference.
