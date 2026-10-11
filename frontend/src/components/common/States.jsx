import {LoaderCircle,AlertCircle,Plane} from 'lucide-react';
export function LoadingState({label='Đang tải dữ liệu...'}) {return <div className="state" role="status"><LoaderCircle className="spin"/><p>{label}</p></div>;}
export function ErrorState({message,retry}) {return <div className="state error" role="alert"><AlertCircle/><p>{message}</p>{retry&&<button className="button secondary" onClick={retry}>Thử lại</button>}</div>;}
export function EmptyState({children}) {return <div className="state"><Plane/><p>{children||'Chưa có dữ liệu phù hợp.'}</p></div>;}
