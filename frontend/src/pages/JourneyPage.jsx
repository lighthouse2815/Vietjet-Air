import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useBooking } from "../context/BookingContext";
import { localDate,money } from "../api/client";
import FlightCard from "../components/flights/FlightCard";
import { LoadingState,ErrorState,EmptyState } from "../components/common/States";
function JourneyLeg({leg,index,count,airports,selected,change,select}) {
  const ready=leg.origin&&leg.destination&&leg.origin!==leg.destination&&leg.date&&count>0&&count<=30;
  const flights=useApi(ready?`/flights/search?${new URLSearchParams({...leg,passengers:count})}`:null);
  return <section className="panel"><h2>Chặng {index+1}</h2><div className="form-grid">
    {["origin","destination"].map((key,i)=><label key={key}>{i===0?"Điểm khởi hành":"Điểm đến"}<select value={leg[key]} onChange={e=>change({[key]:e.target.value})} required>{airports.map(a=><option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}</select></label>)}
    <label>Ngày bay<input type="date" min={localDate()} value={leg.date} required onChange={e=>change({date:e.target.value})}/></label></div>
    {!ready?<p>Chọn hai sân bay khác nhau và ngày bay hợp lệ.</p>:flights.loading?<LoadingState/>:flights.error?<ErrorState message={flights.error} retry={flights.retry}/>:flights.data.length===0?<EmptyState>Không có chuyến còn đủ ghế. Chọn ngày hoặc tuyến khác.</EmptyState>:flights.data.map(f=><FlightCard key={f.id} flight={f} selected={selected} onSelect={select}/>)}
  </section>;
}
export default function JourneyPage({group=false}) {
  const type=group?"GROUP":"MULTI_CITY";const {draft,update}=useBooking();const navigate=useNavigate();const airports=useApi("/airports");
  const same=draft.search?.type===type;
  const [legs,setLegs]=useState(same?draft.search.legs:[{origin:"SGN",destination:"HAN",date:localDate(1)},{origin:"HAN",destination:group?"SGN":"DAD",date:localDate(2)},...(!group?[{origin:"DAD",destination:"SGN",date:localDate(3)}]:[])]);
  const [chosen,setChosen]=useState(same?draft.segments:[]);const [counts,setCounts]=useState(same?{adults:draft.search.adults,children:draft.search.children,infants:draft.search.infants}:{adults:group?10:1,children:0,infants:0});const [error,setError]=useState("");
  const total=counts.adults+counts.children+counts.infants;const count=counts.adults+counts.children;const limit=group?30:9;
  function change(index,patch){const next=[...legs];next[index]={...next[index],...patch};const selected=[...chosen];selected[index]=null;if(patch.destination&&next[index+1]){next[index+1]={...next[index+1],origin:patch.destination};selected[index+1]=null;}setLegs(next);setChosen(selected);}
  function next(){setError("");if(total>limit||counts.adults<1||counts.infants>counts.adults){setError(`Tối đa ${limit} hành khách; cần người lớn đi kèm mỗi em bé.`);return;}
    if(legs.some((_,i)=>!chosen[i])){setError("Chọn chuyến và hạng vé cho tất cả các chặng.");return;}
    for(let i=1;i<chosen.length;i++)if(chosen[i].flight.origin.code!==chosen[i-1].flight.destination.code||new Date(chosen[i].flight.departureTime)<=new Date(chosen[i-1].flight.arrivalTime)){setError("Các chặng phải nối tiếp và khởi hành sau giờ đến chặng trước.");return;}
    const sameFlights=same&&chosen.length===draft.segments.length&&chosen.every((s,i)=>s.flight.id===draft.segments[i].flight.id&&s.fare.code===draft.segments[i].fare.code);
    update({search:{type,legs,...counts},segments:chosen,passengers:same&&counts.adults===draft.search.adults&&counts.children===draft.search.children&&counts.infants===draft.search.infants?draft.passengers:[],extras:sameFlights?draft.extras:{},seats:sameFlights?draft.seats:{},booking:null});navigate("/booking/passengers");
  }
  return <main className="container page checkout-page"><div className="page-heading"><h1>{group?"Đặt vé theo nhóm":"Đặt vé nhiều chặng"}</h1><p>{group?"Tối đa 30 hành khách cùng hành trình, giá và sức chứa được kiểm tra tại máy chủ.":"Chọn từ hai đến sáu chặng nối tiếp, tối đa chín hành khách."}</p></div>
    <section className="panel"><h2>Hành khách</h2><div className="form-grid">{["adults","children","infants"].map((key,i)=><label key={key}>{["Người lớn","Trẻ em","Em bé"][i]}<input type="number" min={i===0?1:0} max={limit} value={counts[key]} onChange={e=>{setCounts({...counts,[key]:Math.max(i===0?1:0,Math.min(limit,Number(e.target.value)))});setChosen([]);}}/></label>)}</div><p>Tổng {total} hành khách · {count} người có ghế</p></section>
    {airports.error?<ErrorState message={airports.error} retry={airports.retry}/>:airports.loading?<LoadingState/>:legs.map((leg,i)=><JourneyLeg key={i} leg={leg} index={i} count={count} airports={airports.data} selected={chosen[i]} change={patch=>change(i,patch)} select={s=>{const next=[...chosen];next[i]=s;setChosen(next);}}/>)}
    <div className="actions">{!group&&legs.length<6&&<button className="button secondary" onClick={()=>setLegs([...legs,{origin:legs.at(-1).destination,destination:legs[0].origin,date:localDate(legs.length+1)}])}>Thêm chặng</button>}{legs.length>(group?1:2)&&<button className="button secondary" onClick={()=>{setLegs(legs.slice(0,-1));setChosen(chosen.slice(0,-1));}}>Bỏ chặng cuối</button>}{group&&legs.length===1&&<button className="button secondary" onClick={()=>setLegs([...legs,{origin:legs[0].destination,destination:legs[0].origin,date:localDate(2)}])}>Thêm chuyến về</button>}</div>
    {error&&<ErrorState message={error}/>}<div className="selection-bar"><p>Giá vé tạm tính {money(chosen.filter(Boolean).reduce((sum,s)=>sum+s.fare.price*(counts.adults+counts.children*.75+counts.infants*.1),0))}</p><button className="button primary" disabled={total>limit||legs.some((_,i)=>!chosen[i])} onClick={next}>Tiếp tục</button></div>
  </main>;
}
