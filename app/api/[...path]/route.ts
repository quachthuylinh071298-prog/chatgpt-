import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import ExcelJS from "exceljs";
import {
  configured,
  passwordMatches,
  newSession,
  validSession,
} from "@/lib/auth";
import {
  listProjects,
  saveProject,
  getProject,
  seed,
  observations,
  imports,
  importRows,
  reports,
  report,
  jobs,
  enqueue,
  db,
  content,
} from "@/lib/db";
import {
  projectSchema,
  contentIdeas,
  actionPlan,
  compare,
  observationSchema,
} from "@/lib/domain";
import { parseUpload, allowedColumns } from "@/lib/importer";
import { connectionStatus } from "@/lib/connectors";
import { isSameOriginRequest } from "@/lib/request-origin";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const attempts = new Map<string, { count: number; until: number }>();
const researchSchema = z
  .object({
    start: observationSchema.shape.date,
    end: observationSchema.shape.date,
    sources: z.array(z.enum(["uploaded", "web", "meta"])).min(1),
    useAI: z.boolean(),
  })
  .strict()
  .refine((r) => r.start <= r.end, "Ngày bắt đầu phải trước ngày kết thúc");
function response(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
async function handle(req: NextRequest) {
  const parts = req.nextUrl.pathname.slice(5).split("/");
  const method = req.method;
  try {
    if (
      method !== "GET" &&
      !isSameOriginRequest(req.headers, req.url, {
        appOrigin: process.env.APP_ORIGIN,
        codespace: process.env.CODESPACE_NAME,
        forwardingDomain: process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
      })
    )
      return response({ error: "Yêu cầu không cùng nguồn." }, 403);
    if (parts[0] === "auth" && method === "GET")
      return response({
        authenticated: validSession(req.cookies.get("mmi_session")?.value),
        configured: configured(),
      });
    if (parts[0] === "login" && method === "POST") {
      if (!configured())
        return response(
          {
            error:
              "Chưa cấu hình APP_PASSWORD (≥12 ký tự) và SESSION_SECRET (≥32 ký tự) trên server.",
          },
          503,
        );
      const key = "single-account";
      const now = Date.now();
      let limit = attempts.get(key);
      if (limit && limit.until > now && limit.count >= 8)
        return response(
          { error: "Quá nhiều lần thử. Thử lại sau 15 phút." },
          429,
        );
      if (!limit || limit.until < now) {
        limit = { count: 0, until: now + 15 * 60000 };
        attempts.set(key, limit);
      }
      limit.count++;
      const input = z
        .object({ password: z.string().max(256) })
        .parse(await req.json());
      if (!passwordMatches(input.password))
        return response({ error: "Mật khẩu không đúng." }, 401);
      attempts.delete(key);
      const result = response({ ok: true });
      result.cookies.set("mmi_session", newSession(), {
        httpOnly: true,
        sameSite: "strict",
        secure: req.headers.get("origin")?.startsWith("https://") === true,
        path: "/",
        maxAge: 43200,
      });
      return result;
    }
    if (!validSession(req.cookies.get("mmi_session")?.value))
      return response(
        { error: "Vui lòng đăng nhập trước khi truy cập dữ liệu." },
        401,
      );
    if (parts[0] === "logout" && method === "POST") {
      const result = response({ ok: true });
      result.cookies.delete("mmi_session");
      return result;
    }
    seed();
    if (parts[0] === "projects" && parts.length === 1) {
      if (method === "GET")
        return response({
          projects: listProjects(),
          connections: connectionStatus(),
        });
      if (method === "POST")
        return response(
          saveProject(projectSchema.parse(await req.json())),
          201,
        );
    }
    if (parts[0] === "template" && method === "GET")
      return new NextResponse(allowedColumns.join(",") + "\n", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="mau-so-lieu.csv"',
        },
      });
    if (parts[0] === "projects" && parts[1]) {
      const id = parts[1];
      const p = getProject(id);
      if (!p) return response({ error: "Không tìm thấy dự án." }, 404);
      if (parts.length === 2 && method === "PATCH")
        return response(saveProject(projectSchema.parse(await req.json()), id));
      if (parts.length === 2 && method === "GET")
        return response({
          project: p,
          rows: observations(id),
          imports: imports(id),
          reports: reports(id),
          jobs: jobs(id),
          content: content(id),
          ideas: contentIdeas(p),
          plan: actionPlan(p.budget),
        });
      if (parts[2] === "import" && method === "POST") {
        if (Number(req.headers.get("content-length") || 0) > 6 * 1024 * 1024)
          return response({ error: "Tệp quá lớn." }, 413);
        const form = await req.formData();
        const file = form.get("file");
        if (!(file instanceof File))
          return response({ error: "Chọn tệp CSV hoặc XLSX." }, 400);
        if (file.size > 5 * 1024 * 1024)
          return response({ error: "Tệp tối đa 5 MB." }, 413);
        const rows = await parseUpload(
          file.name,
          new Uint8Array(await file.arrayBuffer()),
        );
        importRows(id, rows, file.name.slice(0, 150));
        return response({
          count: rows.length,
          message:
            "Đã nhập. Ngày trùng sẽ thay thế toàn bộ dòng hiện tại; báo cáo cũ không thay đổi.",
        });
      }
      if (parts[2] === "research" && method === "POST") {
        const input = researchSchema.parse(await req.json());
        return response(enqueue(id, input), 202);
      }
      if (parts[2] === "content" && method === "POST") {
        const item = z
          .object({
            title: z.string().trim().min(2).max(200),
            url: z.union([
              z.literal(""),
              z
                .string()
                .url()
                .refine(
                  (v) => ["https:", "http:"].includes(new URL(v).protocol),
                  "URL phải dùng HTTP/HTTPS",
                ),
            ]),
            pillar: z.string().max(100),
            stage: z.enum([
              "Awareness",
              "Interest",
              "Trust",
              "Consultation",
              "Booking",
            ]),
            views: z.number().min(0).nullable(),
            leads: z.number().min(0).nullable(),
            bookings: z.number().min(0).nullable(),
          })
          .strict()
          .parse(await req.json());
        db.prepare("INSERT INTO content VALUES(?,?,?)").run(
          randomUUID(),
          id,
          JSON.stringify(item),
        );
        return response({ ok: true }, 201);
      }
      if (parts[2] === "compare" && method === "GET") {
        const a = report(req.nextUrl.searchParams.get("a") || ""),
          b = report(req.nextUrl.searchParams.get("b") || "");
        if (!a || !b || a.projectId !== id || b.projectId !== id)
          return response(
            { error: "Chọn hai phiên bản trong cùng dự án." },
            400,
          );
        return response({
          metrics: compare(a.metrics, b.metrics),
          periodsComparable: a.start === b.start && a.end === b.end,
          sourceChanges: b.sourceLogs,
          projectChanged:
            JSON.stringify(a.project) !== JSON.stringify(b.project),
          notice:
            "Chênh lệch mô tả dữ liệu đã nhập, không chứng minh quan hệ nhân quả hoặc thay đổi thị trường.",
        });
      }
      if (parts[2] === "export" && method === "GET") {
        const r = report(req.nextUrl.searchParams.get("report") || "");
        if (!r || r.projectId !== id)
          return response({ error: "Cần chọn báo cáo đã lưu." }, 404);
        const book = new ExcelJS.Workbook();
        book.creator = "Medical Marketing Intelligence";
        const summary = book.addWorksheet("Báo cáo");
        summary.addRows([
          ["Dự án", r.project.name],
          ["Phiên bản", r.number],
          ["Phạm vi", r.start + " → " + r.end],
          ["Thời điểm", r.createdAt],
          ["Giới hạn", r.summary],
          ["AI", r.aiStatus],
        ]);
        r.sections.forEach((s) =>
          summary.addRows([
            [s.title],
            ...s.findings.map((x) => [x]),
            ...s.actions.map((x) => ["Đề xuất — giả định", x]),
          ]),
        );
        const metrics = book.addWorksheet("KPI");
        metrics.addRows([
          ["Chỉ số", "Giá trị — trống là thiếu dữ liệu"],
          ...Object.entries(r.metrics),
        ]);
        const sources = book.addWorksheet("Nguồn");
        sources.addRows([
          ["Nguồn", "URL", "Trạng thái", "Thời điểm", "Độ mới", "Giới hạn"],
          ...r.sourceLogs.map((s) => [
            s.name,
            s.url,
            s.status,
            s.collectedAt,
            s.freshness,
            s.reason,
          ]),
        ]);
        const ideas = book.addWorksheet("Content Matrix");
        const generated = contentIdeas(r.project);
        ideas.addRows([
          Object.keys(generated[0]),
          ...generated.map((x) => Object.values(x)),
        ]);
        const plan = book.addWorksheet("Kế hoạch 90 ngày");
        plan.addRows([
          ["Giai đoạn", "Công việc", "Phụ trách", "Ngân sách — giả định"],
          ...actionPlan(r.project.budget).map((x) => [
            x.period,
            x.tasks.join("\n"),
            x.owner,
            x.budget,
          ]),
        ]);
        for (const s of book.worksheets) {
          s.getRow(1).font = { bold: true };
          s.columns.forEach((c) => {
            c.width = 30;
          });
          s.eachRow((row) =>
            row.eachCell((cell) => {
              cell.alignment = { wrapText: true, vertical: "top" };
            }),
          );
        }
        return new NextResponse(new Uint8Array(await book.xlsx.writeBuffer()), {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="bao-cao-v${r.number}.xlsx"`,
          },
        });
      }
    }
    return response({ error: "Không tìm thấy API." }, 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return response(
        {
          error: e.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        400,
      );
    if (e instanceof SyntaxError)
      return response({ error: "JSON không hợp lệ." }, 400);
    if (e instanceof Error && /SQLITE|database|constraint/i.test(e.message))
      return response(
        { error: "Dữ liệu đang được cập nhật. Vui lòng thử lại." },
        409,
      );
    return response(
      { error: e instanceof Error ? e.message : "Có lỗi khi xử lý yêu cầu." },
      400,
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
