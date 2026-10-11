import { z } from "zod";
import { localDate } from "../api/client";

const date = z.iso.date({ error: "Chọn ngày đi hợp lệ." });
export const flightSearchSchema = z
  .object({
    origin: z.string().regex(/^[A-Z]{3}$/, "Chọn điểm khởi hành hợp lệ."),
    destination: z.string().regex(/^[A-Z]{3}$/, "Chọn điểm đến hợp lệ."),
    date,
    returnDate: z.string(),
    type: z.enum(["ONE_WAY", "ROUND_TRIP"]),
    adults: z.number().int().min(1).max(9),
    children: z.number().int().min(0).max(8),
    infants: z.number().int().min(0).max(9),
    promotionCode: z.string().max(30, "Mã khuyến mại tối đa 30 ký tự."),
    cheap: z.boolean(),
  })
  .refine((s) => s.origin !== s.destination, {
    message: "Chọn hai sân bay khác nhau để tìm chuyến bay.",
  })
  .refine((s) => s.date >= localDate(), {
    message: "Ngày đi không được ở quá khứ.",
  })
  .refine(
    (s) =>
      s.type !== "ROUND_TRIP" ||
      (date.safeParse(s.returnDate).success && s.returnDate >= s.date),
    { message: "Ngày về phải hợp lệ và không trước ngày đi." },
  )
  .refine(
    (s) => s.adults + s.children + s.infants <= 9 && s.infants <= s.adults,
    { message: "Tối đa 9 hành khách; số em bé không vượt quá số người lớn." },
  );
