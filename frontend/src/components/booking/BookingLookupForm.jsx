import { t } from "../../i18n.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, errorMessage } from "../../api/client";
import { storeBooking } from "../../utils/booking";
export default function BookingLookupForm({ onResult, checkIn = false }) {
  useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(values) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        checkIn ? "/check-in/lookup" : "/bookings/lookup",
        values,
      );
      storeBooking(checkIn ? data.booking : data);
      onResult(data);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="panel lookup-form"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="form-grid">
        <label>{t("Mã đặt chỗ")}<input
            autoComplete="off"
            {...register("bookingCode", {
              required: "Nhập mã đặt chỗ",
              maxLength: 20,
            })}
            placeholder={t("8 ký tự")}
          />
          {errors.bookingCode && (
            <small className="field-error">{t(errors.bookingCode.message)}</small>
          )}
        </label>
        <label>{t("Họ")}<input
            {...register("lastName", { required: "Nhập họ", maxLength: 100 })}
            placeholder="NGUYEN"
          />
          {errors.lastName && (
            <small className="field-error">{t(errors.lastName.message)}</small>
          )}
        </label>
        <label>{t("Tên đệm và tên")}<input
            {...register("firstName", {
              required: "Nhập tên đệm và tên",
              maxLength: 100,
            })}
            placeholder="VAN DEMO"
          />
          {errors.firstName && (
            <small className="field-error">{t(errors.firstName.message)}</small>
          )}
        </label>
      </div>
      <p className="small muted">{t("Nhập thông tin của một hành khách trong booking. Tối đa 15 lần tra cứu/phút.")}</p>
      {error && (
        <p role="alert" className="notice-panel error">
          {t(error)}
        </p>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? t("Đang tra cứu...") : t("Tra cứu đặt chỗ")}
      </button>
    </form>
  );
}
