import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api,errorMessage,money,localDate } from "../api/client";
import { storeBooking } from "../utils/booking";
import { LoadingState,ErrorState } from "../components/common/States";
const resources={bookings:"Booking",refunds:"Hoàn vé",tickets:"Hỗ trợ",orders:"Đơn hàng",flights:"Chuyến bay",catalog:"Danh mục và nội dung",mail:"Hộp thư demo"};
const definitions={
  products:[["name","Tên sản phẩm"],["description","Mô tả","textarea"],["price","Giá","number"],["stock","Tồn khả dụng","number"],["active","Mở bán","checkbox"]],
  ancillaries:[["code","Mã dịch vụ"],["name","Tên dịch vụ"],["category","Nhóm dịch vụ","select",["BAGGAGE","MEAL","PRIORITY","INSURANCE"]],["description","Mô tả"],["price","Giá","number"]],
  promotions:[["code","Mã khuyến mại"],["percent","Phần trăm giảm","number"],["maxDiscount","Giảm tối đa","number"],["expiresOn","Hạn dùng","date"]],
  content:[["category","Nhóm nội dung","select",["HERO","FEATURE","SERVICE","SHOP","TRAVEL","DESTINATION","FAQ","MEDIA","ACHIEVEMENT"]],["title","Tiêu đề"],["description","Nội dung","textarea"],["image","Đường dẫn ảnh"],["target","Liên kết hoặc mã chủ đề"],["sortOrder","Thứ tự","number"]],
  flights:[["flightNumber","Số hiệu chuyến"],["origin","Sân bay đi"],["destination","Sân bay đến"],["departureTime","Giờ đi","datetime-local"],["arrivalTime","Giờ đến","datetime-local"],["capacity","Sức chứa","number"],["aircraft","Tàu bay"],["ecoPrice","Giá Eco","number"],["deluxePrice","Giá Deluxe","number"],["skybossPrice","Giá SkyBoss","number"],["businessPrice","Giá Business","number"]],
};
function Editor({kind,item,save,cancel,busy}) {
  function submit(e){e.preventDefault();const form=e.currentTarget;const values=Object.fromEntries(new FormData(form));for(const [key,,type] of definitions[kind]){if(type==="number")values[key]=Number(values[key]);if(type==="checkbox")values[key]=form.elements.namedItem(key).checked;if(type==="datetime-local")values[key]=new Date(values[key]).toISOString();}save(`/admin/${kind}${item?.id?`/${item.id}`:""}`,values);}
  const value=key=>{if(kind==="flights"){if(key==="origin"||key==="destination")return item?.[key]?.code||"";if(key.endsWith("Price"))return item?.fares?.find(f=>f.code===key.replace("Price","").toUpperCase())?.price||0;if(key.endsWith("Time")&&item?.[key]){const d=new Date(item[key]);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}}return item?.[key]??(key==="expiresOn"?localDate(365):key==="capacity"?71:"");};
  return <form className="panel" onSubmit={submit}><h2>{item?.id?"Sửa":"Thêm"} {kind==="flights"?"chuyến bay":"danh mục"}</h2><div className="form-grid">{definitions[kind].map(([key,label,type="text",options])=><label key={key}>{label}{type==="select"?<select name={key} defaultValue={value(key)||options[0]}>{options.map(o=><option key={o}>{o}</option>)}</select>:type==="textarea"?<textarea name={key} required maxLength={2000} defaultValue={value(key)}/>:<input name={key} type={type} required={type!=="checkbox"&&key!=="image"} maxLength={type==="text"?255:undefined} min={type==="number"?0:undefined} step={type==="number"?"0.01":undefined} defaultValue={type!=="checkbox"?value(key):undefined} defaultChecked={type==="checkbox"?!!item?.[key]:undefined}/>}</label>)}</div><button className="button primary" disabled={busy}>Lưu thay đổi</button><button type="button" className="button secondary" onClick={cancel}>Đóng form</button></form>;
}
export default function AdminPage() {
  const logged=!!sessionStorage.getItem("demo-auth");const [resource,setResource]=useState("bookings");const [page,setPage]=useState(0);const data=useApi(logged?`/admin/${resource}?page=${page}&size=20`:null);
  const [editor,setEditor]=useState(null);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [message,setMessage]=useState("");
  async function save(path,input){setBusy(true);setError("");try{await api.post(path,input);setMessage("Đã lưu xử lý.");setEditor(null);data.retry();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}}
  const submit=(e,path)=>{e.preventDefault();save(path,Object.fromEntries(new FormData(e.currentTarget)));};
  return <main className="container page checkout-page"><div className="page-heading"><h1>Quản trị nghiệp vụ</h1><p>Chỉ tài khoản ADMIN được truy cập dữ liệu và thao tác quản trị.</p></div>
    {!logged?<Link to="/auth" className="button primary">Đăng nhập</Link>:<>
      <div className="actions">{Object.entries(resources).map(([key,label])=><button key={key} className={`button ${resource===key?"primary":"secondary"}`} onClick={()=>{setResource(key);setPage(0);setEditor(null);}}>{label}</button>)}</div>
      {error&&<ErrorState message={error}/>} {message&&<p role="status" className="notice-panel">{message}</p>}
      {editor&&<Editor key={`${editor.kind}-${editor.item?.id||"new"}`} {...editor} save={save} busy={busy} cancel={()=>setEditor(null)}/>}
      {data.loading?<LoadingState/>:data.error?<ErrorState message={data.error} retry={data.retry}/>:resource==="catalog"?Object.entries(data.data).map(([kind,rows])=><section className="panel" key={kind}><h2>{{products:"Sản phẩm",ancillaries:"Dịch vụ",promotions:"Khuyến mại",content:"Nội dung"}[kind]}</h2><button className="button primary" onClick={()=>setEditor({kind,item:null})}>Thêm mục</button>{rows.map(r=><div className="account-booking" key={r.id}><span>#{r.id} · {r.name||r.title||r.code} {r.price!=null?money(r.price):""}</span><button className="button secondary" onClick={()=>setEditor({kind,item:r})}>Sửa</button></div>)}</section>):<>
        {resource==="flights"&&<button className="button primary" onClick={()=>setEditor({kind:"flights",item:null})}>Thêm chuyến bay</button>}
        {data.data.length===0&&<p>Chưa có dữ liệu.</p>}{data.data.map(r=><section className="panel" key={r.id}>
          {resource==="bookings"&&<><h2>{r.code} · {r.status}</h2><p>{r.contactEmail} · {money(r.price.totalAmount)}</p><Link className="button secondary" to="/my-booking" state={{booking:r}} onClick={()=>storeBooking(r)}>Mở booking</Link></>}
          {resource==="refunds"&&<><h2>Hoàn vé #{r.id} · {r.status}</h2><p>Booking #{r.bookingId} · {r.reason}</p><p>Phí {money(r.fee)} · Hoàn {money(r.amount)} · {r.staffNote}</p>{["REQUESTED","APPROVED"].includes(r.status)&&<form onSubmit={e=>submit(e,`/admin/refunds/${r.id}`)}><label>Thao tác<select name="action">{r.status==="APPROVED"?<option value="COMPLETE">Hoàn tiền demo</option>:<><option value="APPROVE">Duyệt yêu cầu</option><option value="REJECT">Từ chối</option></>}</select></label><label>Ghi chú xử lý<textarea name="note" required maxLength={2000}/></label><button className="button primary" disabled={busy}>Xác nhận xử lý</button></form>}</>}
          {resource==="tickets"&&<><h2>#{r.id} · {r.subject} · {r.status}</h2>{r.messages.map(m=><p className="notice-panel" key={m.id}>{m.staff?"Nhân viên":"Khách hàng"}: {m.body}</p>)}{r.status!=="CLOSED"&&<><form onSubmit={e=>submit(e,`/admin/tickets/${r.id}/reply`)}><label>Trả lời<textarea name="body" required maxLength={4000}/></label><button className="button primary" disabled={busy}>Gửi phản hồi</button></form><button className="button secondary" disabled={busy} onClick={()=>save(`/admin/tickets/${r.id}/close`,{})}>Đóng yêu cầu</button></>}</>}
          {resource==="orders"&&<><h2>Đơn #{r.id} · {r.status}</h2><p>{money(r.total)} · {r.delivery} · {r.bookingCode}</p>{r.items.map(i=><p key={i.productId}>{i.name} × {i.quantity}</p>)}{r.status==="PAID"&&<button className="button primary" disabled={busy} onClick={()=>save(`/admin/orders/${r.id}/fulfill`,{})}>Xác nhận giao hàng demo</button>}</>}
          {resource==="mail"&&<><h2>{r.subject}</h2><p>Gửi tới {r.recipient}</p><p>Hộp thư local của bản demo. Email thật chưa được gửi.</p><a href={r.body}>Mở hướng dẫn khôi phục mật khẩu</a></>}
          {resource==="flights"&&<><h2>{r.flightNumber} · {r.origin.code} → {r.destination.code}</h2><p>{new Date(r.departureTime).toLocaleString("vi-VN")} · Còn {r.remainingSeats} ghế</p><button className="button secondary" onClick={()=>setEditor({kind:"flights",item:r})}>Sửa chuyến và giá</button></>}
        </section>)}<div className="actions"><button className="button secondary" disabled={page===0} onClick={()=>setPage(page-1)}>Trang trước</button><span>Trang {page+1}</span><button className="button secondary" disabled={data.data.length<20} onClick={()=>setPage(page+1)}>Trang sau</button></div>
      </>}
    </>}
  </main>;
}
