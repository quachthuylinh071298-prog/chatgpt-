import { readdirSync, readlinkSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
export function isAppProcess(cwd, args, project, pid, self = process.pid) {
  if (pid === self || resolve(cwd) !== resolve(project) || !args.length)
    return false;
  const first = args[0];
  return (
    /^next-server(?:\s|$)/.test(first) ||
    (args.includes(resolve(project, "node_modules/next/dist/bin/next")) &&
      args.includes("start")) ||
    (args.includes("--import") &&
      args.includes("tsx") &&
      args.some(
        (a) => a === resolve(project, "lib/worker.ts") || a === "lib/worker.ts",
      ))
  );
}
export function appProcesses(project = process.cwd()) {
  const result = [];
  for (const entry of readdirSync("/proc")) {
    if (!/^\d+$/.test(entry)) continue;
    try {
      const cwd = readlinkSync(`/proc/${entry}/cwd`);
      if (resolve(cwd) !== resolve(project)) continue;
      const args = readFileSync(`/proc/${entry}/cmdline`, "utf8")
        .split("\0")
        .filter(Boolean);
      if (isAppProcess(cwd, args, project, Number(entry)))
        result.push(Number(entry));
    } catch {
      /* Process exited, or belongs to another user. */
    }
  }
  return result;
}
export async function stopApp(project = process.cwd()) {
  const pids = appProcesses(project);
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
  const until = Date.now() + 80000;
  while (appProcesses(project).some((p) => pids.includes(p))) {
    if (Date.now() > until)
      throw new Error(
        "Tiến trình cũ chưa dừng. Không ép tắt để tránh gián đoạn tác vụ. Hãy Restart Codespaces rồi chạy lại.",
      );
    await new Promise((r) => setTimeout(r, 300));
  }
  return pids.length;
}
