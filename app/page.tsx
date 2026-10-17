"use client";
import { useEffect, useState, useCallback, FormEvent } from "react";
import {
  Activity,
  LayoutDashboard,
  FolderKanban,
  Search,
  ChartNoAxesCombined,
  Users,
  Target,
  Clapperboard,
  CalendarDays,
  Gauge,
  History,
  FileDown,
  Settings,
  Plus,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Upload,
  ChevronDown,
  Check,
  Database,
  ShieldCheck,
  ExternalLink,
  X,
  LogOut,
  PanelLeft,
  Stethoscope,
  Info,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { matchesHuuChung } from "@/lib/huu-chung-brief";
import {
  Project,
  ProjectInput,
  Research,
  Observation,
  kpis,
  compare,
  contentIdeas,
  actionPlan,
  steps,
} from "@/lib/domain";
const nav = [
  ["Tổng quan", LayoutDashboard],
  ["Dự án", FolderKanban],
  ["Nghiên cứu thị trường", Search],
  ["Phân tích đối thủ", ChartNoAxesCombined],
  ["Customer Insight", Users],
  ["Marketing Strategy", Target],
  ["Content Intelligence", Clapperboard],
  ["Kế hoạch 90 ngày", CalendarDays],
  ["KPI & Performance", Gauge],
  ["Lịch sử nghiên cứu", History],
  ["Báo cáo & Xuất file", FileDown],
  ["Cài đặt & Kết nối", Settings],
] as [string, LucideIcon][];
type ContentItem = {
  id: string;
  title: string;
  url: string;
  pillar: string;
  stage: string;
  views: number | null;
  leads: number | null;
  bookings: number | null;
};
type Detail = {
  project: Project;
  rows: Observation[];
  imports: { name: string; rowCount: number; createdAt: string }[];
  reports: Research[];
  jobs: {
    id: string;
    status: string;
    error: string | null;
    report_id: string | null;
    created_at: string;
  }[];
  content: ContentItem[];
};
type Connection = { name: string; status: string; detail: string };
const emptyProject: ProjectInput = {
  name: "",
  specialty: "",
  location: "",
  facebook: "",
  website: "",
  tiktok: "",
  youtube: "",
  services: "",
  audience: "",
  budget: 0,
  revenueGoal: 0,
  patientGoal: 0,
  competitors: "",
};
const dateAt = (offset = 0) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + offset * 86400000));
const money = (v: number | null | undefined) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) +
      " ₫";
const num = (v: number | null | undefined) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(v);
const dt = (v: string) =>
  new Date(v).toLocaleString("vi-VN", {
    timeZone: "Asia/Bangkok",
    dateStyle: "short",
    timeStyle: "short",
  });
const labels: Record<string, string> = {
  reach: "Lượt tiếp cận cộng theo ngày",
  nonFollowerReach: "Tiếp cận người chưa theo dõi",
  views: "Lượt xem video",
  engagements: "Lượt tương tác",
  followers: "Người theo dõi tăng thêm",
  leads: "Lead đủ điều kiện",
  bookings: "Lượt đặt lịch",
  showUps: "Lượt đến khám",
  newPatients: "Người bệnh mới",
  spend: "Chi phí Marketing",
  revenue: "Doanh thu",
  videoStarts: "Lượt bắt đầu video",
  videoCompletions: "Lượt hoàn tất video",
  engagementRate: "Tỷ lệ tương tác (%)",
  bookingRate: "Tỷ lệ đặt lịch (%)",
  showUpRate: "Tỷ lệ đến khám (%)",
  cpl: "Chi phí / lead",
  pac: "Chi phí / người bệnh mới",
  retentionRate: "Tỷ lệ hoàn tất video (%)",
  roas: "ROAS (lần)",
  roi: "ROI (thiếu chi phí đầy đủ)",
};
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch("/api/" + path, {
    ...options,
    headers:
      options?.body instanceof FormData
        ? undefined
        : { "Content-Type": "application/json", ...options?.headers },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Không thể kết nối.");
  return body;
}
function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Database size={25} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export default function App() {
  const [auth, setAuth] = useState<{
      authenticated: boolean;
      configured: boolean;
      loginVersion?: string;
    } | null>(null),
    [password, setPassword] = useState(""),
    [loginError, setLoginError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]),
    [connections, setConnections] = useState<Connection[]>([]),
    [selected, setSelected] = useState(""),
    [detail, setDetail] = useState<Detail | null>(null),
    [active, setActive] = useState(0),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState<
      "project" | "research" | "import" | "content" | null
    >(null),
    [editing, setEditing] = useState(false),
    [form, setForm] = useState<ProjectInput>(emptyProject),
    [file, setFile] = useState<File | null>(null),
    [confirmed, setConfirmed] = useState(false);
  const [days, setDays] = useState("90"),
    [start, setStart] = useState(dateAt(-89)),
    [end, setEnd] = useState(dateAt()),
    [sources, setSources] = useState(["uploaded", "web", "meta"]),
    [useAI, setUseAI] = useState(false);
  const [reportId, setReportId] = useState(""),
    [section, setSection] = useState(0),
    [compareA, setCompareA] = useState(""),
    [compareB, setCompareB] = useState(""),
    [contentForm, setContentForm] = useState({
      title: "",
      url: "",
      pillar: "Giáo dục sức khỏe",
      stage: "Awareness",
      views: "",
      leads: "",
      bookings: "",
    }),
    [ideaLimit, setIdeaLimit] = useState(30),
    [contentTab, setContentTab] = useState("library");
  useEffect(() => {
    api<{ authenticated: boolean; configured: boolean; loginVersion?: string }>(
      "auth",
    )
      .then(setAuth)
      .catch((e) => setError(e.message));
  }, []);
  const loadList = useCallback(async () => {
    const data = await api<{ projects: Project[]; connections: Connection[] }>(
      "projects",
    );
    setProjects(data.projects);
    setConnections(data.connections);
    setSelected((current) => current || data.projects[0]?.id || "");
  }, []);
  const loadDetail = useCallback(async () => {
    if (!selected) return;
    const data = await api<Detail>("projects/" + selected);
    setDetail(data);
  }, [selected]);
  useEffect(() => {
    if (auth?.authenticated) loadList().catch((e) => setError(e.message));
  }, [auth, loadList]);
  useEffect(() => {
    setDetail(null);
    setReportId("");
    setCompareA("");
    setCompareB("");
    if (auth?.authenticated) loadDetail().catch((e) => setError(e.message));
  }, [selected, auth, loadDetail]);
  const pending = detail?.jobs.some(
    (j) => j.status === "queued" || j.status === "running",
  );
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(
      () => loadDetail().catch((e) => setError(e.message)),
      2500,
    );
    return () => clearInterval(timer);
  }, [pending, loadDetail]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const p = detail?.project,
    report =
      detail?.reports.find((r) => r.id === reportId) || detail?.reports[0],
    metrics = kpis(detail?.rows || []),
    ideas = contentIdeas(
      p || { ...emptyProject, id: "", createdAt: "", updatedAt: "" },
      ideaLimit,
    ),
    plan = actionPlan(p?.budget || 0);
  function openProject(edit = false) {
    setEditing(edit);
    if (edit && p) {
      const { id, createdAt, updatedAt, ...input } = p;
      void id;
      void createdAt;
      void updatedAt;
      setForm(input);
    } else setForm({ ...emptyProject });
    setModal("project");
    setError("");
  }
  async function submit(event: FormEvent, action: () => Promise<void>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể thực hiện");
    } finally {
      setBusy(false);
    }
  }
  function go(i: number) {
    setActive(i);
    setMobile(false);
    setError("");
  }
  const title = nav[active][0];
  if (!auth)
    return (
      <main className="loading">
        <Activity className="spin" />
        <p>Đang mở không gian làm việc…</p>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  if (!auth.authenticated)
    return (
      <main className="login">
        <section className="login-art">
          <div className="brand">
            <div className="brand-icon">
              <Activity />
            </div>
            MedIntel<span>®</span>
          </div>
          <div>
            <Badge tone="light">MEDICAL MARKETING INTELLIGENCE</Badge>
            <h1>
              Chiến lược tốt.
              <br />
              Bắt đầu từ
              <br />
              <em>bằng chứng.</em>
            </h1>
            <p>
              Không gian nghiên cứu và phát triển thương hiệu y tế, từ dữ liệu
              đến hành động.
            </p>
            <div className="login-lines">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <small>AI Marketing Director · Phiên bản MVP</small>
        </section>
        <section className="login-panel">
          <div className="login-form">
            <div className="eyebrow">CHÀO MỪNG TRỞ LẠI</div>
            <h2>Mở không gian làm việc</h2>
            <p>Đăng nhập để bảo vệ dữ liệu nghiên cứu của bạn.</p>
            {!auth.configured ? (
              <div className="notice">
                <Settings size={20} />
                <div>
                  <b>Cần thiết lập lần đầu trên server</b>
                  <p>
                    Đặt APP_PASSWORD (ít nhất 12 ký tự) và SESSION_SECRET (ít
                    nhất 32 ký tự) trong .env.local, sau đó khởi động lại ứng
                    dụng. Xem README để biết cách chạy.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) =>
                  submit(e, async () => {
                    await api("login", {
                      method: "POST",
                      body: JSON.stringify({ password }),
                    });
                    setAuth({ ...auth, authenticated: true });
                    setPassword("");
                  }).catch((e) => setLoginError(e.message))
                }
              >
                <label>
                  Mật khẩu không gian
                  <input
                    autoFocus
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={256}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                {(error || loginError) && (
                  <p className="error" role="alert">
                    {error || loginError}
                  </p>
                )}
                <button className="btn primary wide" disabled={busy}>
                  {busy ? "Đang đăng nhập…" : "Đăng nhập"}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
            <p style={{ fontSize: 10, marginTop: 16 }}>
              Bản đăng nhập: {auth.loginVersion || "1"}
            </p>
            <div className="login-foot">
              <ShieldCheck size={17} /> Chỉ sử dụng dữ liệu Marketing tổng hợp.
              <br />
              Không nhập thông tin định danh bệnh nhân.
            </div>
          </div>
        </section>
      </main>
    );
  return (
    <div className="app">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          MedIntel<span>®</span>
        </div>
        <div className="workspace-label">KHÔNG GIAN LÀM VIỆC</div>
        <button className="workspace" onClick={() => go(1)}>
          <span className="workspace-avatar">
            <Stethoscope size={20} />
          </span>
          <span>
            Healthcare Marketing<small>Không gian cá nhân</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <nav>
          {nav.map(([name, Icon], i) => (
            <button
              key={name}
              className={active === i ? "nav-item active" : "nav-item"}
              onClick={() => go(i)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {i === 9 && detail?.reports.length ? (
                <small>{detail.reports.length}</small>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="evidence-card">
            <ShieldCheck size={21} />
            <b>Bằng chứng dẫn đường</b>
            <p>
              Mỗi kết luận cần một nguồn.
              <br />
              Mỗi chiến lược cần kiểm chứng.
            </p>
          </div>
          <button
            className="profile"
            onClick={() =>
              api("logout", { method: "POST" })
                .then(() => {
                  setDetail(null);
                  setProjects([]);
                  setAuth({ ...auth, authenticated: false });
                })
                .catch((e) => setError(e.message))
            }
          >
            <span className="avatar">MK</span>
            <span>
              Marketing Manager<small>Đăng xuất</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="crumb">
            <button
              className="icon-btn mobile-toggle"
              aria-label="Menu"
              onClick={() => setMobile(!mobile)}
            >
              <PanelLeft />
            </button>
            <span>Không gian làm việc</span>
            <span>/</span>
            <b>{title}</b>
          </div>
          <div className="topbar-right">
            <span className="private">
              <span />
              Không gian riêng tư
            </span>
            <span className="avatar small">MK</span>
          </div>
        </header>
        <main className="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">AI MARKETING DIRECTOR</div>
              <h1>{active === 0 ? "Từ dữ liệu đến chiến lược." : title}</h1>
              <p>
                {active === 0
                  ? "Toàn cảnh hoạt động Marketing y tế, trong một không gian."
                  : "Nghiên cứu có bằng chứng. Quyết định có cơ sở."}
              </p>
            </div>
            <button className="btn primary" onClick={() => openProject()}>
              <Plus size={18} />
              Tạo dự án mới
            </button>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="icon-btn"
                aria-label="Đóng lỗi"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="project-toolbar">
            <div>
              <span className="toolbar-label">Dự án đang làm việc</span>
              <select
                aria-label="Chọn dự án"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {projects.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="toolbar-actions">
              <button
                className="btn"
                onClick={() => {
                  setModal("import");
                  setFile(null);
                  setConfirmed(false);
                }}
              >
                <Upload size={16} />
                Nhập dữ liệu
              </button>
              <button
                className="btn primary"
                disabled={pending || !p}
                onClick={() => setModal("research")}
              >
                <RefreshCw size={16} className={pending ? "spin" : ""} />
                {pending ? "Đang xử lý…" : "Nghiên cứu lại"}
              </button>
            </div>
          </div>
          {p && matchesHuuChung(p.facebook) && (
            <div className="notice">
              <Search size={20} />
              <div>
                <b>
                  Đã có bản nghiên cứu biên soạn riêng cho BS. Hữu Thị Chung
                </b>
                <p>
                  Đối chiếu 7 nguồn công khai ngày 17/10/2026, phân tích sáu
                  bước và 30 chủ đề chuyên khoa. Không cần AI key để đọc bản
                  này; nguồn không được tự cập nhật.
                </p>
                <Link className="btn primary" href="/research-brief">
                  Đọc bản nghiên cứu có nguồn <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
          {!detail ? (
            <div className="card">
              <Empty title="Đang tải dự án" text="Đang đọc dữ liệu đã lưu…" />
            </div>
          ) : (
            <>
              {pending && (
                <div className="notice">
                  <Clock size={20} />
                  <div>
                    <b>
                      Tác vụ{" "}
                      {detail.jobs.find((j) =>
                        ["queued", "running"].includes(j.status),
                      )?.status === "queued"
                        ? "đang chờ worker"
                        : "đang xử lý"}
                    </b>
                    <p>
                      Trạng thái tự cập nhật. Nếu chờ lâu, hãy chạy{" "}
                      <code>npm run worker</code> trong terminal thứ hai.
                    </p>
                  </div>
                </div>
              )}
              {active === 0 && (
                <>
                  <div className="hero-card">
                    <div className="hero-copy">
                      <Badge tone="light">
                        RESEARCH WORKSPACE <span className="tiny-dot" /> MVP
                      </Badge>
                      <h2>
                        Hiểu đúng dữ liệu.
                        <br />
                        <span>Tăng trưởng có định hướng.</span>
                      </h2>
                      <p>
                        Kết nối nghiên cứu, chiến lược và hiệu quả Marketing.
                        <br />
                        Mỗi lần cập nhật là một bước tiến có thể đo lường.
                      </p>
                      <button className="hero-link" onClick={() => go(2)}>
                        Khám phá quy trình nghiên cứu <ArrowUpRight size={18} />
                      </button>
                    </div>
                    <div className="hero-visual" aria-hidden="true">
                      <div className="orbit one" />
                      <div className="orbit two" />
                      <div className="orbit three" />
                      <div className="visual-core">
                        <Activity size={58} />
                      </div>
                      <div className="floating f1">
                        <Database size={19} />
                        <span>Dữ liệu</span>
                      </div>
                      <div className="floating f2">
                        <Target size={19} />
                        <span>Chiến lược</span>
                      </div>
                      <div className="floating f3">
                        <ChartNoAxesCombined size={19} />
                        <span>Tăng trưởng</span>
                      </div>
                      <span className="orbit-point p1" />
                      <span className="orbit-point p2" />
                    </div>
                  </div>
                  <div className="stats-grid">
                    {[
                      [
                        FolderKanban,
                        "Dự án đang quản lý",
                        projects.length,
                        "Thương hiệu trong không gian",
                        "blue",
                      ],
                      [
                        Layers,
                        "Phiên bản nghiên cứu",
                        detail.reports.length,
                        "Lưu trữ độc lập, không ghi đè",
                        "cyan",
                      ],
                      [
                        Database,
                        "Ngày có dữ liệu",
                        detail.rows.length,
                        "Dữ liệu do người dùng cung cấp",
                        "violet",
                      ],
                      [
                        ShieldCheck,
                        "Nguồn công khai trong báo cáo",
                        report?.sourceLogs.filter(
                          (s) => s.status === "editorial_snapshot",
                        ).length || 0,
                        "Bản lưu có ngày; chưa tự truy xuất lại",
                        "amber",
                      ],
                    ].map(([Icon, label, value, caption, color]) => {
                      const I = Icon as LucideIcon;
                      return (
                        <div className="stat card" key={String(label)}>
                          <div className="stat-top">
                            <span>{String(label)}</span>
                            <div className={"stat-icon " + color}>
                              <I size={19} />
                            </div>
                          </div>
                          <strong>{String(value).padStart(2, "0")}</strong>
                          <small>{String(caption)}</small>
                        </div>
                      );
                    })}
                  </div>
                  <div className="dashboard-grid">
                    <section className="card research-overview">
                      <div className="card-heading">
                        <div>
                          <h2>Hành trình nghiên cứu</h2>
                          <p>Sáu bước để xây dựng chiến lược vững chắc</p>
                        </div>
                        <Badge tone="gray">6 bước</Badge>
                      </div>
                      <div className="steps-grid">
                        {steps.map((s, i) => (
                          <button
                            key={s}
                            className="step-card"
                            onClick={() => {
                              setSection(i);
                              go(2);
                            }}
                          >
                            <span className="step-number">0{i + 1}</span>
                            <h3>{s}</h3>
                            <span className="step-status">
                              {report
                                ? "Có phân tích giới hạn"
                                : "Chưa nghiên cứu"}
                              <ArrowUpRight size={14} />
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="card-footer">
                        <Info size={15} /> Kết quả luôn đi kèm trạng thái nguồn
                        và mức độ tin cậy.
                      </div>
                    </section>
                    <section className="card source-card">
                      <div className="card-heading">
                        <div>
                          <h2>Sức khỏe dữ liệu</h2>
                          <p>Sẵn sàng trước mỗi quyết định</p>
                        </div>
                        <Database size={20} />
                      </div>
                      <div className="coverage">
                        <div
                          className="coverage-ring"
                          style={
                            {
                              "--progress": `${report?.coverage || 0}%`,
                            } as React.CSSProperties
                          }
                        >
                          <strong>
                            {report?.coverage || 0}
                            <small>%</small>
                          </strong>
                        </div>
                        <div>
                          <h3>Độ phủ nguồn đã chọn</h3>
                          <p>
                            {report
                              ? "Nguồn có dữ liệu trong lần phân tích gần nhất"
                              : "Chưa có phiên bản nghiên cứu"}
                          </p>
                        </div>
                      </div>
                      <div className="source-line">
                        <span>
                          <i
                            className={detail.rows.length ? "dot green" : "dot"}
                          />
                          Dữ liệu đã nhập
                        </span>
                        <Badge tone={detail.rows.length ? "green" : "gray"}>
                          {detail.rows.length ? "Có dữ liệu" : "Chưa có"}
                        </Badge>
                      </div>
                      <div className="source-line">
                        <span>
                          <i className="dot amber" />
                          Website / Web research
                        </span>
                        <small>Chưa kết nối</small>
                      </div>
                      <div className="source-line">
                        <span>
                          <i className="dot amber" />
                          Facebook / Meta
                        </span>
                        <small>Chưa kết nối</small>
                      </div>
                      <button className="text-link" onClick={() => go(11)}>
                        Quản lý kết nối dữ liệu <ArrowRight size={15} />
                      </button>
                    </section>
                  </div>
                  <div className="dashboard-grid bottom-grid">
                    <section className="card">
                      <div className="card-heading">
                        <div>
                          <h2>Nghiên cứu gần đây</h2>
                          <p>Mọi cập nhật đều được lưu lại</p>
                        </div>
                        <button className="text-link" onClick={() => go(9)}>
                          Xem lịch sử <ArrowRight size={15} />
                        </button>
                      </div>
                      {detail.reports.length ? (
                        detail.reports.slice(0, 3).map((r) => (
                          <button
                            key={r.id}
                            className="report-row"
                            onClick={() => {
                              setReportId(r.id);
                              go(10);
                            }}
                          >
                            <span className="document-icon">
                              <FileDown size={21} />
                            </span>
                            <span>
                              <b>Phân tích Marketing · Phiên bản {r.number}</b>
                              <small>
                                {dt(r.createdAt)} · {r.rows.length} ngày dữ liệu
                              </small>
                            </span>
                            <Badge tone="amber">Giới hạn</Badge>
                            <ArrowUpRight size={17} />
                          </button>
                        ))
                      ) : (
                        <Empty
                          title="Sẵn sàng cho nghiên cứu đầu tiên"
                          text="Nhập số liệu để bắt đầu phân tích. Không có dữ liệu mẫu giả lập."
                          action={
                            <button
                              className="text-link"
                              onClick={() => setModal("import")}
                            >
                              Nhập dữ liệu đầu tiên <ArrowRight size={15} />
                            </button>
                          }
                        />
                      )}
                    </section>
                    <section className="next-step card">
                      <div className="next-icon">
                        <Target size={23} />
                      </div>
                      <div className="eyebrow">BƯỚC TIẾP THEO</div>
                      <h2>
                        Hoàn thiện hồ sơ.
                        <br />
                        Mở rộng góc nhìn.
                      </h2>
                      <p>
                        Chuyên khoa, dịch vụ và khách hàng mục tiêu giúp chiến
                        lược sát với thực tế hơn.
                      </p>
                      <button className="btn" onClick={() => openProject(true)}>
                        Cập nhật hồ sơ <ArrowRight size={16} />
                      </button>
                    </section>
                  </div>
                </>
              )}
              {active === 1 && (
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>Danh mục thương hiệu</h2>
                      <p>Mỗi dự án có dữ liệu và lịch sử riêng</p>
                    </div>
                    <Badge>{projects.length} dự án</Badge>
                  </div>
                  <div className="projects-grid">
                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className={
                          "project-card " +
                          (selected === project.id ? "selected" : "")
                        }
                      >
                        <div className="project-monogram">
                          <Stethoscope />
                        </div>
                        <Badge tone="gray">Người dùng cung cấp</Badge>
                        <h3>{project.name}</h3>
                        <p>
                          {project.specialty || "Chuyên khoa chưa xác minh"}
                        </p>
                        <p>{project.location || "Chưa có địa điểm khám"}</p>
                        <button
                          className="text-link"
                          onClick={() => {
                            setSelected(project.id);
                            go(0);
                          }}
                        >
                          Mở dự án <ArrowRight size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                  <div className="detail-fields">
                    {[
                      ["Chuyên khoa", p?.specialty],
                      ["Địa điểm", p?.location],
                      ["Dịch vụ ưu tiên", p?.services],
                      ["Khách hàng", p?.audience],
                      ["Ngân sách 90 ngày", money(p?.budget)],
                      ["Mục tiêu người bệnh", p?.patientGoal || "Chưa nhập"],
                      ["Mục tiêu doanh thu", money(p?.revenueGoal)],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <small>{l}</small>
                        <b>{v || "Chưa xác minh / chưa nhập"}</b>
                      </div>
                    ))}
                  </div>
                  <button className="btn" onClick={() => openProject(true)}>
                    Chỉnh sửa dự án hiện tại
                  </button>
                  <div className="channel-links">
                    {[
                      ["Facebook", p?.facebook],
                      ["Website", p?.website],
                      ["TikTok", p?.tiktok],
                      ["YouTube", p?.youtube],
                    ].map(
                      ([l, v]) =>
                        v && (
                          <a key={l} href={v} target="_blank" rel="noreferrer">
                            {l}
                            <ExternalLink size={14} />
                          </a>
                        ),
                    )}
                  </div>
                </section>
              )}
              {[2, 3, 4, 5].includes(active) && (
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>
                        {active === 2 ? "Research Engine · Sáu bước" : title}
                      </h2>
                      <p>
                        {report
                          ? `Phiên bản ${report.number} · ${dt(report.createdAt)}`
                          : "Chưa có báo cáo trong dự án này"}
                      </p>
                    </div>
                    {report && <Badge tone="amber">Phân tích giới hạn</Badge>}
                  </div>
                  {!report ? (
                    <Empty
                      title="Chưa có nghiên cứu"
                      text="Nhập dữ liệu và chọn Nghiên cứu lại. Khi nguồn bên ngoài chưa kết nối, hệ thống chỉ tạo báo cáo giới hạn có giải thích."
                      action={
                        <button
                          className="btn primary"
                          onClick={() => setModal("research")}
                        >
                          Tạo phiên bản đầu tiên
                        </button>
                      }
                    />
                  ) : (
                    <>
                      <div className="notice">
                        <Info size={20} />
                        <div>
                          <b>{report.summary}</b>
                          <p>
                            Nhận định về thị trường, khách hàng và đối thủ chưa
                            được xác minh bên ngoài.
                          </p>
                        </div>
                      </div>
                      <div className="research-tabs">
                        {steps.map((s, i) => (
                          <button
                            className={
                              (active === 3
                                ? 1
                                : active === 4
                                  ? 0
                                  : active === 5
                                    ? 3
                                    : section) === i
                                ? "selected"
                                : ""
                            }
                            key={s}
                            onClick={() => {
                              setSection(i);
                              setActive(2);
                            }}
                          >
                            0{i + 1} · {s}
                          </button>
                        ))}
                      </div>
                      <ResearchSection
                        report={report}
                        index={
                          active === 3
                            ? 1
                            : active === 4
                              ? 0
                              : active === 5
                                ? 3
                                : section
                        }
                      />
                      {active === 5 && (
                        <button className="btn" onClick={() => go(6)}>
                          Mở Content Matrix <ArrowRight size={15} />
                        </button>
                      )}
                      <SourceTable report={report} />
                    </>
                  )}
                </section>
              )}
              {active === 6 && (
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>Content Intelligence</h2>
                      <p>
                        Ưu tiên chất lượng lead và lịch hẹn, cùng với lượt xem
                      </p>
                    </div>
                    <button
                      className="btn primary"
                      onClick={() => setModal("content")}
                    >
                      <Plus size={17} />
                      Thêm nội dung
                    </button>
                  </div>
                  <div className="tabs">
                    <button
                      className={contentTab === "library" ? "selected" : ""}
                      onClick={() => setContentTab("library")}
                    >
                      Thư viện đã nhập
                    </button>
                    <button
                      className={contentTab === "matrix" ? "selected" : ""}
                      onClick={() => setContentTab("matrix")}
                    >
                      Content Matrix · giả định
                    </button>
                  </div>
                  {contentTab === "library" ? (
                    detail.content.length ? (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Nội dung</th>
                              <th>Pillar / Funnel</th>
                              <th>Lượt xem</th>
                              <th>Lead</th>
                              <th>Lịch hẹn</th>
                              <th>Trùng chủ đề</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...detail.content]
                              .sort(
                                (a, b) =>
                                  (b.bookings ?? -1) - (a.bookings ?? -1) ||
                                  (b.leads ?? -1) - (a.leads ?? -1),
                              )
                              .map((c) => (
                                <tr key={c.id}>
                                  <td>
                                    <b>{c.title}</b>
                                    {c.url && (
                                      <a
                                        href={c.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Mở nguồn ↗
                                      </a>
                                    )}
                                  </td>
                                  <td>
                                    {c.pillar}
                                    <small>{c.stage}</small>
                                  </td>
                                  <td>{num(c.views)}</td>
                                  <td>{num(c.leads)}</td>
                                  <td>{num(c.bookings)}</td>
                                  <td>
                                    {detail.content.filter(
                                      (x) =>
                                        x.title.trim().toLowerCase() ===
                                        c.title.trim().toLowerCase(),
                                    ).length > 1
                                      ? "Có trùng tiêu đề"
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <p className="table-note">
                          Xếp theo lịch hẹn, sau đó lead. Đây là dữ liệu người
                          dùng cung cấp, không phải bằng chứng nhân quả. Chưa tự
                          động phát hiện content gap.
                        </p>
                      </div>
                    ) : (
                      <Empty
                        title="Xây thư viện nội dung của bạn"
                        text="Thêm bài viết hoặc video cùng chỉ số tổng hợp. Không xếp hạng hiệu quả chỉ dựa trên lượt xem."
                        action={
                          <button
                            className="text-link"
                            onClick={() => setModal("content")}
                          >
                            Thêm nội dung <Plus size={15} />
                          </button>
                        }
                      />
                    )
                  ) : (
                    <>
                      <div className="notice">
                        <Info size={20} />
                        <div>
                          <b>Khung ý tưởng mẫu — giả định chiến lược</b>
                          <p>
                            Chưa phải insight nghiên cứu. Các ý tưởng dùng cấu
                            trúc lặp, cần biên tập và bác sĩ duyệt chuyên môn.
                          </p>
                        </div>
                      </div>
                      <label className="inline-label">
                        Phạm vi lịch nội dung
                        <select
                          value={ideaLimit}
                          onChange={(e) => setIdeaLimit(Number(e.target.value))}
                        >
                          <option value={30}>30 ngày / ý tưởng</option>
                          <option value={60}>60 ngày / ý tưởng</option>
                          <option value={90}>90 ngày / ý tưởng</option>
                        </select>
                      </label>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Ngày</th>
                              <th>Pillar / Angle</th>
                              <th>Nhóm / Funnel</th>
                              <th>Hook / CTA</th>
                              <th>Kịch bản Reels</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ideas.map((c) => (
                              <tr key={c.day}>
                                <td>{String(c.day).padStart(2, "0")}</td>
                                <td>
                                  <b>{c.pillar}</b>
                                  <small>{c.angle}</small>
                                </td>
                                <td>
                                  {c.segment}
                                  <small>{c.stage}</small>
                                </td>
                                <td>
                                  {c.hook}
                                  <small>CTA: {c.cta}</small>
                                </td>
                                <td>
                                  <details>
                                    <summary>45–90 giây</summary>
                                    <p>{c.script}</p>
                                    <small>{c.message}</small>
                                  </details>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              )}
              {active === 7 && (
                <>
                  <div className="notice">
                    <Info size={20} />
                    <div>
                      <b>Kế hoạch thử nghiệm 90 ngày — giả định chiến lược</b>
                      <p>
                        Ngân sách được phân bổ lại khi sửa ngân sách dự án. Tổng
                        phân bổ: {money(p?.budget)}. Chưa dự báo hiệu quả.
                      </p>
                    </div>
                    <button className="btn" onClick={() => openProject(true)}>
                      Sửa ngân sách
                    </button>
                  </div>
                  <div className="plan-grid">
                    {plan.map((x, i) => (
                      <section key={x.period} className="card plan-card">
                        <span className="step-number">0{i + 1}</span>
                        <div className="eyebrow">{x.period}</div>
                        <h2>{x.title}</h2>
                        <strong className="plan-budget">
                          {money(x.budget)}
                          <small>{[30, 40, 30][i]}% tổng ngân sách</small>
                        </strong>
                        {x.tasks.map((t) => (
                          <div className="task" key={t}>
                            <CheckCircle2 size={16} />
                            {t}
                          </div>
                        ))}
                        <dl>
                          <dt>Phụ trách</dt>
                          <dd>{x.owner}</dd>
                          <dt>Đầu ra</dt>
                          <dd>{x.deliverable}</dd>
                          <dt>Ưu tiên</dt>
                          <dd>{x.priority}</dd>
                        </dl>
                      </section>
                    ))}
                  </div>
                  <section className="card">
                    <div className="card-heading">
                      <div>
                        <h2>Nhịp triển khai hàng tuần</h2>
                        <p>
                          Khung quản lý; chưa có tính năng giao việc và thông
                          báo
                        </p>
                      </div>
                    </div>
                    <div className="week-grid">
                      {Array.from({ length: 13 }, (_, i) => (
                        <div key={i}>
                          <b>Tuần {i + 1}</b>
                          <small>
                            {i < 4
                              ? "Nền tảng & baseline"
                              : i < 8
                                ? "Thử nghiệm nội dung"
                                : "Tối ưu & tổng kết"}
                          </small>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
              {active === 8 && (
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>KPI & Performance</h2>
                      <p>
                        Toàn bộ dữ liệu hiện tại · {detail.rows.length} ngày ·
                        không tự điền chỉ số thiếu
                      </p>
                    </div>
                    <Badge tone="gray">Người dùng cung cấp</Badge>
                  </div>
                  {detail.rows.length ? (
                    <>
                      <div className="kpi-grid">
                        {Object.entries(metrics).map(([k, v]) => (
                          <div key={k} className="kpi-tile">
                            <span>{labels[k]}</span>
                            <strong>
                              {["spend", "revenue", "cpl", "pac"].includes(k)
                                ? money(v)
                                : num(v)}
                            </strong>
                            <small>
                              {v === null
                                ? "Chưa đủ dữ liệu"
                                : "Tính từ dữ liệu đã nhập"}
                            </small>
                          </div>
                        ))}
                      </div>
                      <div className="notice">
                        <Info size={20} />
                        <div>
                          <b>Phương pháp và phạm vi</b>
                          <p>
                            Tỷ lệ chỉ dùng những ngày có đủ cả tử số và mẫu số.
                            CPL = chi phí / lead; PAC = chi phí / người bệnh
                            mới; ROAS = doanh thu / chi phí Marketing. Chưa tính
                            ROI vì chưa có đầy đủ chi phí. Lượt tiếp cận cộng
                            theo ngày có thể trùng người. “followers” là số tăng
                            thêm, không phải tổng cuối ngày. Tỷ lệ hoàn tất
                            video chỉ là proxy, không phải retention toàn bộ
                            đường cong.
                          </p>
                        </div>
                      </div>
                      <h3>Phễu chuyển đổi đã đo</h3>
                      <div className="funnel">
                        {[
                          ["Lead đủ điều kiện", metrics.leads],
                          ["Đặt lịch", metrics.bookings],
                          ["Đến khám", metrics.showUps],
                          ["Người bệnh mới", metrics.newPatients],
                        ].map(([l, v], i) => (
                          <div key={l} style={{ width: `${100 - i * 12}%` }}>
                            <span>{l}</span>
                            <b>{num(v as number | null)}</b>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Empty
                      title="Chưa có dữ liệu đo lường"
                      text="Nhập số liệu tổng hợp theo ngày. Dashboard chỉ hiển thị chỉ số có đủ dữ liệu đầu vào."
                      action={
                        <button
                          className="btn"
                          onClick={() => setModal("import")}
                        >
                          <Upload size={16} />
                          Nhập số liệu
                        </button>
                      }
                    />
                  )}
                </section>
              )}
              {active === 9 && (
                <section className="card">
                  <div className="card-heading">
                    <div>
                      <h2>Lịch sử & So sánh phiên bản</h2>
                      <p>
                        Giữ nguyên báo cáo cũ, ghi lại nguồn và thời điểm cập
                        nhật
                      </p>
                    </div>
                    <Badge>{detail.reports.length} phiên bản</Badge>
                  </div>
                  {detail.reports.length ? (
                    detail.reports.map((r) => (
                      <button
                        className="report-row"
                        key={r.id}
                        onClick={() => {
                          setReportId(r.id);
                          go(10);
                        }}
                      >
                        <span className="document-icon">
                          <History size={20} />
                        </span>
                        <span>
                          <b>Phiên bản {r.number} · Phân tích giới hạn</b>
                          <small>
                            {r.start} → {r.end} · {dt(r.createdAt)} ·{" "}
                            {r.rows.length} ngày dữ liệu
                          </small>
                        </span>
                        <Badge tone="amber">Có giới hạn</Badge>
                        <ArrowUpRight size={17} />
                      </button>
                    ))
                  ) : (
                    <Empty
                      title="Chưa có phiên bản"
                      text="Nghiên cứu lần đầu sẽ tạo bản v1, các lần cập nhật tạo bản mới."
                    />
                  )}
                  {detail.reports.length >= 2 && (
                    <>
                      <div className="compare-controls">
                        <label>
                          Phiên bản trước
                          <select
                            value={compareA || detail.reports[1]?.id}
                            onChange={(e) => setCompareA(e.target.value)}
                          >
                            {detail.reports.map((r) => (
                              <option key={r.id} value={r.id}>
                                v{r.number} · {r.start} → {r.end}
                              </option>
                            ))}
                          </select>
                        </label>
                        <ArrowRight size={20} />
                        <label>
                          Phiên bản mới
                          <select
                            value={compareB || detail.reports[0]?.id}
                            onChange={(e) => setCompareB(e.target.value)}
                          >
                            {detail.reports.map((r) => (
                              <option key={r.id} value={r.id}>
                                v{r.number} · {r.start} → {r.end}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <Comparison
                        a={detail.reports.find(
                          (r) => r.id === (compareA || detail.reports[1]?.id),
                        )!}
                        b={detail.reports.find(
                          (r) => r.id === (compareB || detail.reports[0]?.id),
                        )!}
                      />
                    </>
                  )}
                  {detail.jobs.length > 0 && (
                    <>
                      <h3>Nhật ký tác vụ</h3>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Thời điểm</th>
                              <th>Trạng thái</th>
                              <th>Chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.jobs.map((j) => (
                              <tr key={j.id}>
                                <td>{dt(j.created_at)}</td>
                                <td>
                                  <Badge
                                    tone={
                                      j.status === "failed"
                                        ? "amber"
                                        : j.status === "done"
                                          ? "green"
                                          : "blue"
                                    }
                                  >
                                    {
                                      (
                                        {
                                          queued: "Đang chờ",
                                          running: "Đang xử lý",
                                          done: "Đã lưu báo cáo giới hạn",
                                          failed: "Không hoàn tất",
                                        } as Record<string, string>
                                      )[j.status]
                                    }
                                  </Badge>
                                </td>
                                <td>{j.error || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </section>
              )}
              {active === 10 && (
                <section className="card report-print">
                  <div className="card-heading">
                    <div>
                      <h2>Báo cáo Marketing</h2>
                      <p>Executive Summary · Bằng chứng · Hành động</p>
                    </div>
                    {report && (
                      <div className="export-actions">
                        <select
                          aria-label="Phiên bản báo cáo"
                          value={report.id}
                          onChange={(e) => setReportId(e.target.value)}
                        >
                          {detail.reports.map((r) => (
                            <option key={r.id} value={r.id}>
                              Phiên bản {r.number}
                            </option>
                          ))}
                        </select>
                        <a
                          className="btn"
                          href={`/api/projects/${selected}/export?report=${report.id}`}
                        >
                          <FileDown size={16} />
                          Excel
                        </a>
                        <button
                          className="btn primary"
                          onClick={() => window.print()}
                        >
                          <FileDown size={16} />
                          In / Lưu PDF
                        </button>
                      </div>
                    )}
                  </div>
                  {report ? (
                    <>
                      <div className="report-title">
                        <Badge tone="amber">PHÂN TÍCH GIỚI HẠN</Badge>
                        <h2>{report.project.name}</h2>
                        <p>
                          Phiên bản {report.number} · {report.start} →{" "}
                          {report.end} · {dt(report.createdAt)}
                        </p>
                      </div>
                      <div className="notice">
                        <Info size={20} />
                        <div>
                          <b>Executive Summary</b>
                          <p>{report.summary}</p>
                          <p>{report.aiStatus}</p>
                        </div>
                      </div>
                      {report.sections.map((_, i) => (
                        <ResearchSection key={i} report={report} index={i} />
                      ))}
                      {report.aiText && (
                        <div className="ai-output">
                          <h3>Đề xuất AI — giả định cần kiểm duyệt</h3>
                          <p>{report.aiText}</p>
                        </div>
                      )}
                      <SourceTable report={report} />
                      <h3>Chỉ số tại thời điểm lưu</h3>
                      <div className="table-wrap">
                        <table>
                          <tbody>
                            {Object.entries(report.metrics).map(([k, v]) => (
                              <tr key={k}>
                                <td>{labels[k]}</td>
                                <td>{num(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <Empty
                      title="Chưa có báo cáo để xuất"
                      text="Tạo phiên bản nghiên cứu đầu tiên. Báo cáo PDF sử dụng hộp thoại In → Lưu thành PDF của trình duyệt."
                    />
                  )}
                </section>
              )}
              {active === 11 && (
                <>
                  <section className="card">
                    <div className="card-heading">
                      <div>
                        <h2>Kết nối dữ liệu</h2>
                        <p>
                          Trạng thái cấu hình thực tế, không giả lập kết nối
                          thành công
                        </p>
                      </div>
                      <ShieldCheck size={22} />
                    </div>
                    <div className="connections">
                      {connections.map((c, i) => (
                        <div key={c.name} className="connection">
                          <span className="connection-icon">
                            {i === 0 ? (
                              <Upload />
                            ) : i === 1 ? (
                              <Activity />
                            ) : i === 2 ? (
                              <Search />
                            ) : (
                              <Users />
                            )}
                          </span>
                          <div>
                            <h3>{c.name}</h3>
                            <p>{c.detail}</p>
                          </div>
                          <Badge tone={i === 0 ? "green" : "amber"}>
                            {c.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="notice">
                      <ShieldCheck size={20} />
                      <div>
                        <b>Cấu hình bí mật ở phía server</b>
                        <p>
                          OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL và
                          AI_PROVIDER được đọc từ môi trường server. Giao diện
                          không nhận hoặc hiển thị API key. Chỉ gửi số liệu tổng
                          hợp tới AI khi bạn chọn sử dụng AI. Bản MVP có một tài
                          khoản quản trị; chưa hỗ trợ nhiều tài khoản hoặc phân
                          quyền tổ chức.
                        </p>
                      </div>
                    </div>
                  </section>
                  <section className="card">
                    <div className="card-heading">
                      <div>
                        <h2>Lịch sử nhập dữ liệu</h2>
                        <p>
                          Tệp gốc không được lưu; chỉ lưu số liệu đã kiểm tra
                        </p>
                      </div>
                      <a className="text-link" download href="/api/template">
                        Tải CSV mẫu <FileDown size={16} />
                      </a>
                    </div>
                    {detail.imports.length ? (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Tệp</th>
                              <th>Số dòng</th>
                              <th>Thời điểm</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.imports.map((x, i) => (
                              <tr key={i}>
                                <td>{x.name}</td>
                                <td>{x.rowCount}</td>
                                <td>{dt(x.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Empty
                        title="Chưa nhập tệp nào"
                        text="Hỗ trợ CSV/XLSX tối đa 5 MB, 10.000 dòng. PDF và DOCX chưa hỗ trợ trong MVP."
                      />
                    )}
                  </section>
                </>
              )}
            </>
          )}
          <footer className="footer">
            <span>
              <Activity size={14} /> MedIntel · Medical Marketing Intelligence
            </span>
            <span>Phục vụ nghiên cứu Marketing · Không tư vấn điều trị</span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal === "project" && (
        <Modal
          title={editing ? "Cập nhật hồ sơ dự án" : "Tạo dự án mới"}
          onClose={() => !busy && setModal(null)}
        >
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                const saved = await api<Project>(
                  "projects" + (editing ? "/" + selected : ""),
                  {
                    method: editing ? "PATCH" : "POST",
                    body: JSON.stringify(form),
                  },
                );
                await loadList();
                setSelected(saved.id);
                if (editing) await loadDetail();
                setModal(null);
                setToast("Đã lưu hồ sơ dự án.");
              })
            }
          >
            <p className="muted">
              Chỉ nhập thông tin thương hiệu và số liệu tổng hợp. Để trống thông
              tin chưa xác minh.
            </p>
            <div className="form-grid">
              {(
                [
                  ["name", "Tên bác sĩ / thương hiệu"],
                  ["specialty", "Chuyên khoa"],
                  ["location", "Địa điểm khám"],
                  ["facebook", "Fanpage Facebook"],
                  ["website", "Website"],
                  ["tiktok", "TikTok"],
                  ["youtube", "YouTube"],
                  ["services", "Dịch vụ ưu tiên"],
                  ["audience", "Nhóm khách hàng"],
                  ["budget", "Ngân sách cho 90 ngày (₫)"],
                  ["revenueGoal", "Mục tiêu doanh thu (₫)"],
                  ["patientGoal", "Mục tiêu số người bệnh"],
                  ["competitors", "Đối thủ cạnh tranh (tên / URL)"],
                ] as [keyof ProjectInput, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className={
                    ["name", "services", "audience", "competitors"].includes(
                      key,
                    )
                      ? "span-2"
                      : ""
                  }
                >
                  {label}
                  {key === "name" ? " *" : ""}
                  <input
                    type={
                      typeof form[key] === "number"
                        ? "number"
                        : ["facebook", "website", "tiktok", "youtube"].includes(
                              key,
                            )
                          ? "url"
                          : "text"
                    }
                    min={0}
                    step={1}
                    required={key === "name"}
                    maxLength={key === "name" ? 150 : 1000}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]:
                          typeof form[key] === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(null)}
                disabled={busy}
              >
                Hủy
              </button>
              <button className="btn primary" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu dự án"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "import" && (
        <Modal
          title="Nhập dữ liệu Marketing"
          onClose={() => !busy && setModal(null)}
        >
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                if (!file || !confirmed)
                  throw new Error("Chọn tệp và xác nhận dữ liệu tổng hợp.");
                const body = new FormData();
                body.set("file", file);
                const result = await api<{ count: number; message: string }>(
                  `projects/${selected}/import`,
                  { method: "POST", body },
                );
                await loadDetail();
                setModal(null);
                setToast(
                  `Đã nhập ${result.count} dòng. Ngày trùng đã được thay thế.`,
                );
              })
            }
          >
            <p className="muted">
              Mỗi ngày một dòng tổng hợp. Ngày trùng thay thế toàn bộ dòng hiện
              tại; báo cáo cũ được giữ nguyên.
            </p>
            <a className="text-link" download href="/api/template">
              Tải mẫu CSV đúng cấu trúc <FileDown size={16} />
            </a>
            <label className="dropzone">
              <Upload size={29} />
              <b>{file ? file.name : "Chọn tệp CSV hoặc XLSX"}</b>
              <span>
                Tối đa 5 MB · 10.000 dòng · không nhận công thức Excel
              </span>
              <input
                type="file"
                accept=".csv,.xlsx"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <details className="import-help">
              <summary>Cấu trúc cột & quy tắc</summary>
              <p>
                Cột bắt buộc: date (văn bản YYYY-MM-DD). Chỉ số tùy chọn: reach,
                nonFollowerReach, views, engagements, followers (tăng thêm),
                leads, bookings, showUps, newPatients, spend, revenue,
                videoStarts, videoCompletions. Số không âm; để trống nếu chưa
                có. Không dùng dấu phân tách hàng nghìn. Tổng hợp chung mọi kênh
                trước khi nhập.
              </p>
              <p>
                PDF/DOCX, dữ liệu từng bệnh nhân và bảng xuất Meta nguyên bản
                chưa hỗ trợ. Hãy chuyển về mẫu tổng hợp. Tệp XLSX được giải nén
                trên server; chỉ dùng tệp từ nguồn tin cậy trong MVP.
              </p>
            </details>
            <label className="check-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                required
              />
              Tôi xác nhận tệp chỉ chứa số liệu tổng hợp, không có thông tin
              định danh bệnh nhân.
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(null)}
                disabled={busy}
              >
                Hủy
              </button>
              <button
                className="btn primary"
                disabled={busy || !file || !confirmed}
              >
                {busy ? "Đang kiểm tra…" : "Kiểm tra & nhập dữ liệu"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "research" && (
        <Modal
          title="Tạo phiên bản nghiên cứu mới"
          onClose={() => !busy && setModal(null)}
        >
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                await api(`projects/${selected}/research`, {
                  method: "POST",
                  body: JSON.stringify({ start, end, sources, useAI }),
                });
                await loadDetail();
                setModal(null);
                setActive(9);
                setToast(
                  "Đã đưa tác vụ vào hàng đợi. Theo dõi trạng thái trong lịch sử.",
                );
              })
            }
          >
            <p className="muted">
              Lưu ảnh chụp dữ liệu thành phiên bản mới. Khi không có dữ liệu
              hoặc nguồn truy xuất, kết quả được ghi rõ là phân tích giới hạn.
            </p>
            <label>
              Phạm vi
              <select
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  if (e.target.value !== "custom") {
                    setEnd(dateAt());
                    setStart(dateAt(-(Number(e.target.value) - 1)));
                  }
                }}
              >
                <option value="30">30 ngày gần nhất</option>
                <option value="60">60 ngày gần nhất</option>
                <option value="90">90 ngày gần nhất</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </label>
            <div className="form-grid">
              <label>
                Từ ngày
                <input
                  type="date"
                  required
                  value={start}
                  onChange={(e) => {
                    setDays("custom");
                    setStart(e.target.value);
                  }}
                />
              </label>
              <label>
                Đến ngày
                <input
                  type="date"
                  min={start}
                  required
                  value={end}
                  onChange={(e) => {
                    setDays("custom");
                    setEnd(e.target.value);
                  }}
                />
              </label>
            </div>
            <h3>Nguồn dữ liệu</h3>
            {[
              [
                "uploaded",
                "Dữ liệu tổng hợp đã nhập",
                "Sẵn sàng; người dùng cung cấp",
              ],
              [
                "web",
                "Website / Web research",
                "Chưa cấu hình — ghi nhật ký không thể truy xuất",
              ],
              [
                "meta",
                "Facebook / Meta",
                "Chưa triển khai — không truy cập fanpage",
              ],
            ].map(([key, name, hint]) => (
              <label className="source-option" key={key}>
                <input
                  type="checkbox"
                  checked={sources.includes(key)}
                  onChange={(e) =>
                    setSources(
                      e.target.checked
                        ? [...sources, key]
                        : sources.filter((x) => x !== key),
                    )
                  }
                />
                <span>
                  <b>{name}</b>
                  <small>{hint}</small>
                </span>
              </label>
            ))}
            <label className="check-label">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              Sử dụng AI đã cấu hình trên server (có thể phát sinh phí nhà cung
              cấp). Chỉ gửi số liệu tổng hợp (không gửi tên, hồ sơ hoặc văn bản
              tự do).
            </label>
            <div className="notice">
              <Info size={18} />
              <p>
                Không có nguồn web đã xác minh. Sáu bước có thể chỉ là phân tích
                dữ liệu và khung đề xuất cần kiểm chứng. Tác vụ cần worker đang
                chạy; không ghi đè báo cáo cũ.
              </p>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setModal(null)}
                disabled={busy}
              >
                Hủy
              </button>
              <button
                className="btn primary"
                disabled={busy || !sources.length || pending}
              >
                {busy ? "Đang tạo tác vụ…" : "Bắt đầu phân tích"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "content" && (
        <Modal
          title="Thêm nội dung & hiệu quả"
          onClose={() => !busy && setModal(null)}
        >
          <form
            onSubmit={(e) =>
              submit(e, async () => {
                await api(`projects/${selected}/content`, {
                  method: "POST",
                  body: JSON.stringify({
                    ...contentForm,
                    ...Object.fromEntries(
                      ["views", "leads", "bookings"].map((k) => [
                        k,
                        contentForm[k as "views"] === ""
                          ? null
                          : Number(contentForm[k as "views"]),
                      ]),
                    ),
                  }),
                });
                await loadDetail();
                setModal(null);
                setContentForm({
                  ...contentForm,
                  title: "",
                  url: "",
                  views: "",
                  leads: "",
                  bookings: "",
                });
                setToast("Đã lưu nội dung.");
              })
            }
          >
            <p className="muted">
              Không nhập nội dung chứa thông tin bệnh nhân. Các chỉ số là số
              tổng hợp do bạn cung cấp.
            </p>
            {[
              ["title", "Tiêu đề nội dung"],
              ["url", "URL công khai"],
              ["pillar", "Content Pillar"],
              ["views", "Lượt xem"],
              ["leads", "Lead đủ điều kiện"],
              ["bookings", "Lịch hẹn"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required={key === "title"}
                  type={
                    ["views", "leads", "bookings"].includes(key)
                      ? "number"
                      : key === "url"
                        ? "url"
                        : "text"
                  }
                  min={0}
                  value={contentForm[key as keyof typeof contentForm]}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label>
              Funnel Stage
              <select
                value={contentForm.stage}
                onChange={(e) =>
                  setContentForm({ ...contentForm, stage: e.target.value })
                }
              >
                {[
                  "Awareness",
                  "Interest",
                  "Trust",
                  "Consultation",
                  "Booking",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button className="btn primary" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu nội dung"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
function ResearchSection({
  report,
  index,
}: {
  report: Research;
  index: number;
}) {
  const s = report.sections[index];
  return (
    <section className="research-section">
      <div className="section-heading">
        <span className="step-number">0{index + 1}</span>
        <h3>{s.title}</h3>
      </div>
      <Badge tone="gray">{s.confidence}</Badge>
      <div className="research-columns">
        <div>
          <h4>Phát hiện & Giới hạn</h4>
          {s.findings.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
        <div>
          <h4>Hành động đề xuất · Cần kiểm chứng</h4>
          {s.actions.map((x) => (
            <p key={x}>
              <ArrowRight size={14} />
              {x}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
function SourceTable({ report }: { report: Research }) {
  return (
    <section className="sources-table">
      <h3>Bằng chứng & Nhật ký nguồn</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nguồn</th>
              <th>Trạng thái</th>
              <th>Độ mới / thời điểm</th>
              <th>Giới hạn & Thay thế</th>
            </tr>
          </thead>
          <tbody>
            {report.sourceLogs.map((s, i) => (
              <tr key={i}>
                <td>
                  <b>{s.name}</b>
                  {s.url && (
                    <a target="_blank" rel="noreferrer" href={s.url}>
                      {s.url}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </td>
                <td>
                  <Badge tone={s.status === "unavailable" ? "amber" : "blue"}>
                    {s.status === "unavailable"
                      ? "Không thể truy xuất"
                      : s.status === "editorial_snapshot"
                        ? "Nguồn công khai — bản lưu"
                        : "Người dùng cung cấp"}
                  </Badge>
                </td>
                <td>
                  {
                    (
                      {
                        new: "Dữ liệu mới/khác trong phiên bản",
                        unchanged: "Dữ liệu giữ nguyên",
                        unavailable: "Không có dữ liệu",
                      } as Record<string, string>
                    )[s.freshness]
                  }
                  <small>
                    {s.collectedAt ? dt(s.collectedAt) : "Chưa thu thập"}
                  </small>
                </td>
                <td>{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Comparison({ a, b }: { a: Research; b: Research }) {
  const changes = compare(a.metrics, b.metrics);
  return (
    <>
      <div className="notice">
        <Info size={20} />
        <div>
          <b>
            {a.start !== b.start || a.end !== b.end
              ? "Phạm vi khác nhau — chênh lệch không so sánh trực tiếp được"
              : "Cùng phạm vi — mô tả chênh lệch dữ liệu đã nhập"}
          </b>
          <p>
            {a.id === b.id ? "Bạn đang chọn cùng một phiên bản. " : ""}Không suy
            luận thay đổi thị trường hoặc quan hệ nhân quả. Hồ sơ dự án:{" "}
            {JSON.stringify(a.project) === JSON.stringify(b.project)
              ? "giữ nguyên"
              : "đã thay đổi"}
            . Số ngày: {a.rows.length} → {b.rows.length}.
          </p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>v{a.number}</th>
              <th>v{b.number}</th>
              <th>Chênh lệch</th>
              <th>Thay đổi %</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((x) => (
              <tr key={x.key}>
                <td>{labels[x.key]}</td>
                <td>{num(x.before)}</td>
                <td>{num(x.after)}</td>
                <td>
                  {x.delta === null
                    ? "Không đủ dữ liệu"
                    : (x.delta > 0 ? "+" : "") + num(x.delta)}
                </td>
                <td>{x.percent === null ? "—" : num(x.percent) + "%"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceTable report={b} />
    </>
  );
}
