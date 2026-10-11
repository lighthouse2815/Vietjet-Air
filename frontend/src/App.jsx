import {useEffect} from 'react';
import {Routes,Route,useLocation} from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import NotFoundPage from './pages/NotFoundPage';
export default function App(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0);},[pathname]);return <><a className="skip-link" href="#main-content">Đến nội dung chính</a><Header/><div id="main-content"><Routes><Route path="/" element={<HomePage/>}/><Route path="/services/:slug" element={<ContentPage/>}/><Route path="*" element={<NotFoundPage/>}/></Routes></div><Footer/></>;}
