import { readFile, writeFile, chmod } from "node:fs/promises";
import { randomBytes } from "node:crypto";
const file = new URL("../.env", import.meta.url);
let config = await readFile(file, "utf8");
if (/^ADMIN_EMAIL=.+$/m.test(config) || /^ADMIN_PASSWORD=.+$/m.test(config)) {
  console.log("Cấu hình quản trị đã tồn tại; giữ nguyên.");
} else {
  const email = process.env.ADMIN_EMAIL || "admin-demo@example.com";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("ADMIN_EMAIL không hợp lệ");
  config = config.replace(/^ADMIN_EMAIL=.*\n?/gm, "").replace(/^ADMIN_PASSWORD=.*\n?/gm, "");
  await writeFile(file, `${config.trimEnd()}\nADMIN_EMAIL=${email}\nADMIN_PASSWORD=${randomBytes(24).toString("hex")}\n`, {mode:0o600});
  await chmod(file,0o600);
  console.log("Đã tạo thông tin quản trị riêng trong .env. Khởi động lại backend để tạo ADMIN; không có mật khẩu dùng chung.");
}
