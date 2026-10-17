import { createHash, randomUUID } from "node:crypto";
import {
  Project,
  Research,
  kpis,
  steps,
  Observation,
  SourceLog,
} from "./domain";
import { connectors } from "./connectors";
import { provider } from "./ai";
import { strategyTables } from "./strategy-tables";
import {
  briefVersion,
  briefCollectedAt,
  briefNotice,
  briefSections,
  briefSources,
  matchesHuuChung,
} from "./huu-chung-brief";
import { getProject, observations, reports, storeReport, db, Job } from "./db";
export type ResearchRequest = {
  start: string;
  end: string;
  sources: ("uploaded" | "web" | "meta")[];
  useAI: boolean;
};
export function fingerprint(
  p: Project,
  rows: Observation[],
  r: ResearchRequest,
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        p,
        rows,
        r,
        engineVersion: "research-3-tables",
        brief: matchesHuuChung(p.facebook) ? briefVersion : null,
      }),
    )
    .digest("hex");
}
export async function buildResearch(
  p: Project,
  rows: Observation[],
  r: ResearchRequest,
  previous: Research | null,
): Promise<Research> {
  const now = new Date().toISOString(),
    hash = fingerprint(p, rows, r),
    logs: SourceLog[] = [];
  if (r.sources.includes("uploaded"))
    logs.push({
      name: "Số liệu tổng hợp đã nhập",
      url: null,
      status: "user_provided",
      collectedAt: now,
      reason: `${rows.length} ngày trong phạm vi. Thời điểm này là lúc đọc dữ liệu nội bộ, không phải lúc thu thập từ nền tảng.`,
      freshness:
        previous && JSON.stringify(previous.rows) === JSON.stringify(rows)
          ? "unchanged"
          : "new",
    });
  if (r.sources.includes("meta"))
    logs.push(await connectors.meta.collect(p.facebook));
  if (r.sources.includes("web"))
    logs.push(await connectors.web.collect(p.website));
  const includeBrief =
    matchesHuuChung(p.facebook) &&
    r.sources.includes("web") &&
    r.start <= briefCollectedAt.slice(0, 10) &&
    r.end >= briefCollectedAt.slice(0, 10);
  if (includeBrief)
    for (const source of briefSources)
      logs.push({
        name: `${source.id} — ${source.name}`,
        url: source.url,
        status: "editorial_snapshot",
        collectedAt: briefCollectedAt,
        freshness: previous?.sourceLogs.some(
          (s) => s.url === source.url && s.collectedAt === briefCollectedAt,
        )
          ? "unchanged"
          : "new",
        reason: `Bản lưu biên soạn ngày 17/10/2026; lần chạy này không truy xuất lại trang. ${source.note}`,
      });
  const metrics = kpis(rows);
  let aiText: string | null = null,
    aiStatus = "Không sử dụng AI";
  if (r.useAI) {
    const ai = provider();
    if (!ai)
      aiStatus =
        "Chưa cấu hình AI; chỉ tạo phân tích quy tắc trên dữ liệu đã nhập.";
    else
      try {
        aiText = await ai.analyze({ project: { budget: p.budget }, metrics });
        aiStatus =
          "Đã tạo đề xuất AI — giả định, cần duyệt; không có nghiên cứu web.";
      } catch {
        aiStatus =
          "Không thể truy xuất AI: lỗi kết nối/timeout/cấu hình. Phân tích quy tắc vẫn được lưu; không giả lập kết quả AI.";
      }
  }
  const findings = [
    [
      `Nhóm khách hàng: ${p.audience || "Chưa có thông tin đã xác minh"}.`,
      "Chưa có khảo sát hoặc nghiên cứu thị trường có nguồn. Không đủ bằng chứng để kết luận persona, pain point hay quy mô thị trường.",
    ],
    [
      p.competitors
        ? `Danh sách do người dùng nhập: ${p.competitors}`
        : "Chưa có danh sách đối thủ.",
      "Chưa truy xuất nguồn đối thủ; không đủ dữ liệu để xếp hạng, so sánh USP hoặc lập SWOT thực chứng.",
    ],
    [
      `Có ${rows.length} ngày số liệu tổng hợp trong phạm vi.`,
      metrics.leads === null
        ? "Chưa có baseline lead đủ điều kiện."
        : `Lead do người dùng cung cấp: ${metrics.leads}.`,
      `Mục tiêu người dùng: ${p.patientGoal || "chưa nhập"} người bệnh; doanh thu ${p.revenueGoal || "chưa nhập"}. Đây là mục tiêu, không phải dự báo.`,
    ],
    [
      "Chưa đủ bằng chứng để khẳng định USP hoặc định vị cạnh tranh.",
      "Content Matrix và lịch nội dung là khung thử nghiệm, cần bác sĩ duyệt trước khi sử dụng.",
    ],
    [
      `Ngân sách 90 ngày do người dùng nhập: ${p.budget.toLocaleString("vi-VN")} ₫.`,
      "Đề xuất phân bổ 30% / 40% / 30% là giả định; không dự báo ROAS.",
    ],
    [
      metrics.bookingRate === null
        ? "Chưa đủ dữ liệu tính tỷ lệ đặt lịch."
        : `Tỷ lệ đặt lịch trên các ngày có cả lead và lịch hẹn: ${metrics.bookingRate.toFixed(1)}%.`,
      "ROI chưa tính do chưa có chi phí đầy đủ. Reach cộng theo ngày không phải số người duy nhất toàn kỳ.",
    ],
  ];
  const actions = [
    [
      "Xác minh chuyên khoa, địa điểm và dịch vụ",
      "Phỏng vấn từng phân khúc với sự đồng ý phù hợp",
    ],
    [
      "Bổ sung 5–10 đối thủ cùng chuyên khoa và địa bàn",
      "Lưu URL, thời điểm và bằng chứng trước khi benchmark",
    ],
    [
      "Theo dõi phễu Awareness → Interest → Trust → Consultation → Booking → Show-up → Retention → Referral",
      "Thử nghiệm mục tiêu sau khi đủ baseline",
    ],
    [
      "Thử nghiệm nội dung giải đáp và xây dựng niềm tin",
      "Gắn CTA và theo dõi lead → lịch hẹn → đến khám",
    ],
    [
      "Phân công Marketing Lead (A), Content (R), bác sĩ (C), vận hành (R)",
      "Đánh giá thử nghiệm mỗi tuần trước khi giải ngân tiếp",
    ],
    [
      "Giữ: quy trình đo lường có dữ liệu; sửa: điểm rơi chuyển đổi sau khi xác minh",
      "Dừng: kết luận không có bằng chứng; mới: bổ sung nguồn còn thiếu",
    ],
  ];
  if (includeBrief)
    briefSections.forEach((section, i) => {
      findings[i] = [
        ...(i === 2 || i === 4 || i === 5 ? findings[i] : []),
        ...section.findings,
      ];
      actions[i] = section.actions;
    });
  return {
    id: randomUUID(),
    projectId: p.id,
    number: (previous?.number || 0) + 1,
    createdAt: now,
    start: r.start,
    end: r.end,
    status: "limited",
    fingerprint: hash,
    metrics,
    rows,
    project: p,
    sourceLogs: logs,
    sections: steps.map((title, i) => ({
      title,
      findings: findings[i],
      actions: actions[i],
      confidence: includeBrief
        ? "Nguồn công khai đã đọc (bản lưu 17/10) + giả thuyết chiến lược cần kiểm chứng"
        : "Dữ liệu người dùng / giả định chiến lược; chưa xác minh độc lập",
    })),
    strategyTables: includeBrief ? strategyTables(p) : undefined,
    aiText,
    aiStatus,
    summary: includeBrief
      ? `${briefNotice} Có ${rows.length} ngày số liệu người dùng trong phạm vi.`
      : `Phân tích giới hạn trên ${rows.length} ngày dữ liệu người dùng. ${logs.some((l) => l.status === "unavailable") ? "Có nguồn không thể truy xuất. " : ""}Không phải báo cáo nghiên cứu web đã xác minh.`,
    coverage: logs.length
      ? Math.round(
          (logs.filter(
            (l) =>
              l.status === "editorial_snapshot" ||
              (l.status === "user_provided" && rows.length > 0),
          ).length /
            logs.length) *
            100,
        )
      : 0,
  };
}
export async function processJob(job: Job) {
  const request = JSON.parse(job.request) as ResearchRequest;
  try {
    const p = getProject(job.project_id);
    if (!p) throw new Error("Không tìm thấy dự án");
    const rows = request.sources.includes("uploaded")
      ? observations(p.id, request.start, request.end)
      : [];
    const previous = reports(p.id)[0] || null;
    if (previous?.fingerprint === fingerprint(p, rows, request))
      throw new Error(
        "Không có thay đổi trong dữ liệu, hồ sơ hoặc phạm vi. Chọn nguồn mới hoặc cập nhật dữ liệu trước khi nghiên cứu lại.",
      );
    const report = await buildResearch(p, rows, request, previous);
    db.exec("BEGIN IMMEDIATE");
    try {
      storeReport(report);
      db.prepare(
        "UPDATE jobs SET status='done',report_id=?,updated_at=? WHERE id=?",
      ).run(report.id, new Date().toISOString(), job.id);
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  } catch (e) {
    db.prepare(
      "UPDATE jobs SET status='failed',error=?,updated_at=? WHERE id=?",
    ).run(
      e instanceof Error ? e.message : "Không thể tạo báo cáo",
      new Date().toISOString(),
      job.id,
    );
  }
}
export function claimJob(): Job | null {
  db.exec("BEGIN IMMEDIATE");
  try {
    const job = db
      .prepare(
        "SELECT * FROM jobs WHERE status='queued' ORDER BY created_at LIMIT 1",
      )
      .get() as Job | undefined;
    if (job)
      db.prepare(
        "UPDATE jobs SET status='running',updated_at=? WHERE id=?",
      ).run(new Date().toISOString(), job.id);
    db.exec("COMMIT");
    return job || null;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
