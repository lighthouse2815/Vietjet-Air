import { Link, useLocation } from "react-router-dom";
import {
  Plane,
  ShoppingBag,
  MapPin,
  Ticket,
  Headphones,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Mail,
} from "lucide-react";
const groups = [
  [
    "Để có chuyến bay tốt đẹp",
    [
      "Điều lệ vận chuyển",
      "Điều kiện vé",
      "Vietjet e-Voucher",
      "Phí và lệ phí",
      "Giấy tờ tùy thân",
      "Quy định hành lý",
      "Thông tin nối chuyến",
      "Kênh thanh toán",
      "Hóa đơn VAT",
      "Hướng dẫn làm thủ tục chuyến bay",
    ],
  ],
  [
    "Mua hành lý, suất ăn, chọn chỗ ngồi và hơn thế nữa...",
    [
      "Chọn chỗ ngồi ưu tiên",
      "Mua trước hành lý",
      "Đặt trước suất ăn",
      "Hàng miễn thuế",
      "Quà lưu niệm",
      "Giải trí",
      "Dịch vụ đặc biệt",
    ],
  ],
  [
    "Dịch vụ cao cấp",
    [
      "Hạng vé Business",
      "Hạng vé SkyBoss",
      "Phòng chờ sang trọng",
      "Về Vietjet",
      "Giới thiệu dự án",
      "Tin tức và khuyến mại",
      "Cẩm nang du lịch",
    ],
  ],
  [
    "Trung tâm phục vụ Khách hàng",
    [
      "Hỗ trợ",
      "Liên hệ",
      "Mua vé ở đâu?",
      "Phòng bán vé",
      "Đại lý bán vé",
      "Tìm vật phẩm bỏ quên",
    ],
  ],
  [
    "Chính sách",
    [
      "Chính sách quyền riêng tư",
      "Chính sách sử dụng Cookies",
      "Dịch vụ hàng hóa",
      "Quy trình đổi, hoàn, hủy vé",
      "Điều kiện bản demo",
    ],
  ],
];
export default function Footer() {
  const home = useLocation().pathname === "/";
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-grid">
          {groups.map(([title, items]) => (
            <div key={title}>
              <h4>
                <ArrowRight size={13} />
                {title}
              </h4>
              {items.map((item) => (
                <Link
                  key={item}
                  to={`/services/${item.includes("hành lý") ? "baggage" : item.includes("suất ăn") ? "meals" : item.includes("chỗ") ? "seats" : item.includes("Cookies") ? "cookies" : item.includes("riêng tư") ? "privacy" : "support"}`}
                >
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <div>
            <h4>Kết nối cùng hành trình</h4>
            <div className="social-links">
              <Link aria-label="Thông tin Facebook" to="/services/social">
                <Facebook />
              </Link>
              <Link aria-label="Thông tin Instagram" to="/services/social">
                <Instagram />
              </Link>
              <Link aria-label="Thông tin YouTube" to="/services/social">
                <Youtube />
              </Link>
              <Link aria-label="Liên hệ hỗ trợ" to="/services/support">
                <Mail />
              </Link>
            </div>
            <small>Cập nhật thông tin chuyến bay demo</small>
          </div>
          <div>
            <h4>Hướng dẫn đặt chuyến bay</h4>
            <Link to="/services/booking">Tìm hiểu luồng đặt vé</Link>
            <h4>Hướng dẫn thanh toán</h4>
            <Link to="/services/payment">Thanh toán giả lập an toàn</Link>
          </div>
          <div className="footer-disclaimer">
            <strong>VIETJET · BẢN MÔ PHỎNG ĐỘC LẬP</strong>
            <p>
              Dự án học tập full-stack, không liên kết hay đại diện cho Vietjet
              Air. Mọi chuyến bay, giá và giao dịch trên website là dữ liệu
              demo.
            </p>
            <small>
              Không sử dụng tài khoản Vietjet, thông tin thẻ hoặc giấy tờ cá
              nhân thật.
            </small>
          </div>
        </div>
      </footer>
      <nav className="mobile-bottom" aria-label="Điều hướng nhanh">
        <Link to="/">
          <Ticket />
          <span>Đặt chuyến bay</span>
        </Link>
        <Link to="/my-booking">
          <Plane />
          <span>Chuyến bay của tôi</span>
        </Link>
        <Link to="/my-booking">
          <ShoppingBag />
          <span>Mua dịch vụ</span>
        </Link>
        <Link to="/check-in">
          <MapPin />
          <span>Check-in</span>
        </Link>
      </nav>
      {home && (
        <Link
          className="help-bubble"
          to="/services/support"
          aria-label="Trung tâm hỗ trợ"
        >
          <span>Xin chào!</span>
          <Headphones />
        </Link>
      )}
    </>
  );
}
