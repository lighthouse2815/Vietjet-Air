# Nguồn asset

Các ảnh tạo ban đầu dưới đây được giữ cho nội dung khác và trường hợp chỉnh caption trong CMS. Trang chủ mặc định hiện dùng artwork tham chiếu ở mục sau.

- `frontend/public/assets/hero-bay.webp`: ảnh tạo mới bằng imagegen ngày 11/10/2026. Bố cục máy bay đỏ/trắng trên vịnh Hạ Long, bầu trời và vùng trống cho booking widget. Không sao chép banner hãng.
- `hero-campaign.webp`: ảnh tạo mới bằng imagegen, 1774×887; hai khách du lịch, ba món ăn trên bục tròn, máy bay đỏ/trắng nhỏ và mây hồng. Prompt yêu cầu poster hàng không nguyên bản, người/món ăn bên trái, vùng giữa và bên phải trống cho nội dung HTML và widget, không chữ/logo. Bố cục tham chiếu chiến dịch 12h; không dùng poster gốc.
- `hero-island.webp`: ảnh tạo mới bằng imagegen, 1774×887; gia đình ba người, vali vàng, máy bay nhỏ trên biển và đảo nhiệt đới. Prompt yêu cầu ảnh quảng cáo nguyên bản, nhân vật ở một phần ba trái, trời xanh thoáng ở giữa/phải, không chữ/logo. Cả hai ảnh được chuyển WebP chất lượng 84; bản PNG gốc giữ ngoài repo trong thư mục generated_images của Codex.
- `cabin`, `family`, `cargo`, `shopping`, `resort`, `japan`, `quang-binh`, `gia-lai`, `nghe-an`, `ha-noi`, `ho-chi-minh`, `phu-quoc`: 12 ảnh tạo mới trong một contact sheet, tách ô và chuyển WebP. Các địa điểm là hình minh họa được tạo, không phải ảnh tư liệu xác minh địa lý.
- KoHo: Google Fonts, giấy phép SIL Open Font License trong `frontend/public/assets/fonts/OFL.txt`. Font lưu tại repo, không cần kết nối Google khi chạy ứng dụng.
- Favicon và viền mây: SVG đơn giản tự tạo. Icons từ Lucide React (ISC).
- Header hiện dùng SVG logo tham chiếu, luôn kèm nhãn mô phỏng độc lập.
- Screenshot reference chỉ ở `docs/reference`; frontend không sử dụng chúng.

## Asset căn chỉnh giao diện

Theo yêu cầu căn chỉnh giao diện, `frontend/public/assets/reference/` lưu bản tải của logo, chín banner desktop/mobile, nền mây, ảnh dịch vụ/điểm đến, icon, ảnh giải thưởng và font tiêu đề từ trang tham chiếu công khai `https://www.vietjetair.com/vi`. Nguồn đầy đủ 78 file nằm trong `sources.json`; chạy `node scripts/sync-home-artwork.mjs` để tải lại. Hai ảnh bổ sung ngày 12/10/2026 là nền thống kê desktop/mobile, được đối chiếu trong [verification/BACKGROUNDS.md](verification/BACKGROUNDS.md). Đây là asset tham chiếu của chủ sở hữu gốc, không phải ảnh AI hay asset do dự án sáng tác; không gán giấy phép mở cho các file này.

Banner có chữ được hiển thị nguyên ảnh, kèm tiêu đề đọc được bằng trình đọc màn hình, để tránh chồng thêm chữ HTML. Các giá/chiến dịch trong artwork thuộc ảnh tham chiếu; giá và giao dịch của ứng dụng được trả từ API demo. Ảnh CMS tùy chỉnh tiếp tục hiển thị trực tiếp cùng tiêu đề HTML.

## Asset SkyShop

Ngày 12/10/2026, đối chiếu [SkyShop công khai](https://skyshop.vietjetair.com/vi) và lưu 18 ảnh/SVG, tổng 3.751.371 byte, tại `frontend/public/assets/skyshop/`. [sources.json](../frontend/public/assets/skyshop/sources.json) ghi URL từng file: banner desktop/mobile, viền mây, nền trang, nền dịch vụ nổi bật, góc ribbon, năm icon danh mục, năm ảnh dịch vụ và hai icon điều hướng. Frontend tải từ local; không gọi API mua hàng của website tham chiếu.

Banner dùng ảnh riêng ở chiều rộng ≤767px, theo breakpoint của SkyShop. Các ảnh suất ăn và bảo hiểm là minh họa từ tham chiếu, không xác nhận trùng sản phẩm demo. Tên, giá, mô tả và tồn kho lấy từ API nội bộ. Quà lưu niệm dùng icon Lucide có sẵn. Những asset tham chiếu thuộc chủ sở hữu gốc; không gán giấy phép mở hay mô tả là ảnh do project tạo.
