import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import { LoadingState } from "./components/common/States";
const ContentPage = lazy(() => import("./pages/ContentPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const FlightResultsPage = lazy(() => import("./pages/FlightResultsPage"));
const PassengerPage = lazy(() => import("./pages/PassengerPage"));
const ExtrasPage = lazy(() => import("./pages/ExtrasPage"));
const BookingReviewPage = lazy(() => import("./pages/BookingReviewPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const BookingSuccessPage = lazy(() => import("./pages/BookingSuccessPage"));
const MyBookingPage = lazy(() => import("./pages/MyBookingPage"));
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Đến nội dung chính
      </a>
      <Header />
      <div id="main-content">
        <Suspense fallback={<LoadingState label="Đang tải trang..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/flights" element={<FlightResultsPage />} />
            <Route path="/booking/passengers" element={<PassengerPage />} />
            <Route path="/booking/extras" element={<ExtrasPage />} />
            <Route path="/booking/review" element={<BookingReviewPage />} />
            <Route path="/booking/payment" element={<PaymentPage />} />
            <Route
              path="/booking/success/:bookingCode"
              element={<BookingSuccessPage />}
            />
            <Route path="/my-booking" element={<MyBookingPage />} />
            <Route path="/check-in" element={<CheckInPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/services/:slug" element={<ContentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
