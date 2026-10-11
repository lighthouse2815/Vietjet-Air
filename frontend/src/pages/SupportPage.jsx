import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api, errorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/common/States";
export default function SupportPage() {
  useTranslation();
  const logged = !!sessionStorage.getItem("demo-auth");
  const tickets = useApi(logged ? "/support/tickets" : null);
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function send(e,path) { e.preventDefault();const form=e.currentTarget;setBusy(true);setError("");try {await api.post(path,Object.fromEntries(new FormData(form)));form.reset();tickets.retry();}catch(ex){setError(errorMessage(ex));}finally{setBusy(false);} }
  async function close(id) {setBusy(true);try{await api.post(`/support/tickets/${id}/close`);tickets.retry();}catch(ex){setError(errorMessage(ex));}finally{setBusy(false);}}
  return <main className="container page checkout-page"><div className="page-heading"><h1>{t("Trung tâm hỗ trợ")}</h1><p>{t("Gửi yêu cầu và theo dõi trao đổi với quản trị viên.")}</p></div>
    <Link className="button secondary" to="/services/faq">{t("Câu hỏi thường gặp")}</Link>
    {!logged ? <p className="notice-panel"><Link to="/auth">{t("Đăng nhập")}</Link>{t(" để gửi và theo dõi yêu cầu.")}</p> : <>
      <form className="panel" onSubmit={e=>send(e,"/support/tickets")}><h2>{t("Gửi yêu cầu")}</h2><div className="form-grid"><label>{t("Chủ đề")}<input name="subject" required maxLength={200}/></label><label>{t("Nhóm yêu cầu")}<select name="category"><option value="BOOKING">{t("Đặt vé")}</option><option value="PAYMENT">{t("Thanh toán")}</option><option value="BAGGAGE">{t("Hành lý")}</option><option value="OTHER">{t("Khác")}</option></select></label></div><label>{t("Nội dung")}<textarea name="body" required maxLength={4000}/></label><button className="button primary" disabled={busy}>{t("Gửi yêu cầu")}</button></form>
      {error && <ErrorState message={t(error)}/>}{tickets.loading ? <LoadingState/> : tickets.error ? <ErrorState message={tickets.error} retry={tickets.retry}/> : tickets.data.length === 0 ? <p>{t("Chưa có yêu cầu hỗ trợ.")}</p> : tickets.data.map(ticket=><section className="panel" key={ticket.id}><h2>#{ticket.id} · {ticket.subject}</h2><p>{t(ticket.status)}</p>{ticket.messages.map(m=><p className="notice-panel" key={m.id}><strong>{m.staff?t("Nhân viên"):t("Bạn")}:</strong> {m.body}</p>)}{ticket.status!=="CLOSED" && <><form onSubmit={e=>send(e,`/support/tickets/${ticket.id}/reply`)}><label>{t("Trả lời")}<textarea name="body" required maxLength={4000}/></label><button className="button primary" disabled={busy}>{t("Gửi trả lời")}</button></form><button className="button secondary" disabled={busy} onClick={()=>close(ticket.id)}>{t("Đóng yêu cầu")}</button></>}</section>)}
    </>}
  </main>;
}
