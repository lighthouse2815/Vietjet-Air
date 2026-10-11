import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

const root = new URL("../", import.meta.url);
const example = await readFile(new URL(".env.example", root), "utf8");
const config = example
  .replace(
    /^POSTGRES_PASSWORD=.*$/m,
    `POSTGRES_PASSWORD=${randomBytes(24).toString("hex")}`,
  )
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(32).toString("hex")}`);
try {
  await writeFile(new URL(".env", root), config, { flag: "wx", mode: 0o600 });
  console.log("Đã tạo .env với secret ngẫu nhiên. File này được Git bỏ qua.");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log(".env đã tồn tại; giữ nguyên cấu hình hiện tại.");
}
