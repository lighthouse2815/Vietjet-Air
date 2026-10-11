import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Headphones,
  UserCircle,
  Menu,
  Plane,
  ShoppingBag,
  Hotel,
  Ticket,
  Wifi,
  Globe,
  Wallet,
  ShieldCheck,
  Gift,
  ChevronDown,
} from "lucide-react";
const products = [
  ["Đặt vé", "/", Plane],
  ["Skyshop", "/services/skyshop", ShoppingBag],
  ["Khách sạn", "/services/hotels", Hotel],
  ["E-Voucher", "/services/voucher", Ticket],
  ["E-Sim", "/services/esim", Wifi],
  ["E-Visa", "/services/visa", Globe],
  ["Mua ngoại tệ", "/services/currency", Wallet],
  ["Bảo hiểm", "/services/insurance", ShieldCheck],
  ["SkyJoy", "/services/skyjoy", Gift],
];
export default function Header() {
  const home = useLocation().pathname === "/";
  const [notice, setNotice] = useState(true);
  const [menu, setMenu] = useState(false);
  const [slide, setSlide] = useState(0);
  const notices = [
    "[BẢN MÔ PHỎNG ĐỘC LẬP] Đặt vé và thanh toán demo — không phải website chính thức của Vietjet.",
    "Khám phá hành trình demo · Dùng mã DEMO10 giảm 10%, tối đa 200.000 đ.",
    "Check-in demo mở 30 ngày và đóng 1 giờ trước khởi hành.",
  ];
  return (
    <>
      <div className="announcement" style={{ display: notice ? "" : "none" }}>
        <div className="container">
          <Bell size={21} />
          <span>{notices[slide]}</span>
          <button
            aria-label="Thông báo trước"
            onClick={() => setSlide((slide + 2) % 3)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Thông báo tiếp"
            onClick={() => setSlide((slide + 1) % 3)}
          >
            <ChevronRight size={18} />
          </button>
          <button aria-label="Đóng thông báo" onClick={() => setNotice(false)}>
            <X size={21} />
          </button>
        </div>
      </div>
      <header
        className={`site-header ${home ? "over-hero" : ""} ${!notice ? "no-notice" : ""}`}
      >
        <div className="container header-main">
          <Link className="brand" to="/" onClick={() => setMenu(false)}>
            vietjet<span>Air</span>
            <small>.com</small>
            <em>MÔ PHỎNG ĐỘC LẬP</em>
          </Link>
          <div className="header-right">
            <div className="utility-nav">
              <Link to="/services/support">
                <Headphones size={18} />
                Hỗ trợ
              </Link>
              <Link to="/auth">
                <UserCircle size={20} />
                Đăng ký | Đăng nhập
              </Link>
              <div className="dropdown language">
                <button>
                  Tiếng Việt <ChevronDown size={13} />
                </button>
                <div className="dropdown-menu">
                  <span>Tiếng Việt ✓</span>
                  <Link to="/services/language">Ngôn ngữ trong demo</Link>
                </div>
              </div>
            </div>
            <nav className="primary-nav" aria-label="Menu chính">
              <Link to="/my-booking">CHUYẾN BAY CỦA TÔI</Link>
              <Link to="/check-in">ONLINE CHECK-IN</Link>
              <div className="dropdown">
                <button>DỊCH VỤ CHUYẾN BAY</button>
                <div className="dropdown-menu">
                  <Link to="/my-booking">
                    Mua hành lý, suất ăn, chọn chỗ ngồi
                  </Link>
                  <Link to="/services/priority">Ưu tiên làm thủ tục</Link>
                  <Link to="/services/insurance">Bảo hiểm</Link>
                  <Link to="/services/faq">Câu hỏi thường gặp</Link>
                </div>
              </div>
              <div className="dropdown">
                <button>DỊCH VỤ KHÁC</button>
                <div className="dropdown-menu">
                  {products.slice(1).map(([label, path]) => (
                    <Link key={label} to={path}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
          <button
            className="mobile-menu-button"
            aria-label={menu ? "Đóng menu" : "Mở menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        <nav className="product-nav" aria-label="Dịch vụ">
          <div className="container">
            {products.map(([label, path, Icon], i) => (
              <Link className={i === 0 ? "current" : ""} key={label} to={path}>
                <Icon size={19} />
                {label}
              </Link>
            ))}
          </div>
        </nav>
        {menu && (
          <nav className="mobile-drawer" aria-label="Menu di động">
            {[
              ["Chuyến bay của tôi", "/my-booking"],
              ["Online Check-in", "/check-in"],
              ...products.map(([label, path]) => [label, path]),
            ].map(([label, path]) => (
              <Link key={label} to={path} onClick={() => setMenu(false)}>
                {label}
                <ChevronRight size={17} />
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
