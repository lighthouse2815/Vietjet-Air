import {Link} from 'react-router-dom';
export default function NotFoundPage(){return <main className="container page"><div className="panel state"><h1>404 · Không tìm thấy trang</h1><p>Đường dẫn này chưa tồn tại. Hãy trở về trang chủ để bắt đầu hành trình.</p><Link className="button primary" to="/">Về trang chủ</Link></div></main>;}
