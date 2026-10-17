import { z } from "zod";
import type { Project } from "./domain";
import { strategyTables, type StrategyTable } from "./strategy-tables";
import { matchesHuuChung } from "./huu-chung-brief";
export type ResearchWorkspace = {
  tables: StrategyTable[];
  revision: number;
  updatedAt: string | null;
};
export function initialWorkspace(project: Project): ResearchWorkspace {
  const tables = strategyTables(project);
  if (!matchesHuuChung(project.facebook)) {
    for (const table of tables) {
      table.rows = [];
      table.note =
        "Chưa có nghiên cứu đã xác minh cho dự án này. Nhập dữ liệu thương hiệu hoặc giả thuyết cần kiểm chứng; không nhập bệnh án hoặc thông tin định danh bệnh nhân.";
    }
    tables[0].rows = [
      ["Tên thương hiệu", project.name, "Người dùng cung cấp", "Hồ sơ dự án"],
      [
        "Chuyên khoa",
        project.specialty || "Chưa xác nhận",
        "Người dùng cung cấp",
        "Cần xác minh",
      ],
      [
        "Địa điểm / lịch khám",
        project.location || "Chưa xác nhận",
        "Người dùng cung cấp",
        "Cần xác minh hiện tại",
      ],
      [
        "Dịch vụ ưu tiên",
        project.services || "Chưa chốt",
        "Người dùng cung cấp",
        "Hồ sơ dự án",
      ],
      [
        "Ngân sách 90 ngày",
        project.budget,
        "Người dùng cung cấp",
        "Không phải chi phí đã phát sinh",
      ],
    ];
  }
  return { tables, revision: 0, updatedAt: null };
}
const cell = z.union([
  z.string().max(4000),
  z.number().finite().min(-1e15).max(1e15),
  z.null(),
]);
const tableSchema = z
  .object({
    id: z.string().max(50),
    title: z.string().max(100),
    note: z.string().max(3000),
    headers: z.array(z.string().max(150)).min(1).max(16),
    rows: z.array(z.array(cell).max(16)).max(200),
  })
  .strict();
export const workspaceInput = z
  .object({
    expectedRevision: z.number().int().min(0),
    tables: z.array(tableSchema).length(10),
  })
  .strict();
export function validateWorkspace(input: unknown, project: Project) {
  const parsed = workspaceInput.parse(input),
    base = initialWorkspace(project).tables;
  if (parsed.tables.reduce((n, t) => n + t.rows.length, 0) > 400)
    throw new Error("Tối đa 400 dòng nghiên cứu trong một dự án.");
  if (JSON.stringify(parsed.tables).length > 250000)
    throw new Error("Nội dung nghiên cứu quá dài. Giới hạn 250.000 ký tự.");
  parsed.tables.forEach((t, i) => {
    if (
      t.id !== base[i].id ||
      t.title !== base[i].title ||
      JSON.stringify(t.headers) !== JSON.stringify(base[i].headers)
    )
      throw new Error("Cấu trúc bảng đã thay đổi. Vui lòng tải lại dự án.");
    if (t.rows.some((row) => row.length !== t.headers.length))
      throw new Error("Số cột trong dòng nghiên cứu không hợp lệ.");
  });
  return parsed;
}

export function compareResearchFields(
  before: StrategyTable[] | undefined,
  after: StrategyTable[] | undefined,
) {
  if (!before || !after)
    return {
      comparable: false,
      count: 0,
      changes: [] as {
        table: string;
        row: number;
        field: string;
        before: string | number | null;
        after: string | number | null;
      }[],
      truncated: false,
    };
  const changes: {
    table: string;
    row: number;
    field: string;
    before: string | number | null;
    after: string | number | null;
  }[] = [];
  let count = 0;
  for (const id of new Set([
    ...before.map((t) => t.id),
    ...after.map((t) => t.id),
  ])) {
    const a = before.find((t) => t.id === id),
      b = after.find((t) => t.id === id),
      headers = b?.headers || a!.headers;
    for (let r = 0; r < Math.max(a?.rows.length || 0, b?.rows.length || 0); r++)
      for (let c = 0; c < headers.length; c++) {
        const old = a?.rows[r]?.[c] ?? null,
          current = b?.rows[r]?.[c] ?? null;
        if (old !== current) {
          count++;
          if (changes.length < 100)
            changes.push({
              table: b?.title || a!.title,
              row: r + 1,
              field: headers[c],
              before: old,
              after: current,
            });
        }
      }
  }
  return {
    comparable: true,
    count,
    changes,
    truncated: count > changes.length,
  };
}
