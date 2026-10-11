import { t } from "./i18n.js";
import { useTranslation } from "react-i18next";
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
const AccountPage = lazy(() => import("./pages/AccountPage"));
const BookingManagePage = lazy(() => import("./pages/BookingManagePage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const CommercePage = lazy(() => import("./pages/CommercePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const JourneyPage = lazy(() => import("./pages/JourneyPage"));
export default function App() {
  useTranslation();
  const { pathname, key, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, key, hash]);
  return (
    <>
      <a className="skip-link" href="#main-content">{t("Đến nội dung chính")}</a>
      <Header />
      <div id="main-content">
        <Suspense fallback={<LoadingState label={t("Đang tải trang...")} />}>
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
            <Route path="/my-booking/:code/manage" element={<BookingManagePage />} />
            <Route path="/check-in" element={<CheckInPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/services/support" element={<SupportPage />} />
            <Route path="/services/skyshop" element={<CommercePage kind="shop" />} />
            <Route path="/services/voucher" element={<CommercePage kind="voucher" />} />
            <Route path="/services/skyjoy" element={<CommercePage kind="loyalty" />} />
            <Route path="/services/multi-city" element={<JourneyPage />} />
            <Route path="/services/groups" element={<JourneyPage group />} />
            <Route path="/services/:slug" element={<ContentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
