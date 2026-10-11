import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../api/client";
import { t } from "../../i18n";

export default function ServiceRequestForm({ slug, title, fields }) {
  const logged = !!sessionStorage.getItem("demo-auth");
  const storageKey = `service-inquiry-${slug}`;
  const [values, setValues] = useState(() => {
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(storageKey) || "{}"); } catch { /* Discard malformed local drafts. */ }
    return Object.fromEntries(fields.map(field => [field.name,
      typeof saved?.[field.name] === "string" ? saved[field.name].slice(0, field.maxLength || 200) : field.defaultValue || ""]));
  });
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  useEffect(() => {
    if (ticket) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify(values)); } catch { /* A full browser store must not prevent sending. */ }
  }, [storageKey, values, ticket]);
  async function submit(event) {
    event.preventDefault();
    if (!logged || submitting.current || ticket) return;
    if (fields.some(field => field.type === "date" && values[field.name] && values[field.name] < today)) {
      setError("Ngày yêu cầu phải từ hôm nay trở đi."); return;
    }
    if (slug === "hotels" && values.checkOut <= values.checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng."); return;
    }
    submitting.current = true; setBusy(true); setError("");
    try {
      const body = fields.map(field => `${t(field.label)}: ${values[field.name].trim()}`).join("\n");
      const { data } = await api.post("/support/tickets", { subject: `${t("Yêu cầu tư vấn")} · ${t(title)}`, category: "OTHER", body });
      setTicket(data);
      try { sessionStorage.removeItem(storageKey); } catch { /* The submitted ticket remains in the account. */ }
    } catch (failure) { setError(errorMessage(failure)); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <section className="panel service-request" id="service-request">
    <h2>{t("Yêu cầu tư vấn")} · {t(title)}</h2>
    <p>{t("Yêu cầu được lưu trong tài khoản nội bộ. Nhân viên có thể trao đổi tại Trung tâm hỗ trợ; việc gửi yêu cầu chưa đặt hoặc thanh toán dịch vụ với đối tác.")}</p>
    {ticket ? <div className="notice-panel"><p role="status">{t("Đã gửi yêu cầu #{{id}}", { id: ticket.id })}</p>
      <Link className="button primary" to="/services/support">{t("Theo dõi yêu cầu")}</Link>
      <button type="button" className="button secondary" onClick={() => { setTicket(null); setValues(Object.fromEntries(fields.map(field => [field.name, field.defaultValue || ""]))); }}>{t("Tạo yêu cầu mới")}</button>
    </div> : <form onSubmit={submit}>
      <div className="form-grid">{fields.map(field => <label key={field.name}>{t(field.label)}
        {field.options ? <select name={field.name} aria-label={t(field.label)} required={field.required !== false} value={values[field.name]}
          onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}>
          <option value="">{t("Chọn thông tin")}</option>{field.options.map(option => <option key={option} value={option}>{t(option)}</option>)}
        </select> : <input name={field.name} aria-label={t(field.label)} type={field.type || "text"} required={field.required !== false}
          maxLength={field.maxLength || 200} min={field.type === "date" ? today : field.min} max={field.max} step={field.step}
          value={values[field.name]} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} />}
      </label>)}</div>
      {error && <p role="alert" className="notice-panel error">{t(error)}</p>}
      {logged ? <button className="button primary" disabled={busy}>{busy ? t("Đang gửi...") : t("Gửi yêu cầu tư vấn")}</button>
        : <Link className="button primary" to={`/auth?returnTo=/services/${slug}`}>{t("Đăng nhập để gửi yêu cầu")}</Link>}
    </form>}
  </section>;
}
