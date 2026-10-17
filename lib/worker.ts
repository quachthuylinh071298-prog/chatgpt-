import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function main() {
  const { db } = await import("./db");
  const { claimJob, processJob } = await import("./research");
  let stopping = false;
  process.on("SIGTERM", () => {
    stopping = true;
  });
  process.on("SIGINT", () => {
    stopping = true;
  });
  console.log("Research worker đang chạy; Ctrl+C để dừng.");
  while (!stopping) {
    const cutoff = new Date(Date.now() - 5 * 60000).toISOString();
    db.prepare(
      "UPDATE jobs SET status='failed',error='Worker bị gián đoạn hoặc vượt thời gian. Có thể chạy lại.',updated_at=? WHERE status='running' AND updated_at<?",
    ).run(new Date().toISOString(), cutoff);
    const job = claimJob();
    if (job) await processJob(job);
    else await new Promise((r) => setTimeout(r, 1000));
  }
  db.close();
}
main().catch(() => {
  console.error(
    "Worker không thể khởi động; kiểm tra quyền truy cập database.",
  );
  process.exit(1);
});
