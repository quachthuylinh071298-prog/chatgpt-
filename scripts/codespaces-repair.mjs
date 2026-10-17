import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { codespacesOrigin } from "./codespaces-config.mjs";
import { stopApp } from "./repair-processes.mjs";
const origin = codespacesOrigin(process.env);
if (!existsSync(".env.local"))
  throw new Error(
    "Chưa có .env.local. Chạy npm run setup trước, lưu mật khẩu rồi chạy lại npm run repair.",
  );
async function run(args) {
  await new Promise((ok, fail) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", fail);
    child.on("exit", (code) =>
      code === 0
        ? ok()
        : fail(
            new Error(
              "Bước sửa lỗi chưa hoàn tất; xem thông báo ngay phía trên.",
            ),
          ),
    );
  });
}
console.log(
  "1/3: Dừng website và worker cũ của dự án này. Giữ nguyên mật khẩu và dữ liệu.",
);
await stopApp();
console.log("2/3: Biên dịch bản cập nhật…");
await run(["node_modules/next/dist/bin/next", "build"]);
console.log("3/3: Khởi động lại website và worker…");
await run(["scripts/codespaces-start.mjs"]);
const res = await fetch("http://127.0.0.1:3000/api/auth", {
  signal: AbortSignal.timeout(5000),
});
const data = await res.json();
if (!res.ok || data.loginVersion !== "2")
  throw new Error(
    "Máy chủ chưa chạy bản đăng nhập 2. Không báo sửa thành công; hãy gửi thông báo lỗi này.",
  );
console.log(
  `ĐÃ CẬP NHẬT BẢN ĐĂNG NHẬP 2.\nMở lại trang này và nhấn Ctrl + Shift + R:\n${origin}\nDùng mật khẩu hiện tại. Không cần tạo lại Codespaces.`,
);
