import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
if (existsSync(".env.local")) {
  console.log(".env.local đã tồn tại. Giữ nguyên cấu hình; không ghi đè.");
  process.exit(0);
}
const password = randomBytes(18).toString("base64url");
writeFileSync(
  ".env.local",
  `APP_PASSWORD=${password}\nSESSION_SECRET=${randomBytes(48).toString("hex")}\nDATABASE_PATH=./data/medical.sqlite\nAI_PROVIDER=none\n`,
  { mode: 0o600 },
);
console.log(
  "Đã tạo .env.local (không commit). Mật khẩu đăng nhập chỉ hiển thị lần này:",
);
console.log(password);
console.log(
  "Lưu mật khẩu ở nơi riêng tư. Có thể đổi APP_PASSWORD trong .env.local rồi khởi động lại.",
);
