import Papa from "papaparse";
import ExcelJS from "exceljs";
import { metricKeys, Observation, observationSchema } from "./domain";
export const allowedColumns = ["date", ...metricKeys];
export function normalizeRecords(
  records: Record<string, unknown>[],
): Observation[] {
  if (!records.length || records.length > 10000)
    throw new Error("Cần 1–10.000 dòng dữ liệu.");
  const seen = new Set<string>();
  return records.map((r, i) => {
    const extras = Object.keys(r).filter((k) => !allowedColumns.includes(k));
    if (extras.length)
      throw new Error(
        `Cột không được phép: ${extras.join(", ")}. Chỉ nhập số liệu tổng hợp, không nhập dữ liệu bệnh nhân.`,
      );
    const out: Record<string, unknown> = { date: String(r.date || "").trim() };
    for (const k of metricKeys) {
      const v = r[k];
      out[k] = v === "" || v === undefined || v === null ? null : Number(v);
    }
    const parsed = observationSchema.safeParse(out);
    if (!parsed.success)
      throw new Error(
        `Dòng ${i + 2}: ngày YYYY-MM-DD và chỉ số phải là số không âm.`,
      );
    if (seen.has(out.date as string))
      throw new Error(
        `Trùng ngày ${out.date} trong tệp. Mỗi ngày chỉ có một dòng tổng hợp.`,
      );
    seen.add(out.date as string);
    if (!metricKeys.some((k) => out[k] !== null))
      throw new Error(`Dòng ${i + 2} không có chỉ số.`);
    return parsed.data as Observation;
  });
}
export async function parseUpload(name: string, bytes: Uint8Array) {
  if (bytes.length > 5 * 1024 * 1024) throw new Error("Tệp tối đa 5 MB.");
  if (name.toLowerCase().endsWith(".csv")) {
    const result = Papa.parse<Record<string, unknown>>(
      new TextDecoder().decode(bytes),
      {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
      },
    );
    if (result.errors.length)
      throw new Error("CSV không hợp lệ: " + result.errors[0].message);
    if (new Set(result.meta.fields).size !== result.meta.fields?.length)
      throw new Error("CSV có cột trùng.");
    return normalizeRecords(result.data);
  }
  if (!name.toLowerCase().endsWith(".xlsx"))
    throw new Error(
      "MVP chỉ nhận CSV hoặc XLSX. PDF/DOCX chưa hỗ trợ phân tích.",
    );
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes) as never);
  const sheet = workbook.worksheets[0];
  if (
    !sheet ||
    sheet.rowCount > 10001 ||
    sheet.columnCount > allowedColumns.length
  )
    throw new Error("Bảng tính trống hoặc vượt giới hạn.");
  const headers = (sheet.getRow(1).values as unknown[]).slice(1).map(String);
  if (new Set(headers).size !== headers.length)
    throw new Error("Có cột trùng.");
  const records: Record<string, unknown>[] = [];
  sheet.eachRow((row, n) => {
    if (n === 1) return;
    const r: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = row.getCell(i + 1).value;
      if (typeof v === "object" && v !== null)
        throw new Error(
          "Không nhận công thức, ngày Excel hoặc đối tượng. Đặt date là văn bản YYYY-MM-DD.",
        );
      r[h] = v;
    });
    records.push(r);
  });
  return normalizeRecords(records);
}
