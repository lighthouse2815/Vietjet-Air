import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { storeBooking } from "../utils/booking";
export default function AuthPage() {
  useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = params.get("returnTo");
  const [resetMessage, setResetMessage] = useState("");
  const [resetToken, setResetToken] = useState(params.get("reset") || "");
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("demo-user"));
    } catch {
      return null;
    }
  });
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  async function submit(values) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/auth/${mode}`, values);
      sessionStorage.setItem("demo-auth", data.token);
      sessionStorage.setItem("demo-user", JSON.stringify(data));
      setUser(data);
      if (["hotels", "esim", "visa", "currency", "insurance", "skyjoy", "support"].some(slug => returnTo === `/services/${slug}`)) {
        navigate(returnTo, { replace: true });
        return;
      }
      const result = await api.get("/auth/bookings");
      setBookings(result.data);
      setPage(0);
      setHasMore(result.data.length === 20);
      result.data.forEach(storeBooking);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function load(nextPage = 0) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get(`/auth/bookings?page=${nextPage}&size=20`);
      setBookings((current) => (nextPage === 0 ? data : [...current, ...data]));
      setPage(nextPage);
      setHasMore(data.length === 20);
      data.forEach(storeBooking);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function logout() {
    sessionStorage.removeItem("demo-auth");
    sessionStorage.removeItem("demo-user");
    setUser(null);
    setBookings([]);
    setPage(0);
    setHasMore(false);
    reset();
  }
  async function recover(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const {data} = await api.post(resetToken ? "/auth/password-reset/complete" : "/auth/password-reset", resetToken ? {...values,token:resetToken} : values);
      setResetMessage(data.message); if (resetToken) { setResetToken(""); setMode("login"); }
    } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return (
    <main className="container page">
      <div className="page-heading">
        <span className="eyebrow">{t("TÀI KHOẢN RIÊNG CỦA BẢN DEMO")}</span>
        <h1>
          {user
            ? t("Tài khoản của tôi")
            : mode === "login"
              ? t("Đăng nhập demo")
              : t("Đăng ký demo")}
        </h1>
        <p>{t("Không sử dụng tài khoản hoặc mật khẩu Vietjet thật.")}</p>
      </div>
      <section className="panel auth-panel">
        {user ? (
          <>
            <h2>{t("Xin chào, ")}{user.name}</h2>
            <p>{user.email}</p>
            <p><Link to="/account">{t("Hồ sơ và hành khách thường dùng")}</Link> · <Link to="/services/support">{t("Yêu cầu hỗ trợ")}</Link></p>
            {user.role === "ADMIN" && <p><Link to="/admin">{t("Quản trị nghiệp vụ")}</Link></p>}
            <button
              className="button primary"
              onClick={() => load()}
              disabled={busy}
            >{t("Tải booking của tôi")}</button>
            <button className="button secondary" onClick={logout}>{t("Đăng xuất")}</button>
            {bookings.map((b) => (
              <Link
                className="account-booking"
                key={b.id}
                to={`/booking/success/${b.code}`}
              >
                <strong>{b.code}</strong>
                <span>
                  {b.segments
                    .map(
                      (s) =>
                        `${s.flight.origin.code} → ${s.flight.destination.code}`,
                    )
                    .join(" · ")}
                </span>
              </Link>
            ))}
            {hasMore && (
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => load(page + 1)}
              >{t("Tải thêm booking")}</button>
            )}
          </>
        ) : mode === "forgot" || resetToken ? (
          <form onSubmit={recover}><h2>{t("Khôi phục mật khẩu")}</h2>
            <label>{resetToken ? t("Mật khẩu mới") : "Email"}<input name={resetToken ? "password" : "email"} type={resetToken ? "password" : "email"} required minLength={resetToken ? 8 : undefined} maxLength={resetToken ? 72 : 255} autoComplete={resetToken ? "new-password" : "email"}/></label>
            <button className="button primary" disabled={busy}>{resetToken ? t("Lưu mật khẩu mới") : t("Gửi hướng dẫn khôi phục")}</button>
            <button type="button" className="button secondary" onClick={()=>{setMode("login");setResetToken("");}}>{t("Về đăng nhập")}</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="form-grid one">
              {mode === "register" && (
                <label>{t("Tên hiển thị")}<input
                    {...register("name", {
                      required: t("Nhập tên hiển thị"),
                      maxLength: 100,
                    })}
                  />
                  {errors.name && (
                    <small className="field-error">{t(errors.name.message)}</small>
                  )}
                </label>
              )}
              <label>{t("Email")}<input
                  type="email"
                  {...register("email", {
                    required: t("Nhập email"),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("Email không hợp lệ"),
                    },
                  })}
                />
                {errors.email && (
                  <small className="field-error">{t(errors.email.message)}</small>
                )}
              </label>
              <label>{t("Mật khẩu")}<input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  {...register("password", {
                    required: t("Nhập mật khẩu"),
                    minLength: { value: 8, message: t("Ít nhất 8 ký tự") },
                    maxLength: 72,
                  })}
                />
                {errors.password && (
                  <small className="field-error">
                    {t(errors.password.message)}
                  </small>
                )}
              </label>
            </div>
            <button className="button primary full" disabled={busy}>
              {busy
                ? t("Đang xử lý...")
                : mode === "login"
                  ? t("Đăng nhập")
                  : t("Tạo tài khoản demo")}
            </button>
            <button type="button" className="auth-toggle" onClick={()=>setMode("forgot")}>{t("Quên mật khẩu?")}</button>
            <button
              type="button"
              className="auth-toggle"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                reset();
                setError("");
              }}
            >
              {mode === "login"
                ? t("Chưa có tài khoản? Đăng ký demo")
                : t("Đã có tài khoản? Đăng nhập")}
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="notice-panel error">
            {t(error)}
          </p>
        )}
        {resetMessage && <p role="status" className="notice-panel">{t(resetMessage)}</p>}
      </section>
    </main>
  );
}
