import { spawn } from "node:child_process";
import { openSync, closeSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { codespacesOrigin } from "./codespaces-config.mjs";
const origin = codespacesOrigin(process.env);
if (!existsSync(".env.local") || !existsSync(".next/BUILD_ID")) {
  throw new Error(
    "Thiếu cấu hình/build. Chạy npm ci && npm run setup && npm run build trước.",
  );
}
const endpoint = "http://127.0.0.1:3000/api/auth";
async function ready() {
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(1000) });
    const data = await res.json();
    return (
      res.ok &&
      typeof data.authenticated === "boolean" &&
      data.configured === true
    );
  } catch {
    return false;
  }
}
if (await ready()) {
  console.log(
    `Ứng dụng đã chạy. Mở tab PORTS → cổng 3000 → biểu tượng quả địa cầu.\n${origin}`,
  );
} else {
  mkdirSync("work", { recursive: true });
  const env = { ...process.env, APP_ORIGIN: origin };
  for (const [name, args] of [
    [
      "website",
      [
        resolve("node_modules/next/dist/bin/next"),
        "start",
        "--hostname",
        "0.0.0.0",
        "--port",
        "3000",
      ],
    ],
    ["worker", ["--import", "tsx", resolve("lib/worker.ts")]],
  ]) {
    const log = openSync(`work/codespaces-${name}.log`, "a", 0o600);
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env,
      detached: true,
      stdio: ["ignore", log, log],
    });
    child.on("error", () =>
      console.error(
        `Không thể khởi động ${name}; xem work/codespaces-${name}.log.`,
      ),
    );
    child.unref();
    closeSync(log);
  }
  let running = false;
  for (let n = 0; n < 60; n++) {
    if (await ready()) {
      running = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!running)
    throw new Error(
      "Website chưa sẵn sàng. Xem work/codespaces-website.log và work/codespaces-worker.log.",
    );
  console.log(
    `MedIntel đã chạy trong Codespaces.\nMở tab PORTS → cổng 3000 → Open in Browser.\n${origin}\nMật khẩu đăng nhập là giá trị APP_PASSWORD trong file .env.local. Không chia sẻ file này.\nGiữ cổng ở chế độ Private và dừng Codespaces khi dùng xong.`,
  );
}
