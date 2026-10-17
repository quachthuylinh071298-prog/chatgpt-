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
