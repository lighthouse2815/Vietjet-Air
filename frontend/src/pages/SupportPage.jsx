import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api, errorMessage } from "../api/client";
import { LoadingState, ErrorState } from "../components/common/States";
export default function SupportPage() {
  const logged = !!sessionStorage.getItem("demo-auth");
  const tickets = useApi(logged ? "/support/tickets" : null);
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function send(e,path) { e.preventDefault();const form=e.currentTarget;setBusy(true);setError("");try {await api.post(path,Object.fromEntries(new FormData(form)));form.reset();tickets.retry();}catch(ex){setError(errorMessage(ex));}finally{setBusy(false);} }
  async function close(id) {setBusy(true);try{await api.post(`/support/tickets/${id}/close`);tickets.retry();}catch(ex){setError(errorMessage(ex));}finally{setBusy(false);}}
  return <main className="container page checkout-page"><div className="page-heading"><h1>Trung tâm hỗ trợ</h1><p>Gửi yêu cầu và theo dõi trao đổi với quản trị viên.</p></div>
    <Link className="button secondary" to="/services/faq">Câu hỏi thường gặp</Link>
    {!logged ? <p className="notice-panel"><Link to="/auth">Đăng nhập</Link> để gửi và theo dõi yêu cầu.</p> : <>
      <form className="panel" onSubmit={e=>send(e,"/support/tickets")}><h2>Gửi yêu cầu</h2><div className="form-grid"><label>Chủ đề<input name="subject" required maxLength={200}/></label><label>Nhóm yêu cầu<select name="category"><option value="BOOKING">Đặt vé</option><option value="PAYMENT">Thanh toán</option><option value="BAGGAGE">Hành lý</option><option value="OTHER">Khác</option></select></label></div><label>Nội dung<textarea name="body" required maxLength={4000}/></label><button className="button primary" disabled={busy}>Gửi yêu cầu</button></form>
      {error && <ErrorState message={error}/>}{tickets.loading ? <LoadingState/> : tickets.error ? <ErrorState message={tickets.error} retry={tickets.retry}/> : tickets.data.length === 0 ? <p>Chưa có yêu cầu hỗ trợ.</p> : tickets.data.map(t=><section className="panel" key={t.id}><h2>#{t.id} · {t.subject}</h2><p>{t.status}</p>{t.messages.map(m=><p className="notice-panel" key={m.id}><strong>{m.staff?"Nhân viên":"Bạn"}:</strong> {m.body}</p>)}{t.status!=="CLOSED" && <><form onSubmit={e=>send(e,`/support/tickets/${t.id}/reply`)}><label>Trả lời<textarea name="body" required maxLength={4000}/></label><button className="button primary" disabled={busy}>Gửi trả lời</button></form><button className="button secondary" disabled={busy} onClick={()=>close(t.id)}>Đóng yêu cầu</button></>}</section>)}
    </>}
  </main>;
}
