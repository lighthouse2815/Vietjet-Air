import axios from 'axios';
export const api = axios.create({baseURL:import.meta.env.VITE_API_URL || '/api',timeout:20000});
api.interceptors.request.use(config => {
  const token=sessionStorage.getItem('demo-auth');
  if(token) config.headers.Authorization=`Bearer ${token}`;
  return config;
});
export const bookingHeaders = token => ({headers:{'X-Booking-Token':token}});
export const errorMessage = error => error.response?.data?.message || (error.code==='ECONNABORTED'?'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.':'Không kết nối được máy chủ. Vui lòng thử lại.');
export const money = value => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(value || 0);
export const dateLabel = date => new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(date));
export const timeLabel = date => new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(date));
export function localDate(offset=0) {
  const date=new Date();date.setDate(date.getDate()+offset);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
