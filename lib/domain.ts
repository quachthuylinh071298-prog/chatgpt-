import { z } from "zod";
import { topicGroups } from "./content-topics";
import { clinicalTopics, matchesHuuChung } from "./huu-chung-brief";
const webURL = z
  .string()
  .url()
  .refine((v) => {
    const u = new URL(v);
    return (
      ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
    );
  }, "URL phải dùng HTTP/HTTPS và không chứa mật khẩu");
export const projectSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    specialty: z.string().max(150).default(""),
    location: z.string().max(200).default(""),
    facebook: z.union([z.literal(""), webURL]).default(""),
    website: z.union([z.literal(""), webURL]).default(""),
    tiktok: z.union([z.literal(""), webURL]).default(""),
    youtube: z.union([z.literal(""), webURL]).default(""),
    services: z.string().max(1000).default(""),
    audience: z.string().max(1000).default(""),
    budget: z.number().finite().min(0).max(1e12).default(0),
    revenueGoal: z.number().finite().min(0).max(1e12).default(0),
    patientGoal: z.number().int().min(0).max(1e7).default(0),
    competitors: z.string().max(3000).default(""),
  })
  .strict();
export type ProjectInput = z.infer<typeof projectSchema>;
export type Project = ProjectInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export const metricKeys = [
  "reach",
  "nonFollowerReach",
  "views",
  "engagements",
  "followers",
  "leads",
  "bookings",
  "showUps",
  "newPatients",
  "spend",
  "revenue",
  "videoStarts",
  "videoCompletions",
] as const;
export type Metric = (typeof metricKeys)[number];
export const observationSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(
        (v) =>
          !Number.isNaN(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v,
        "Ngày không hợp lệ",
      ),
    ...Object.fromEntries(
      metricKeys.map((k) => [
        k,
        z.number().finite().min(0).max(1e15).nullable().optional(),
      ]),
    ),
  })
  .strict();
export type Observation = { date: string } & Partial<
  Record<Metric, number | null>
>;
export function aggregate(rows: Observation[]) {
  return Object.fromEntries(
    metricKeys.map((k) => {
      const values = rows
        .map((r) => r[k])
        .filter((v): v is number => v !== undefined && v !== null);
      return [k, values.length ? values.reduce((a, b) => a + b, 0) : null];
    }),
  ) as Record<Metric, number | null>;
}
export function kpis(rows: Observation[]) {
  const totals = aggregate(rows);
  // Ratios use only rows with both inputs. Never combine disjoint coverage.
  const ratio = (numerator: Metric, denominator: Metric, multiplier = 1) => {
    const paired = rows.filter(
      (r) => r[numerator] != null && r[denominator] != null,
    );
    if (!paired.length) return null;
    const n = paired.reduce((s, r) => s + r[numerator]!, 0),
      d = paired.reduce((s, r) => s + r[denominator]!, 0);
    return d > 0 ? (n / d) * multiplier : null;
  };
  return {
    ...totals,
    engagementRate: ratio("engagements", "reach", 100),
    bookingRate: ratio("bookings", "leads", 100),
    showUpRate: ratio("showUps", "bookings", 100),
    cpl: ratio("spend", "leads"),
    pac: ratio("spend", "newPatients"),
    retentionRate: ratio("videoCompletions", "videoStarts", 100),
    roas: ratio("revenue", "spend"),
    roi: null,
  };
}
export type KPI = ReturnType<typeof kpis>;
export function compare(old: KPI, current: KPI) {
  return Object.keys(current).map((key) => {
    const k = key as keyof KPI;
    const before = old[k],
      after = current[k];
    return {
      key,
      before,
      after,
      delta: before !== null && after !== null ? after - before : null,
      percent:
        before !== null && before !== 0 && after !== null
          ? ((after - before) / before) * 100
          : null,
    };
  });
}
export const steps = [
  "Khách hàng mục tiêu",
  "Đối thủ cạnh tranh",
  "SMART Goals & Marketing Funnel",
  "Chiến lược Marketing",
  "Triển khai & Ngân sách",
  "Đo lường & Tối ưu",
];
export type SourceLog = {
  name: string;
  url: string | null;
  status: "user_provided" | "editorial_snapshot" | "unavailable";
  collectedAt: string | null;
  reason: string;
  freshness: "new" | "unchanged" | "unavailable";
};
export type Research = {
  id: string;
  projectId: string;
  number: number;
  createdAt: string;
  start: string;
  end: string;
  status: "limited";
  fingerprint: string;
  metrics: KPI;
  rows: Observation[];
  project: Project;
  sourceLogs: SourceLog[];
  sections: {
    title: string;
    findings: string[];
    actions: string[];
    confidence: string;
  }[];
  aiText: string | null;
  aiStatus: string;
  summary: string;
  coverage: number;
};
export function contentIdeas(project: Project, count = 30) {
  const topics = topicGroups.flatMap((group) =>
    group.questions.map((question) => ({ pillar: group.pillar, question })),
  );
  if (matchesHuuChung(project.facebook))
    topics.unshift(
      ...clinicalTopics.map((question) => ({
        pillar: "Câu hỏi Nội Cơ xương khớp — cần bác sĩ duyệt",
        question,
      })),
    );
  return Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    pillar: topics[i % topics.length].pillar,
    angle: `${topics[i % topics.length].question}${i >= topics.length ? " — phiên bản hỏi đáp mở rộng" : ""}`,
    segment: project.audience || "Chưa xác định",
    stage: ["Awareness", "Interest", "Trust", "Consultation", "Booking"][i % 5],
    hook: topics[i % topics.length].question,
    message: "Thông tin giáo dục cần được bác sĩ kiểm duyệt trước khi đăng.",
    format: "Reels 45–90 giây",
    cta: "Tìm hiểu thông tin và đặt lịch tư vấn phù hợp",
    kpi: "Lead đủ điều kiện / lịch hẹn (chưa có baseline)",
    label: "Giả định chiến lược",
    script: `0–10s: Bác sĩ mở đầu bằng câu hỏi “${topics[i % topics.length].question}”. 10–25s: Nêu bối cảnh và lý do câu hỏi hữu ích. 25–60s: Bác sĩ hoặc vận hành cung cấp 2–3 ý đã xác minh, không kể ca bệnh định danh. 60–75s: Tóm tắt và mời người xem kiểm tra thông tin/đặt lịch trên kênh chính thức. Đây là dàn ý cần điền thông tin thực tế, không phải nội dung chuyên môn đã được duyệt.`,
    facebookDraft: `Bạn đang băn khoăn: ${topics[i % topics.length].question}\n[Điền 2–3 thông tin đã được bác sĩ/vận hành kiểm chứng.]\n[Thêm nguồn và ngày cập nhật.]\nXem thông tin trên kênh chính thức hoặc liên hệ để được hướng dẫn đặt lịch. Không cung cấp thông tin bệnh nhân trong bình luận.`,
    abTest:
      "Thử hook dạng câu hỏi so với checklist; giữ nguyên chủ đề và CTA, đánh giá lead/lịch hẹn trên cùng thời gian và phạm vi.",
    interviewQuestion: topics[i % topics.length].question,
  }));
}
export function actionPlan(budget: number) {
  return [
    {
      period: "Ngày 01–30",
      title: "Xây nền tảng dữ liệu & thương hiệu",
      tasks: [
        "Xác minh chuyên khoa, dịch vụ và bằng chứng chuyên môn",
        "Chuẩn hóa tracking lead → đặt lịch → đến khám",
        "Phỏng vấn bác sĩ và khách hàng trên dữ liệu được phép",
      ],
      owner: "Marketing Lead",
      deliverable: "Hồ sơ thương hiệu, baseline KPI, danh sách insight",
      priority: "Cao",
      budget: budget * 0.3,
    },
    {
      period: "Ngày 31–60",
      title: "Thử nghiệm nội dung & chuyển đổi",
      tasks: [
        "Sản xuất 12 video giáo dục được bác sĩ duyệt",
        "A/B test hook và CTA với mẫu đo lường rõ ràng",
        "Đánh giá lịch hẹn và chất lượng lead theo nội dung",
      ],
      owner: "Content + Vận hành",
      deliverable: "Content Matrix, báo cáo thử nghiệm",
      priority: "Cao",
      budget: budget * 0.4,
    },
    {
      period: "Ngày 61–90",
      title: "Tối ưu & nhân rộng có bằng chứng",
      tasks: [
        "Nhân rộng nội dung tạo lịch hẹn khi đủ dữ liệu",
        "Rà soát quy trình nhắc lịch và chăm sóc lại",
        "Cập nhật chiến lược theo phiên bản nghiên cứu mới",
      ],
      owner: "Marketing Lead + CRM",
      deliverable: "Báo cáo 90 ngày và kế hoạch quý tiếp theo",
      priority: "Vừa",
      budget: budget * 0.3,
    },
  ];
}
