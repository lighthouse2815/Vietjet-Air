import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import "../styles/commerce.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage, money } from "../api/client";
import { useApi } from "../hooks/useApi";
import { LoadingState, ErrorState } from "../components/common/States";
import SkyShopStorefront from "../components/home/SkyShopStorefront";
import StatsSection from "../components/home/StatsSection";
import VoucherStorefront from "../components/home/VoucherStorefront";
export default function CommercePage({kind}) {
  useTranslation();
  const logged=!!sessionStorage.getItem("demo-auth");
  const products=useApi(kind==="shop"?"/commerce/products":null);
  const records=useApi(logged?`/commerce/account/${kind==="shop"?"orders":kind==="loyalty"?"wallet":"vouchers"}`:null);
  const bookings=useApi(logged&&kind==="shop"?"/auth/bookings":null);
  const [cart,setCart]=useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("skyshop-cart") || "{}");
      return Object.fromEntries(Object.entries(saved).filter(([id, quantity]) => /^\d+$/.test(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 10));
    } catch { return {}; }
  });
  const [bookingCode,setBookingCode]=useState("");
  useEffect(() => { if (kind === "shop") sessionStorage.setItem("skyshop-cart", JSON.stringify(cart)); }, [cart,kind]);
  useEffect(() => {
    if (kind === "shop" && products.data) setCart((current) => Object.fromEntries(products.data
      .filter((product) => current[product.id] > 0 && product.stock > 0)
      .map((product) => [product.id, Math.min(current[product.id], product.stock, 10)])));
  }, [kind,products.data]);
  const [error,setError]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  const titles={shop:"Cửa hàng nội bộ",loyalty:"Hội viên và điểm thưởng"};
  async function send(path,input,success){setBusy(true);setError("");try{const {data}=await api.post(path,input);setMessage(success);records.retry();products.retry();return data;}catch(e){setError(errorMessage(e));return null;}finally{setBusy(false);}}
  async function checkout(e){e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));values.bookingToken=bookings.data?.find(b=>b.code===values.bookingCode)?.accessToken;values.items=Object.entries(cart).filter(([,q])=>q>0).map(([id,quantity])=>({productId:Number(id),quantity:Number(quantity)}));values.requestKey=crypto.randomUUID();const order=await send("/commerce/account/orders",values,"Đã tạo đơn và giữ hàng 15 phút.");if(order)setCart({});}
  const pay=(type,id,outcome)=>send(`/commerce/account/${type}/${id}/pay`,{requestKey:crypto.randomUUID(),outcome},outcome==="SUCCESS"?"Thanh toán demo thành công.":"Đã ghi nhận kết quả thanh toán.");
  if (kind === "voucher") return <VoucherStorefront records={records} send={send} pay={pay} logged={logged} busy={busy} error={error} message={message} />;
  return <main className={kind === "shop" ? "skyshop-page" : "container page checkout-page"}
    onLoadCapture={kind === "shop" ? (event) => { if (event.target.tagName === "IMG") event.target.classList.add("home-image-loaded"); } : undefined}>
    {kind === "shop" && <SkyShopStorefront products={products} bookings={bookings} cart={cart} setCart={setCart} bookingCode={bookingCode} setBookingCode={setBookingCode} logged={logged} />}
    <div className={kind === "shop" ? "container skyshop-account" : undefined} id={kind === "shop" ? "skyshop-cart" : undefined}>
    {kind !== "shop" && <div className="page-heading"><h1>{t(titles[kind])}</h1><p>{t("Sản phẩm, voucher và điểm chỉ có giá trị trong bản demo này.")}</p></div>}
    <div className="actions"><Link className="button secondary" to="/services/skyshop">{t("Cửa hàng")}</Link><Link className="button secondary" to="/services/voucher">{t("Voucher")}</Link><Link className="button secondary" to="/services/skyjoy">{t("Điểm thưởng")}</Link></div>
    {error&&<ErrorState message={t(error)}/>} {message&&<p role="status" className="notice-panel">{t(message)}</p>}
    {!logged&&<p className="notice-panel"><Link to="/auth">{t("Đăng nhập")}</Link>{t(" để mua hàng, nhận voucher và dùng điểm.")}</p>}
    {kind==="shop"&&<>
      {!logged && <section className="panel"><h2>{t("Giỏ hàng")}</h2>{products.data?.filter(p => cart[p.id] > 0).map(p => <p key={p.id}>{t(p.name)} × {cart[p.id]} · {money(p.price * cart[p.id])}</p>)}<p>{t("Tổng dự kiến: ")}{money(products.data?.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0))}</p><Link className="button primary" to="/auth">{t("Đăng nhập để thanh toán")}</Link></section>}
      {logged&&<form className="panel" onSubmit={checkout}><h2>{t("Giỏ hàng")}</h2><p>{t("Tổng dự kiến: ")}{money(products.data?.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0))}{t(". Máy chủ xác nhận lại giá và tồn kho khi tạo đơn.")}</p><div className="form-grid"><label>{t("Cách nhận")}<select name="delivery"><option value="PICKUP">{t("Nhận tại quầy demo")}</option><option value="ON_BOARD">{t("Nhận theo chuyến bay")}</option></select></label><label>{t("Chuyến bay nhận hàng")}<select name="bookingCode" value={bookingCode} onChange={event=>setBookingCode(event.target.value)}><option value="">{t("Không kèm chuyến bay")}</option>{bookings.data?.filter(b=>b.status==="CONFIRMED").map(b=><option key={b.id} value={b.code}>{b.code} · {b.segments.map(s=>s.flight.flightNumber).join(" / ")}</option>)}</select></label></div><button className="button primary" disabled={busy||!Object.values(cart).some(q=>q>0)}>{t("Tạo đơn hàng")}</button></form>}
      {!logged && <section className="panel" id="skyshop-orders"><h2>{t("Đơn hàng của tôi")}</h2><p>{t("Đăng nhập để xem đơn hàng SkyShop.")}</p><Link to="/auth">{t("Đăng nhập")}</Link></section>}
    </>}
    {logged&&(records.loading?<LoadingState/>:records.error?<ErrorState message={records.error} retry={records.retry}/>:kind==="loyalty"?<>
      <section className="panel"><h2>{t("Hạng ")}{records.data.tier}</h2><p>{t("Số dư: ")}<strong>{records.data.points}{t(" điểm")}</strong>{t(" · Chi tiêu hợp lệ ")}{money(records.data.spend)}</p><p>{t("Mỗi 10.000đ chi tiêu vé/dịch vụ/cửa hàng đã thanh toán được một điểm. Hoàn/hủy đảo điểm đã cộng; không tích điểm từ phần thanh toán bằng voucher.")}</p><form onSubmit={e=>{e.preventDefault();const points=Number(new FormData(e.currentTarget).get("points"));send("/commerce/account/wallet/redeem",{points,requestKey:crypto.randomUUID()},t("Đã đổi điểm thành voucher."));}}><label>{t("Số điểm đổi")}<input name="points" type="number" required min="100" step="100" max={Math.max(0,records.data.points)}/></label><p>{t("100 điểm đổi voucher 100.000đ.")}</p><button className="button primary" disabled={busy||records.data.points<100}>{t("Đổi điểm lấy voucher")}</button></form></section>
      <section className="panel"><h2>{t("Lịch sử điểm")}</h2>{records.data.entries.map(l=><p key={l.id}>{l.delta>0?"+":""}{l.delta} · {t(l.description)} · {new Date(l.createdAt).toLocaleString("vi-VN")}</p>)}</section>
    </>:<section className="panel" id="skyshop-orders"><h2>{t("Đơn hàng của tôi")}</h2>{records.data.length===0?<p>{t("Chưa có dữ liệu.")}</p>:records.data.map(r=><article className="panel" key={r.id}><h3>{t("Đơn #{{v0}}", {v0: r.id})}</h3><p>{t(r.status)} · {money(r.total)}</p><p>{t(r.delivery)} · {r.bookingCode||t("Không kèm chuyến bay")}</p>{r.items.map(i=><p key={i.productId}>{t(i.name)}{t(" × ")}{i.quantity} · {money(i.price)}</p>)}
      {["PENDING","FAILED"].includes(r.status)&&<div className="actions"><button className="button primary" disabled={busy} onClick={()=>pay("orders",r.id,"SUCCESS")}>{t("Thanh toán thành công")}</button><button className="button secondary" disabled={busy} onClick={()=>pay("orders",r.id,"FAILED")}>{t("Thử thất bại")}</button></div>}
      {!["CANCELLED","EXPIRED","FULFILLED"].includes(r.status)&&<button className="button secondary" disabled={busy} onClick={()=>send(`/commerce/account/orders/${r.id}/cancel`,{},t("Đã hủy theo điều kiện demo."))}>{t("Hủy ")}{t("đơn hàng")}</button>}</article>)}</section>)}
    </div>
    {kind === "shop" && <StatsSection className="skyshop-stats" />}
  </main>;
}
