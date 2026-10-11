import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Navigate, Link } from "react-router-dom";
import { api, bookingHeaders, money, errorMessage } from "../api/client";
import { useApi } from "../hooks/useApi";
import { bookingPayload, storeBooking } from "../utils/booking";
import SeatMap from "../components/booking/SeatMap";
import BookingDetails from "../components/booking/BookingDetails";
import { LoadingState, ErrorState } from "../components/common/States";
const day = date => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(date));
function ChangeLeg({segment,onChange,count}) {
  useTranslation();
  const [date,setDate]=useState(day(segment.flight.departureTime));
  const flights=useApi(`/flights/search?${new URLSearchParams({origin:segment.flight.origin.code,destination:segment.flight.destination.code,date,passengers:count})}`);
  return <div className="panel"><h3>{segment.flight.origin.code} → {segment.flight.destination.code}</h3><label>{t("Ngày bay muốn đổi")}<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    {flights.loading?<LoadingState/>:flights.error?<ErrorState message={flights.error} retry={flights.retry}/>:<label>{t("Chuyến bay")}<select value={flights.data.some(f=>f.id===segment.flight.id)?segment.flight.id:""} onChange={e=>{const f=flights.data.find(f=>f.id===Number(e.target.value));if(f)onChange({flight:f,fare:f.fares.find(v=>v.code===segment.fare.code)||f.fares[0]});}}><option value="">{t("Chọn chuyến bay trong ngày")}</option>{flights.data.map(f=><option key={f.id} value={f.id}>{f.flightNumber} · {new Date(f.departureTime).toLocaleTimeString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",hour:"2-digit",minute:"2-digit"})}</option>)}</select></label>}
    <p>{t("Đang chọn: ")}{segment.flight.flightNumber} · {day(segment.flight.departureTime)}</p>
    <label>{t("Hạng vé")}<select value={segment.fare.code} onChange={e=>onChange({...segment,fare:segment.flight.fares.find(f=>f.code===e.target.value)})}>{segment.flight.fares.map(f=><option key={f.code} value={f.code}>{t(f.name)} · {money(f.price)}</option>)}</select></label>
  </div>;
}
export default function BookingManagePage() {
  useTranslation();
  const {code}=useParams();const token=sessionStorage.getItem(`booking-token-${code}`);
  const [params]=useSearchParams();const requestedService=Number(params.get("service"));
  const booking=useApi(token?`/bookings/${code}`:null,token);const services=useApi("/ancillary-services");
  const history=useApi(booking.data?.id?`/bookings/${booking.data.id}/history`:null,token);
  const [draft,setDraft]=useState(null);const [quote,setQuote]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  const [leg,setLeg]=useState(0);const [passenger,setPassenger]=useState(0);
  useEffect(()=>{const b=booking.data;if(!b?.id)return;
    const extras={},seats={};b.extras.forEach(e=>{extras[e.flightId]||={};(extras[e.flightId][e.passengerIndex]||=[]).push(e.service.id);});b.segments.forEach(s=>{seats[s.flight.id]={};s.seats.forEach(v=>{seats[s.flight.id][v.passengerIndex]=v.seatNumber;});});
    setDraft({journeyType:b.journeyType,segments:b.segments,passengers:b.passengers,contactEmail:b.contactEmail,contactPhone:b.contactPhone,promotionCode:"",extras,seats});setQuote(null);
  },[booking.data]);
  useEffect(() => {
    const service = services.data?.find(item => item.id === requestedService);
    if (!service || booking.data?.status !== "CONFIRMED" || booking.data.boardingPasses.length) return;
    setQuote(null);
    setDraft(current => {
      if (!current) return current;
      const flight = current.segments[0].flight.id;
      const traveler = current.passengers.find(person => person.type !== "INFANT");
      if (!traveler) return current;
      const chosen = current.extras[flight]?.[traveler.passengerIndex] || [];
      if (chosen.includes(service.id)) return current;
      const ids = [...chosen.filter(id => services.data.find(item => item.id === id)?.category !== service.category), service.id];
      return { ...current, extras: { ...current.extras, [flight]: { ...current.extras[flight], [traveler.passengerIndex]: ids } } };
    });
  }, [requestedService,services.data,booking.data]);
  const ready=!!draft;
  useEffect(() => {
    if (ready && requestedService) document.getElementById("services")?.scrollIntoView({ block: "start" });
  }, [ready,requestedService]);
  if(!token)return <Navigate to="/my-booking" replace/>;
  if(booking.loading || !draft)return booking.error?<ErrorState message={booking.error} retry={booking.retry}/>:<LoadingState/>;
  const b=booking.data;const segment=draft.segments[leg];const flightId=segment.flight.id;const eligible=draft.passengers.filter(p=>p.type!=="INFANT");const selected=eligible.find(p=>p.passengerIndex===passenger)||eligible[0];const index=selected.passengerIndex;
  function patch(value){setDraft(current=>({...current,...value}));setQuote(null);setError("");}
  async function act(path,input,success) {setBusy(true);setError("");try{const {data}=await api.post(path,input,bookingHeaders(token));setMessage(success);return data;}catch(e){setError(errorMessage(e));return null;}finally{setBusy(false);}}
  async function pay(outcome){const result=await act(`/bookings/${b.id}/changes/${quote.id}/pay`,{requestKey:crypto.randomUUID(),outcome},outcome==="SUCCESS"?"Đã áp dụng thay đổi.":"Booking cũ vẫn được giữ.");if(result){setQuote(result);history.retry();if(outcome==="SUCCESS")booking.retry();}}
  function toggle(service){const chosen=draft.extras[flightId]?.[index]||[];const ids=chosen.includes(service.id)?chosen.filter(id=>id!==service.id):[...chosen.filter(id=>services.data.find(s=>s.id===id)?.category!==service.category),service.id];patch({extras:{...draft.extras,[flightId]:{...draft.extras[flightId],[index]:ids}}});}
  return <main className="container page checkout-page"><div className="page-heading"><h1>{t("Thay đổi và mua thêm dịch vụ")}</h1><p>{t("Booking ")}{code}{t(" · Báo giá có hạn 15 phút. Ghế và thay đổi được xác nhận khi thanh toán thành công.")}</p></div>
    {error&&<ErrorState message={t(error)}/>} {message&&<p role="status" className="notice-panel">{t(message)}</p>}
    {b.status==="CONFIRMED"&&!b.boardingPasses.length&&<>
      <p className="notice-panel">{t("Phí đổi chuyến/hạng vé demo: Eco 100.000đ, Deluxe 50.000đ, SkyBoss/Business 0đ mỗi hành khách có ghế, mỗi chặng đổi. Đổi thông tin liên hệ miễn phí. Giá giảm không tự hoàn phần chênh lệch; hoàn vé dùng luồng riêng.")}</p>
      {draft.segments.map((s,i)=><ChangeLeg key={i} segment={s} count={eligible.length} onChange={value=>{const segments=[...draft.segments];segments[i]=value;patch({segments,extras:{...draft.extras,[value.flight.id]:value.flight.id===s.flight.id?draft.extras[s.flight.id]:{}},seats:{...draft.seats,[value.flight.id]:value.flight.id===s.flight.id&&value.fare.code===s.fare.code?draft.seats[s.flight.id]:{}}});}}/>)}
      <section className="panel" id="services"><h2>{t("Dịch vụ và ghế")}</h2><div className="form-grid"><label>{t("Chặng bay")}<select value={leg} onChange={e=>setLeg(Number(e.target.value))}>{draft.segments.map((s,i)=><option key={i} value={i}>{s.flight.origin.code} → {s.flight.destination.code}</option>)}</select></label><label>{t("Hành khách")}<select value={index} onChange={e=>setPassenger(Number(e.target.value))}>{eligible.map(p=><option key={p.passengerIndex} value={p.passengerIndex}>{p.lastName} {p.firstName}</option>)}</select></label></div>
        {services.error?<ErrorState message={services.error} retry={services.retry}/>:services.data?.map(s=><label className="ancillary-option" key={s.id}><input type="checkbox" checked={(draft.extras[flightId]?.[index]||[]).includes(s.id)} onChange={()=>toggle(s)}/><span>{t(s.name)}</span><b>{money(s.price)}</b></label>)}
        <SeatMap key={`${flightId}-${b.price.totalAmount}`} flightId={flightId} selected={draft.seats[flightId]?.[index]} ownedSeats={b.segments.find(s=>s.flight.id===flightId)?.seats.map(s=>s.seatNumber)||[]} otherSelections={Object.entries(draft.seats[flightId]||{}).filter(([p])=>Number(p)!==index).map(([,s])=>s)} onSelect={number=>patch({seats:{...draft.seats,[flightId]:{...draft.seats[flightId],[index]:number}}})}/>
      </section>
      <form className="panel" onSubmit={async e=>{e.preventDefault();const result=await act(`/bookings/${b.id}/changes`,bookingPayload(draft),t("Đã tạo báo giá."));if(result){setQuote(result);history.retry();}}}>
        <h2>{t("Thông tin hành khách và liên hệ")}</h2>{draft.passengers.map((p,i)=><div className="form-grid" key={i}>{["lastName","firstName"].map((key,j)=><label key={key}>{j===0?t("Họ"):t("Tên đệm và tên")}<input required maxLength={100} value={p[key]} onChange={e=>{const passengers=[...draft.passengers];passengers[i]={...p,[key]:e.target.value};patch({passengers});}}/></label>)}</div>)}
        <div className="form-grid"><label>{t("Email liên hệ")}<input type="email" required value={draft.contactEmail} onChange={e=>patch({contactEmail:e.target.value})}/></label><label>{t("Điện thoại")}<input required pattern="[+0-9 ()-]{8,20}" value={draft.contactPhone} onChange={e=>patch({contactPhone:e.target.value})}/></label></div>
        <button className="button primary" disabled={busy}>{t("Báo giá thay đổi")}</button>
      </form>
      {quote&&<section className="panel"><h2>{t("Báo giá #")}{quote.id}</h2><p>{t("Phí đổi: ")}{money(quote.fee)}{t(" · Cần thanh toán thêm: ")}<strong>{money(quote.amount)}</strong></p><p>{t(quote.status)}{t(" · Hạn ")}{new Date(quote.expiresAt).toLocaleString("vi-VN")}</p>{["PENDING","FAILED"].includes(quote.status)&&<div className="actions"><button className="button primary" disabled={busy} onClick={()=>pay("SUCCESS")}>{t("Thanh toán thay đổi thành công")}</button><button className="button secondary" disabled={busy} onClick={()=>pay("FAILED")}>{t("Thử thanh toán thất bại")}</button><button className="button secondary" disabled={busy} onClick={()=>pay("CANCELLED")}>{t("Hủy thay đổi")}</button></div>}</section>}
    </>}
    {["CONFIRMED","CANCELLED"].includes(b.status)&&!b.boardingPasses.length&&<form className="panel" onSubmit={async e=>{e.preventDefault();const result=await act(`/bookings/${b.id}/refund`,Object.fromEntries(new FormData(e.currentTarget)),t("Đã gửi yêu cầu hoàn vé."));if(result)history.retry();}}><h2>{t("Yêu cầu hoàn vé")}</h2><p>{t("Phí demo trên giá vé: Eco 20%, Deluxe 10%, SkyBoss/Business 0%; phí thay đổi trước đó không hoàn. Hệ thống tính số tiền và quản trị viên duyệt.")}</p><label>{t("Lý do")}<textarea name="reason" required maxLength={2000}/></label><button className="button primary" disabled={busy}>{t("Gửi yêu cầu hoàn vé")}</button></form>}
    <section className="panel"><h2>{t("Lịch sử thay đổi và hoàn vé")}</h2>{history.error?<ErrorState message={history.error} retry={history.retry}/>:<>{history.data?.changes?.map(c=><p key={`c${c.id}`}>{t("Thay đổi #")}{c.id} · {t(c.status)} · {money(c.amount)}</p>)}{history.data?.refunds?.map(r=><p key={`r${r.id}`}>{t("Hoàn vé #")}{r.id} · {t(r.status)}{t(" · Phí ")}{money(r.fee)}{t(" · Hoàn ")}{money(r.amount)} · {r.staffNote}</p>)}</>}</section>
    <BookingDetails booking={b}/><Link className="button secondary" to="/my-booking">{t("Về chuyến bay của tôi")}</Link>
  </main>;
}
