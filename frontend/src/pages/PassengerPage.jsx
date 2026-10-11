import { t } from "../i18n.js";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { localDate } from "../api/client";
import { useApi } from "../hooks/useApi";
import BookingSteps from "../components/booking/BookingSteps";
const schema = z.object({
  passengers: z.array(
    z.object({
      type: z.string(),
      title: z.string(),
      lastName: z.string().trim().min(1, "Nhập họ").max(100),
      firstName: z.string().trim().min(1, "Nhập tên đệm và tên").max(100),
      dateOfBirth: z
        .string()
        .min(1, "Chọn ngày sinh")
        .refine(
          (d) => d <= localDate(),
          "Ngày sinh không được trong tương lai",
        ),
      nationality: z.string().min(1, "Nhập quốc tịch"),
    }),
  ),
  contactEmail: z.email("Email không hợp lệ"),
  contactPhone: z
    .string()
    .regex(/^[+0-9 ()-]{8,20}$/, "Số điện thoại không hợp lệ"),
});
const typeLabels = { ADULT: "Người lớn", CHILD: "Trẻ em", INFANT: "Em bé" };
function initialPassengers(search) {
  return ["ADULT", "CHILD", "INFANT"].flatMap((type, i) =>
    Array.from(
      { length: Number([search.adults, search.children, search.infants][i]) },
      () => ({
        type,
        title: type === "ADULT" ? "MR" : "MSTR",
        lastName: "",
        firstName: "",
        dateOfBirth: "",
        nationality: "Việt Nam",
      }),
    ),
  );
}
export default function PassengerPage() {
  useTranslation();
  const { draft, update } = useBooking();
  const navigate = useNavigate();
  const travelers = useApi(sessionStorage.getItem("demo-auth") ? "/account/travelers" : null);
  const defaults = {
    passengers: draft.passengers.length
      ? draft.passengers
      : draft.search
        ? initialPassengers(draft.search)
        : [],
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
  };
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });
  const { fields } = useFieldArray({ control, name: "passengers" });
  useEffect(() => {
    const subscription = watch((values) => update(values));
    return () => subscription.unsubscribe();
  }, [watch]);
  if (!draft.segments.length) return <Navigate to="/flights" replace />;
  function submit(values) {
    const departureDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(draft.segments[0].flight.departureTime));
    const departure = new Date(`${departureDay}T12:00:00`);
    for (const [index, p] of values.passengers.entries()) {
      const birth = new Date(`${p.dateOfBirth}T12:00:00`);
      let age = departure.getFullYear() - birth.getFullYear();
      if (
        departure.getMonth() < birth.getMonth() ||
        (departure.getMonth() === birth.getMonth() &&
          departure.getDate() < birth.getDate())
      )
        age--;
      if (
        (p.type === "ADULT" && age < 12) ||
        (p.type === "CHILD" && (age < 2 || age >= 12)) ||
        (p.type === "INFANT" && (age < 0 || age >= 2))
      ) {
        setError(
          `passengers.${index}.dateOfBirth`,
          {
            type: "validate",
            message:
              "Ngày sinh không phù hợp: người lớn từ 12 tuổi, trẻ em 2–11 tuổi, em bé dưới 2 tuổi.",
          },
          { shouldFocus: true },
        );
        return;
      }
    }
    update(values);
    navigate("/booking/extras");
  }
  return (
    <main className="container page checkout-page">
      <BookingSteps active={1} />
      <div className="page-heading">
        <span className="eyebrow">{t("BƯỚC 2")}</span>
        <h1>{t("Thông tin hành khách")}</h1>
        <p>{t("Chỉ nhập dữ liệu mẫu. Không yêu cầu giấy tờ cá nhân thật.")}</p>
      </div>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="notice-panel">{t("Ví dụ: NGUYEN / VAN DEMO · Ngày sinh 01/01/1990 · demo@example.com")}</div>
        {fields.map((field, i) => (
          <section key={field.id} className="panel passenger-form">
            <h2>
              {t(typeLabels[field.type])} {i + 1}
            </h2>
            {!!travelers.data?.length && <label>{t("Chọn hành khách đã lưu")}<select defaultValue="" onChange={e=>{
              const saved = travelers.data.find(t=>t.id===Number(e.target.value));
              if (saved) for (const key of ["title","lastName","firstName","dateOfBirth","nationality"]) setValue(`passengers.${i}.${key}`,saved[key],{shouldDirty:true});
            }}><option value="">{t("Nhập thông tin mới")}</option>{travelers.data.filter(t=>t.type===field.type).map(t=><option key={t.id} value={t.id}>{t.lastName} {t.firstName}</option>)}</select></label>}
            <div className="form-grid">
              <label>{t("Danh xưng")}<select {...register(`passengers.${i}.title`)}>
                  <option value="MR">{t("Ông")}</option>
                  <option value="MS">{t("Bà")}</option>
                  <option value="MSTR">{t("Bé trai")}</option>
                  <option value="MISS">{t("Bé gái")}</option>
                </select>
              </label>
              <label>{t("Họ")}<input
                  {...register(`passengers.${i}.lastName`)}
                  autoComplete="off"
                />
                {errors.passengers?.[i]?.lastName && (
                  <small className="field-error">
                    {t(errors.passengers[i].lastName.message)}
                  </small>
                )}
              </label>
              <label>{t("Tên đệm và tên")}<input
                  {...register(`passengers.${i}.firstName`)}
                  autoComplete="off"
                />
                {errors.passengers?.[i]?.firstName && (
                  <small className="field-error">
                    {t(errors.passengers[i].firstName.message)}
                  </small>
                )}
              </label>
              <label>{t("Ngày sinh")}<input
                  type="date"
                  max={localDate()}
                  {...register(`passengers.${i}.dateOfBirth`)}
                />
                {errors.passengers?.[i]?.dateOfBirth && (
                  <small className="field-error">
                    {t(errors.passengers[i].dateOfBirth.message)}
                  </small>
                )}
              </label>
              <label>{t("Quốc tịch")}<input {...register(`passengers.${i}.nationality`)} />
              </label>
            </div>
          </section>
        ))}
        <section className="panel passenger-form">
          <h2>{t("Thông tin liên hệ")}</h2>
          <div className="form-grid two">
            <label>{t("Email liên hệ")}<input type="email" {...register("contactEmail")} />
              {errors.contactEmail && (
                <small className="field-error">
                  {t(errors.contactEmail.message)}
                </small>
              )}
            </label>
            <label>{t("Số điện thoại")}<input type="tel" {...register("contactPhone")} />
              {errors.contactPhone && (
                <small className="field-error">
                  {t(errors.contactPhone.message)}
                </small>
              )}
            </label>
          </div>
        </section>
        <div className="actions justify-between">
          <Link
            className="button secondary"
            to={draft.search?.type==="MULTI_CITY"?"/services/multi-city":draft.search?.type==="GROUP"?"/services/groups":`/flights?${new URLSearchParams(draft.search)}`}
          >{t("Chọn lại chuyến bay")}</Link>
          <button className="button primary" type="submit">{t("Tiếp tục")}</button>
        </div>
      </form>
    </main>
  );
}
