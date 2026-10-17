import { test } from "node:test";
import assert from "node:assert/strict";
import { kpis, compare, actionPlan, projectSchema } from "../lib/domain";
import { parseUpload, normalizeRecords } from "../lib/importer";
import ExcelJS from "exceljs";
test("KPI không coi thiếu dữ liệu là số 0; mẫu số 0 không có tỷ lệ", () => {
  const v = kpis([{ date: "2026-01-01", leads: 0, spend: 100 }]);
  assert.equal(v.cpl, null);
  assert.equal(v.revenue, null);
  assert.equal(v.leads, 0);
  assert.equal(v.roas, null);
  assert.equal(v.roi, null);
});
test("KPI chỉ tính tỷ lệ trên ngày có đủ cả hai đầu vào", () => {
  const v = kpis([
    {
      date: "2026-01-01",
      leads: 10,
      bookings: 4,
      showUps: 3,
      spend: 100,
      revenue: 300,
      newPatients: 2,
      reach: 100,
      engagements: 10,
      videoStarts: 50,
      videoCompletions: 20,
    },
    { date: "2026-01-02", leads: 100 },
  ]);
  assert.equal(v.bookingRate, 40);
  assert.equal(v.cpl, 10);
  assert.equal(v.pac, 50);
  assert.equal(v.showUpRate, 75);
  assert.equal(v.engagementRate, 10);
  assert.equal(v.retentionRate, 40);
  assert.equal(v.roas, 3);
  assert.equal(v.leads, 110);
});
test("Không ghép tử và mẫu ở hai ngày khác nhau", () => {
  assert.equal(
    kpis([
      { date: "2026-01-01", leads: 10 },
      { date: "2026-01-02", bookings: 4 },
    ]).bookingRate,
    null,
  );
});
test("So sánh giữ missing và baseline zero, không chia cho zero", () => {
  const before = kpis([{ date: "2026-01-01", leads: 0 }]),
    after = kpis([{ date: "2026-01-01", leads: 10, revenue: 100 }]);
  const changes = compare(before, after);
  assert.deepEqual(
    changes.find((x) => x.key === "leads"),
    { key: "leads", before: 0, after: 10, delta: 10, percent: null },
  );
  assert.equal(changes.find((x) => x.key === "revenue")?.delta, null);
});
test("Phân bổ ngân sách không thay đổi tổng", () => {
  assert.equal(
    actionPlan(1e8).reduce((s, x) => s + x.budget, 0),
    1e8,
  );
});
test("CSV: thiếu đầu vào là null; chặn PII, ngày sai, số âm và trùng ngày", async () => {
  const rows = await parseUpload(
    "a.csv",
    Buffer.from("date,leads,spend\n2026-01-01,0,\n"),
  );
  assert.equal(rows[0].spend, null);
  assert.throws(
    () => normalizeRecords([{ date: "2026-01-01", patientName: "A" }]),
    /Cột không/,
  );
  assert.throws(
    () => normalizeRecords([{ date: "2026-02-30", leads: 1 }]),
    /Dòng/,
  );
  assert.throws(
    () => normalizeRecords([{ date: "2026-01-01", leads: -1 }]),
    /Dòng/,
  );
  assert.throws(
    () =>
      normalizeRecords([
        { date: "2026-01-01", leads: 1 },
        { date: "2026-01-01", leads: 2 },
      ]),
    /Trùng/,
  );
});
test("XLSX nhập số liệu và từ chối công thức", async () => {
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet("Data");
  sheet.addRows([
    ["date", "leads"],
    ["2026-01-01", 10],
  ]);
  let bytes = await workbook.xlsx.writeBuffer();
  assert.equal(
    (await parseUpload("a.xlsx", new Uint8Array(bytes)))[0].leads,
    10,
  );
  sheet.getCell("B2").value = { formula: "1+2", result: 3 };
  bytes = await workbook.xlsx.writeBuffer();
  await assert.rejects(
    () => parseUpload("a.xlsx", new Uint8Array(bytes)),
    /công thức/,
  );
});
test("Hồ sơ khởi tạo không tự bịa chuyên khoa", () => {
  const p = projectSchema.parse({ name: "BS.TTƯT. Hữu Thị Chung" });
  assert.equal(p.specialty, "");
  assert.equal(p.location, "");
});

test("CSRF nhận diện origin trình duyệt qua proxy và từ chối cross-site", async () => {
  const { isSameOriginRequest } = await import("../lib/request-origin");
  const internal = "http://localhost:3000/api/login";
  assert.equal(
    isSameOriginRequest(
      new Headers({
        origin: "https://example-3000.app.github.dev",
        "sec-fetch-site": "same-origin",
        host: "localhost:3000",
      }),
      internal,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({
        origin: "https://evil.test",
        "sec-fetch-site": "cross-site",
      }),
      internal,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({
        origin: "http://localhost:3000",
        "sec-fetch-site": "same-site",
      }),
      internal,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({ origin: "null", "sec-fetch-site": "same-origin" }),
      internal,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({ "sec-fetch-site": "same-origin" }),
      internal,
    ),
    false,
  );
  const config = { codespace: "example", forwardingDomain: "app.github.dev" };
  assert.equal(
    isSameOriginRequest(
      new Headers({ origin: "https://example-3000.app.github.dev" }),
      internal,
      config,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({ origin: "https://other-3000.app.github.dev" }),
      internal,
      config,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(
      new Headers({ origin: "https://canonical.test" }),
      internal,
      { appOrigin: "https://canonical.test/" },
    ),
    true,
  );
});

test("Repair chỉ dừng tiến trình ứng dụng của chính repository", async () => {
  const { isAppProcess } = await import("../scripts/repair-processes.mjs");
  const root = "/workspaces/medintel";
  assert.equal(
    isAppProcess(root, ["next-server (v15.5.28)"], root, 123, 999),
    true,
  );
  assert.equal(
    isAppProcess(
      "/workspaces/other",
      ["next-server (v15.5.28)"],
      root,
      123,
      999,
    ),
    false,
  );
  assert.equal(
    isAppProcess(
      root,
      ["node", "--import", "tsx", "lib/worker.ts"],
      root,
      123,
      999,
    ),
    true,
  );
  assert.equal(
    isAppProcess(root, ["node", "unrelated.js"], root, 123, 999),
    false,
  );
  assert.equal(
    isAppProcess(root, ["next-server (v15.5.28)"], root, 999, 999),
    false,
  );
});

test("Bản biên soạn chỉ khớp fanpage đã xác nhận, có nguồn và 30 chủ đề", async () => {
  const { matchesHuuChung, clinicalTopics, briefSources } =
    await import("../lib/huu-chung-brief");
  assert.equal(
    matchesHuuChung("https://www.facebook.com/BS.TTUT.huuchung"),
    true,
  );
  assert.equal(matchesHuuChung("https://evil.test/BS.TTUT.huuchung"), false);
  assert.equal(matchesHuuChung("https://facebook.com/another"), false);
  assert.equal(clinicalTopics.length, 30);
  assert.equal(new Set(clinicalTopics).size, 30);
  assert.ok(briefSources.every((s) => s.url.startsWith("https://")));
});
