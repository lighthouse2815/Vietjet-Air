import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useApi } from "../hooks/useApi";
import { LoadingState, ErrorState } from "../components/common/States";

export default function AccountPage() {
  useTranslation();
  const profile = useApi("/account/profile");
  const travelers = useApi("/account/travelers");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expired, setExpired] = useState(false);
  if (!sessionStorage.getItem("demo-auth") || expired) return <Navigate to="/auth" replace />;
  async function submit(event, path, success) {
    event.preventDefault(); const form = event.currentTarget;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.post(path, Object.fromEntries(new FormData(form)));
      setMessage(success);
      if (path.endsWith("password")) {
        sessionStorage.removeItem("demo-auth"); sessionStorage.removeItem("demo-user"); setExpired(true);
      } else { profile.retry(); travelers.retry(); if (path.includes("travelers")) { form.reset(); setEditing(null); } }
    } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  async function remove(id) {
    setBusy(true); setError("");
    try { await api.post(`/account/travelers/${id}/delete`); travelers.retry(); }
    catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <main className="container page checkout-page">
    <div className="page-heading"><h1>{t("Hồ sơ và hành khách thường dùng")}</h1><p>{t("Thông tin lưu riêng theo tài khoản của bạn.")}</p></div>
    {error && <ErrorState message={t(error)} />}{message && <p role="status" className="notice-panel">{t(message)}</p>}
    {profile.loading ? <LoadingState /> : profile.error ? <ErrorState message={profile.error} retry={profile.retry} /> : <>
      <form className="panel" key={profile.data.name} onSubmit={e => submit(e,"/account/profile",t("Đã lưu hồ sơ."))}>
        <h2>{t("Hồ sơ")}</h2><div className="form-grid"><label>{t("Tên hiển thị")}<input name="name" required maxLength={100} defaultValue={profile.data.name}/></label><label>{t("Số điện thoại")}<input name="phone" required pattern="[+0-9 ()-]{8,20}" defaultValue={profile.data.phone || ""}/></label></div>
        <p>{profile.data.email}</p><button className="button primary" disabled={busy}>{t("Lưu hồ sơ")}</button>
      </form>
      <form className="panel" onSubmit={e => submit(e,"/account/password",t("Đã đổi mật khẩu."))}>
        <h2>{t("Đổi mật khẩu")}</h2><div className="form-grid"><label>{t("Mật khẩu hiện tại")}<input name="currentPassword" type="password" required autoComplete="current-password" maxLength={72}/></label><label>{t("Mật khẩu mới")}<input name="newPassword" type="password" required autoComplete="new-password" minLength={8} maxLength={72}/></label></div>
        <p>{t("Đổi mật khẩu sẽ kết thúc các phiên đăng nhập hiện tại.")}</p><button className="button primary" disabled={busy}>{t("Đổi mật khẩu")}</button>
      </form>
    </>}
    <section className="panel"><h2>{t("Hành khách thường dùng")}</h2>
      {travelers.loading ? <LoadingState /> : travelers.error ? <ErrorState message={travelers.error} retry={travelers.retry}/> : travelers.data.map(traveler => <div className="account-booking" key={traveler.id}><span>{traveler.lastName} {traveler.firstName} · {traveler.dateOfBirth}</span><button type="button" className="button secondary" onClick={()=>setEditing(traveler)}>{t("Sửa")}</button><button type="button" className="button secondary" disabled={busy} onClick={()=>remove(traveler.id)}>{t("Xóa")}</button></div>)}
      <form key={editing?.id || "new"} onSubmit={e => submit(e,`/account/travelers${editing?`/${editing.id}`:""}`,t("Đã lưu hành khách."))}>
        <h3>{editing ? t("Sửa hành khách") : t("Thêm hành khách")}</h3><div className="form-grid">
          <label>{t("Loại hành khách")}<select name="type" defaultValue={editing?.type || "ADULT"}><option value="ADULT">{t("Người lớn")}</option><option value="CHILD">{t("Trẻ em")}</option><option value="INFANT">{t("Em bé")}</option></select></label>
          <label>{t("Danh xưng")}<select name="title" defaultValue={editing?.title || "MR"}>{["MR","MS","MSTR","MISS"].map(t=><option key={t}>{t}</option>)}</select></label>
          <label>{t("Họ")}<input name="lastName" required maxLength={100} defaultValue={editing?.lastName || ""}/></label><label>{t("Tên đệm và tên")}<input name="firstName" required maxLength={100} defaultValue={editing?.firstName || ""}/></label>
          <label>{t("Ngày sinh")}<input name="dateOfBirth" type="date" required defaultValue={editing?.dateOfBirth || ""}/></label><label>{t("Quốc tịch")}<input name="nationality" required maxLength={100} defaultValue={editing?.nationality || t("Việt Nam")}/></label>
        </div><button className="button primary" disabled={busy}>{t("Lưu hành khách")}</button>{editing && <button type="button" className="button secondary" onClick={()=>setEditing(null)}>{t("Hủy sửa")}</button>}
      </form>
    </section><Link to="/auth">{t("Booking trong tài khoản")}</Link>
  </main>;
}
