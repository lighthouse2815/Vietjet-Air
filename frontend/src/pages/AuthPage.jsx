import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { storeBooking } from "../utils/booking";
export default function AuthPage() {
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
  return (
    <main className="container page">
      <div className="page-heading">
        <span className="eyebrow">TÀI KHOẢN RIÊNG CỦA BẢN DEMO</span>
        <h1>
          {user
            ? "Tài khoản của tôi"
            : mode === "login"
              ? "Đăng nhập demo"
              : "Đăng ký demo"}
        </h1>
        <p>Không sử dụng tài khoản hoặc mật khẩu Vietjet thật.</p>
      </div>
      <section className="panel auth-panel">
        {user ? (
          <>
            <h2>Xin chào, {user.name}</h2>
            <p>{user.email}</p>
            <button
              className="button primary"
              onClick={() => load()}
              disabled={busy}
            >
              Tải booking của tôi
            </button>
            <button className="button secondary" onClick={logout}>
              Đăng xuất
            </button>
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
              >
                Tải thêm booking
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <div className="form-grid one">
              {mode === "register" && (
                <label>
                  Tên hiển thị
                  <input
                    {...register("name", {
                      required: "Nhập tên hiển thị",
                      maxLength: 100,
                    })}
                  />
                  {errors.name && (
                    <small className="field-error">{errors.name.message}</small>
                  )}
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  {...register("email", {
                    required: "Nhập email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
                {errors.email && (
                  <small className="field-error">{errors.email.message}</small>
                )}
              </label>
              <label>
                Mật khẩu
                <input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  {...register("password", {
                    required: "Nhập mật khẩu",
                    minLength: { value: 8, message: "Ít nhất 8 ký tự" },
                    maxLength: 72,
                  })}
                />
                {errors.password && (
                  <small className="field-error">
                    {errors.password.message}
                  </small>
                )}
              </label>
            </div>
            <button className="button primary full" disabled={busy}>
              {busy
                ? "Đang xử lý..."
                : mode === "login"
                  ? "Đăng nhập"
                  : "Tạo tài khoản demo"}
            </button>
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
                ? "Chưa có tài khoản? Đăng ký demo"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </form>
        )}
        {error && (
          <p role="alert" className="notice-panel error">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
