import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = mkdtempSync(join(tmpdir(), "medintel-test-"));
process.env.DATABASE_PATH = join(directory, "integration.sqlite");
process.env.APP_PASSWORD = "integration-password-only";
process.env.SESSION_SECRET = "integration-session-secret-32-chars-min";
process.env.AI_PROVIDER = "none";
test("API: auth → tạo dự án → CSV → hàng đợi → báo cáo → cập nhật → so sánh → Excel", async () => {
  const { NextRequest } = await import("next/server");
  const { GET, POST } = await import("../app/api/[...path]/route");
  const { claimJob, processJob } = await import("../lib/research");
  const { db } = await import("../lib/db");
  const origin = "http://localhost:3000";
  let cookie = "";
  const call = async (path: string, method = "GET", body?: unknown) => {
    const headers: Record<string, string> = { origin };
    if (cookie) headers.cookie = cookie;
    if (!(body instanceof FormData))
      headers["content-type"] = "application/json";
    return (method === "GET" ? GET : POST)(
      new NextRequest(origin + "/api/" + path, {
        method,
        headers,
        ...(body
          ? { body: body instanceof FormData ? body : JSON.stringify(body) }
          : {}),
      }),
    );
  };
  try {
    assert.equal((await call("projects")).status, 401);
    assert.equal(
      (
        await POST(
          new NextRequest(origin + "/api/login", {
            method: "POST",
            headers: {
              origin: "http://evil.test",
              "content-type": "application/json",
            },
            body: JSON.stringify({ password: process.env.APP_PASSWORD }),
          }),
        )
      ).status,
      403,
    );
    const login = await call("login", "POST", {
      password: process.env.APP_PASSWORD,
    });
    assert.equal(login.status, 200);
    const proxiedLogin = await POST(
      new NextRequest(origin + "/api/login", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          origin: "https://example-3000.app.github.dev",
          "sec-fetch-site": "same-origin",
          "content-type": "application/json",
        },
        body: JSON.stringify({ password: process.env.APP_PASSWORD }),
      }),
    );
    assert.equal(proxiedLogin.status, 200);
    assert.match(proxiedLogin.headers.get("set-cookie") || "", /Secure/);

    const publicHostLogin = await POST(
      new NextRequest(origin + "/api/login", {
        method: "POST",
        headers: {
          host: "127.0.0.1:3000",
          origin: "http://127.0.0.1:3000",
          "content-type": "application/json",
        },
        body: JSON.stringify({ password: process.env.APP_PASSWORD }),
      }),
    );
    assert.equal(
      publicHostLogin.status,
      200,
      "CSRF kiểm tra host công khai thay vì URL nội bộ Next",
    );
    cookie = login.headers.get("set-cookie")!.split(";")[0];
    const created = await call("projects", "POST", {
      name: "Dự án thử nghiệm tự động",
    });
    assert.equal(created.status, 201);
    const p = await created.json();
    const project = "projects/" + p.id;
    const upload = async (leads: number) => {
      const form = new FormData();
      form.set(
        "file",
        new File(
          [`date,leads,bookings,spend\n2026-10-01,${leads},5,100000\n`],
          "metrics.csv",
        ),
      );
      return call(project + "/import", "POST", form);
    };
    assert.equal((await upload(10)).status, 200);
    const request = {
      start: "2026-10-01",
      end: "2026-10-17",
      sources: ["uploaded", "meta"],
      useAI: false,
    };
    const first = await (
      await call(project + "/research", "POST", request)
    ).json();
    const duplicate = await (
      await call(project + "/research", "POST", request)
    ).json();
    assert.equal(first.id, duplicate.id);
    await processJob(claimJob()!);
    let detail = await (await call(project)).json();
    assert.equal(detail.reports.length, 1);
    const v1 = detail.reports[0];
    assert.equal(v1.metrics.bookingRate, 50);
    assert.equal(v1.status, "limited");
    assert.equal(v1.sourceLogs[1].status, "unavailable");
    assert.equal(v1.project.specialty, "");
    assert.equal(v1.sections.length, 6);
    await call(project + "/research", "POST", request);
    await processJob(claimJob()!);
    detail = await (await call(project)).json();
    assert.equal(detail.reports.length, 1);
    assert.equal(detail.jobs[0].status, "failed");
    await upload(20);
    await call(project + "/research", "POST", request);
    await processJob(claimJob()!);
    detail = await (await call(project)).json();
    assert.equal(detail.reports.length, 2);
    const v2 = detail.reports[0];
    assert.equal(v2.number, 2);
    assert.equal(v2.metrics.bookingRate, 25);
    assert.equal(detail.reports[1].metrics.leads, 10);
    assert.equal(detail.rows.length, 1);
    const comparison = await (
      await call(project + `/compare?a=${v1.id}&b=${v2.id}`)
    ).json();
    assert.equal(
      comparison.metrics.find((x: { key: string }) => x.key === "leads").delta,
      10,
    );
    const exported = await call(project + "/export?report=" + v2.id);
    assert.equal(exported.status, 200);
    const bytes = await exported.arrayBuffer();
    assert.ok(bytes.byteLength > 1000);
    assert.equal(new Uint8Array(bytes)[0], 0x50);
    const other = await (
      await call("projects", "POST", { name: "Dự án khác" })
    ).json();
    assert.equal(
      (await call(`projects/${other.id}/compare?a=${v1.id}&b=${v2.id}`)).status,
      400,
    );
    assert.equal(
      (await call(`projects/${other.id}/export?report=${v2.id}`)).status,
      404,
    );
    const noData = await (
      await call(`projects/${other.id}/research`, "POST", {
        ...request,
        useAI: true,
      })
    ).json();
    assert.ok(noData.id);
    await processJob(claimJob()!);
    const otherDetail = await (await call("projects/" + other.id)).json();
    assert.equal(otherDetail.reports[0].metrics.leads, null);
    assert.equal(otherDetail.reports[0].coverage, 0);
    assert.match(otherDetail.reports[0].aiStatus, /Chưa cấu hình/);
    // Public-source editorial snapshot is scoped to the confirmed brand and date.
    const doctor = await (
      await call("projects", "POST", {
        name: "Hữu Thị Chung",
        facebook: "https://www.facebook.com/BS.TTUT.huuchung",
      })
    ).json();
    await call(`projects/${doctor.id}/research`, "POST", {
      ...request,
      sources: ["web"],
      useAI: false,
    });
    await processJob(claimJob()!);
    const researched = await (await call("projects/" + doctor.id)).json();
    assert.equal(
      researched.reports[0].sourceLogs.filter(
        (s: { status: string }) => s.status === "editorial_snapshot",
      ).length,
      7,
    );
    assert.ok(
      researched.reports[0].sections[0].findings.some((s: string) =>
        s.includes("WHO"),
      ),
    );
    assert.ok(
      researched.reports[0].sourceLogs
        .filter((s: { status: string }) => s.status === "editorial_snapshot")
        .every(
          (s: { collectedAt: string }) =>
            s.collectedAt === "2026-10-17T09:02:44.000Z",
        ),
    );
    assert.equal(researched.reports[0].metrics.leads, null);
    assert.equal(
      (
        await call(
          `projects/${doctor.id}/export?report=${researched.reports[0].id}`,
        )
      ).status,
      200,
    );
    await call(`projects/${doctor.id}/research`, "POST", {
      ...request,
      start: "2026-09-01",
      end: "2026-09-30",
      sources: ["web"],
      useAI: false,
    });
    await processJob(claimJob()!);
    const historical = await (await call("projects/" + doctor.id)).json();
    assert.equal(
      historical.reports[0].sourceLogs.some(
        (s: { status: string }) => s.status === "editorial_snapshot",
      ),
      false,
    );
    await call(`projects/${other.id}/research`, "POST", {
      ...request,
      sources: ["web"],
      useAI: false,
    });
    await processJob(claimJob()!);
    const unrelated = await (await call("projects/" + other.id)).json();
    assert.equal(
      unrelated.reports[0].sourceLogs.some(
        (s: { status: string }) => s.status === "editorial_snapshot",
      ),
      false,
    );
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
