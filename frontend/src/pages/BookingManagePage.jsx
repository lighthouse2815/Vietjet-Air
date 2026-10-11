import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { api, bookingHeaders, money, errorMessage } from "../api/client";
import { useApi } from "../hooks/useApi";
import { bookingPayload, storeBooking } from "../utils/booking";
import SeatMap from "../components/booking/SeatMap";
import BookingDetails from "../components/booking/BookingDetails";
import { LoadingState, ErrorState } from "../components/common/States";
const day = date => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(date));
function ChangeLeg({segment,onChange,count}) {
  const [date,setDate]=useState(day(segment.flight.departureTime));
  const flights=useApi(`/flights/search?${new URLSearchParams({origin:segment.flight.origin.code,destination:segment.flight.destination.code,date,passengers:count})}`);
  return <div className="panel"><h3>{segment.flight.origin.code} → {segment.flight.destination.code}</h3><label>Ngày bay muốn đổi<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    {flights.loading?<LoadingState/>:flights.error?<ErrorState message={flights.error} retry={flights.retry}/>:<label>Chuyến bay<select value={flights.data.some(f=>f.id===segment.flight.id)?segment.flight.id:""} onChange={e=>{const f=flights.data.find(f=>f.id===Number(e.target.value));if(f)onChange({flight:f,fare:f.fares.find(v=>v.code===segment.fare.code)||f.fares[0]});}}><option value="">Chọn chuyến bay trong ngày</option>{flights.data.map(f=><option key={f.id} value={f.id}>{f.flightNumber} · {new Date(f.departureTime).toLocaleTimeString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",hour:"2-digit",minute:"2-digit"})}</option>)}</select></label>}
    <p>Đang chọn: {segment.flight.flightNumber} · {day(segment.flight.departureTime)}</p>
    <label>Hạng vé<select value={segment.fare.code} onChange={e=>onChange({...segment,fare:segment.flight.fares.find(f=>f.code===e.target.value)})}>{segment.flight.fares.map(f=><option key={f.code} value={f.code}>{f.name} · {money(f.price)}</option>)}</select></label>
  </div>;
}
export default function BookingManagePage() {
  const {code}=useParams();const token=sessionStorage.getItem(`booking-token-${code}`);
  const booking=useApi(token?`/bookings/${code}`:null,token);const services=useApi("/ancillary-services");
  const history=useApi(booking.data?.id?`/bookings/${booking.data.id}/history`:null,token);
  const [draft,setDraft]=useState(null);const [quote,setQuote]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  const [leg,setLeg]=useState(0);const [passenger,setPassenger]=useState(0);
  useEffect(()=>{const b=booking.data;if(!b?.id)return;
    const extras={},seats={};b.extras.forEach(e=>{extras[e.flightId]||={};(extras[e.flightId][e.passengerIndex]||=[]).push(e.service.id);});b.segments.forEach(s=>{seats[s.flight.id]={};s.seats.forEach(v=>{seats[s.flight.id][v.passengerIndex]=v.seatNumber;});});
    setDraft({segments:b.segments,passengers:b.passengers,contactEmail:b.contactEmail,contactPhone:b.contactPhone,promotionCode:"",extras,seats});setQuote(null);
  },[booking.data]);
  if(!token)return <Navigate to="/my-booking" replace/>;
  if(booking.loading || !draft)return booking.error?<ErrorState message={booking.error} retry={booking.retry}/>:<LoadingState/>;
  const b=booking.data;const segment=draft.segments[leg];const flightId=segment.flight.id;const eligible=draft.passengers.filter(p=>p.type!=="INFANT");const selected=eligible.find(p=>p.passengerIndex===passenger)||eligible[0];const index=selected.passengerIndex;
  function patch(value){setDraft(current=>({...current,...value}));setQuote(null);setError("");}
  async function act(path,input,success) {setBusy(true);setError("");try{const {data}=await api.post(path,input,bookingHeaders(token));setMessage(success);return data;}catch(e){setError(errorMessage(e));return null;}finally{setBusy(false);}}
  async function pay(outcome){const result=await act(`/bookings/${b.id}/changes/${quote.id}/pay`,{requestKey:crypto.randomUUID(),outcome},outcome==="SUCCESS"?"Đã áp dụng thay đổi.":"Booking cũ vẫn được giữ.");if(result){setQuote(result);history.retry();if(outcome==="SUCCESS")booking.retry();}}
  function toggle(service){const chosen=draft.extras[flightId]?.[index]||[];const ids=chosen.includes(service.id)?chosen.filter(id=>id!==service.id):[...chosen.filter(id=>services.data.find(s=>s.id===id)?.category!==service.category),service.id];patch({extras:{...draft.extras,[flightId]:{...draft.extras[flightId],[index]:ids}}});}
  return <main className="container page checkout-page"><div className="page-heading"><h1>Thay đổi và mua thêm dịch vụ</h1><p>Booking {code} · Báo giá có hạn 15 phút. Ghế và thay đổi được xác nhận khi thanh toán thành công.</p></div>
    {error&&<ErrorState message={error}/>} {message&&<p role="status" className="notice-panel">{message}</p>}
    {b.status==="CONFIRMED"&&!b.boardingPasses.length&&<>
      <p className="notice-panel">Phí đổi chuyến/hạng vé demo: Eco 100.000đ, Deluxe 50.000đ, SkyBoss/Business 0đ mỗi hành khách có ghế, mỗi chặng đổi. Đổi thông tin liên hệ miễn phí. Giá giảm không tự hoàn phần chênh lệch; hoàn vé dùng luồng riêng.</p>
      {draft.segments.map((s,i)=><ChangeLeg key={i} segment={s} count={eligible.length} onChange={value=>{const segments=[...draft.segments];segments[i]=value;patch({segments,extras:{...draft.extras,[value.flight.id]:value.flight.id===s.flight.id?draft.extras[s.flight.id]:{}},seats:{...draft.seats,[value.flight.id]:value.flight.id===s.flight.id&&value.fare.code===s.fare.code?draft.seats[s.flight.id]:{}}});}}/>)}
      <section className="panel"><h2>Dịch vụ và ghế</h2><div className="form-grid"><label>Chặng bay<select value={leg} onChange={e=>setLeg(Number(e.target.value))}>{draft.segments.map((s,i)=><option key={i} value={i}>{s.flight.origin.code} → {s.flight.destination.code}</option>)}</select></label><label>Hành khách<select value={index} onChange={e=>setPassenger(Number(e.target.value))}>{eligible.map(p=><option key={p.passengerIndex} value={p.passengerIndex}>{p.lastName} {p.firstName}</option>)}</select></label></div>
        {services.error?<ErrorState message={services.error} retry={services.retry}/>:services.data?.map(s=><label className="ancillary-option" key={s.id}><input type="checkbox" checked={(draft.extras[flightId]?.[index]||[]).includes(s.id)} onChange={()=>toggle(s)}/><span>{s.name}</span><b>{money(s.price)}</b></label>)}
        <SeatMap key={`${flightId}-${b.price.totalAmount}`} flightId={flightId} selected={draft.seats[flightId]?.[index]} ownedSeats={b.segments.find(s=>s.flight.id===flightId)?.seats.map(s=>s.seatNumber)||[]} otherSelections={Object.entries(draft.seats[flightId]||{}).filter(([p])=>Number(p)!==index).map(([,s])=>s)} onSelect={number=>patch({seats:{...draft.seats,[flightId]:{...draft.seats[flightId],[index]:number}}})}/>
      </section>
      <form className="panel" onSubmit={async e=>{e.preventDefault();const result=await act(`/bookings/${b.id}/changes`,bookingPayload(draft),"Đã tạo báo giá.");if(result){setQuote(result);history.retry();}}}>
        <h2>Thông tin hành khách và liên hệ</h2>{draft.passengers.map((p,i)=><div className="form-grid" key={i}>{["lastName","firstName"].map((key,j)=><label key={key}>{j===0?"Họ":"Tên đệm và tên"}<input required maxLength={100} value={p[key]} onChange={e=>{const passengers=[...draft.passengers];passengers[i]={...p,[key]:e.target.value};patch({passengers});}}/></label>)}</div>)}
        <div className="form-grid"><label>Email liên hệ<input type="email" required value={draft.contactEmail} onChange={e=>patch({contactEmail:e.target.value})}/></label><label>Điện thoại<input required pattern="[+0-9 ()-]{8,20}" value={draft.contactPhone} onChange={e=>patch({contactPhone:e.target.value})}/></label></div>
        <button className="button primary" disabled={busy}>Báo giá thay đổi</button>
      </form>
      {quote&&<section className="panel"><h2>Báo giá #{quote.id}</h2><p>Phí đổi: {money(quote.fee)} · Cần thanh toán thêm: <strong>{money(quote.amount)}</strong></p><p>{quote.status} · Hạn {new Date(quote.expiresAt).toLocaleString("vi-VN")}</p>{["PENDING","FAILED"].includes(quote.status)&&<div className="actions"><button className="button primary" disabled={busy} onClick={()=>pay("SUCCESS")}>Thanh toán thay đổi thành công</button><button className="button secondary" disabled={busy} onClick={()=>pay("FAILED")}>Thử thanh toán thất bại</button><button className="button secondary" disabled={busy} onClick={()=>pay("CANCELLED")}>Hủy thay đổi</button></div>}</section>}
    </>}
    {["CONFIRMED","CANCELLED"].includes(b.status)&&!b.boardingPasses.length&&<form className="panel" onSubmit={async e=>{e.preventDefault();const result=await act(`/bookings/${b.id}/refund`,Object.fromEntries(new FormData(e.currentTarget)),"Đã gửi yêu cầu hoàn vé.");if(result)history.retry();}}><h2>Yêu cầu hoàn vé</h2><p>Phí demo trên giá vé: Eco 20%, Deluxe 10%, SkyBoss/Business 0%; phí thay đổi trước đó không hoàn. Hệ thống tính số tiền và quản trị viên duyệt.</p><label>Lý do<textarea name="reason" required maxLength={2000}/></label><button className="button primary" disabled={busy}>Gửi yêu cầu hoàn vé</button></form>}
    <section className="panel"><h2>Lịch sử thay đổi và hoàn vé</h2>{history.error?<ErrorState message={history.error} retry={history.retry}/>:<>{history.data?.changes?.map(c=><p key={`c${c.id}`}>Thay đổi #{c.id} · {c.status} · {money(c.amount)}</p>)}{history.data?.refunds?.map(r=><p key={`r${r.id}`}>Hoàn vé #{r.id} · {r.status} · Phí {money(r.fee)} · Hoàn {money(r.amount)} · {r.staffNote}</p>)}</>}</section>
    <BookingDetails booking={b}/><Link className="button secondary" to="/my-booking">Về chuyến bay của tôi</Link>
  </main>;
}
