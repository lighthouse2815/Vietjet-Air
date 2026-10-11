import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, errorMessage } from "../../api/client";
import { storeBooking } from "../../utils/booking";
export default function BookingLookupForm({ onResult, checkIn = false }) {
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
        <label>
          Mã đặt chỗ
          <input
            autoComplete="off"
            {...register("bookingCode", {
              required: "Nhập mã đặt chỗ",
              maxLength: 20,
            })}
            placeholder="8 ký tự"
          />
          {errors.bookingCode && (
            <small className="field-error">{errors.bookingCode.message}</small>
          )}
        </label>
        <label>
          Họ
          <input
            {...register("lastName", { required: "Nhập họ", maxLength: 100 })}
            placeholder="NGUYEN"
          />
          {errors.lastName && (
            <small className="field-error">{errors.lastName.message}</small>
          )}
        </label>
        <label>
          Tên đệm và tên
          <input
            {...register("firstName", {
              required: "Nhập tên đệm và tên",
              maxLength: 100,
            })}
            placeholder="VAN DEMO"
          />
          {errors.firstName && (
            <small className="field-error">{errors.firstName.message}</small>
          )}
        </label>
      </div>
      <p className="small muted">
        Nhập thông tin của một hành khách trong booking. Tối đa 15 lần tra
        cứu/phút.
      </p>
      {error && (
        <p role="alert" className="notice-panel error">
          {error}
        </p>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? "Đang tra cứu..." : "Tra cứu đặt chỗ"}
      </button>
    </form>
  );
}
