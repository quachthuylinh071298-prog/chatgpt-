import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Project, ProjectInput, Observation, Research } from "./domain";
import type { ResearchWorkspace } from "./workspace";
import type { StrategyTable } from "./strategy-tables";
const path = resolve(process.env.DATABASE_PATH || "./data/medical.sqlite");
mkdirSync(dirname(path), { recursive: true });
export const db = new DatabaseSync(path);
db.exec(
  "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
);
db.exec(`CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS observations(project_id TEXT NOT NULL REFERENCES projects(id),date TEXT NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL,source TEXT NOT NULL,PRIMARY KEY(project_id,date));
CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),number INTEGER NOT NULL,payload TEXT NOT NULL,UNIQUE(project_id,number));
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),status TEXT NOT NULL,request TEXT NOT NULL,error TEXT,report_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_job ON jobs(project_id) WHERE status IN ('queued','running');
CREATE TABLE IF NOT EXISTS imports(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),name TEXT NOT NULL,row_count INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS research_workspaces(project_id TEXT PRIMARY KEY REFERENCES projects(id),revision INTEGER NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,project_id TEXT,action TEXT NOT NULL,created_at TEXT NOT NULL);`);
const parse = <T>(row: unknown): T | null =>
  row ? JSON.parse((row as { payload: string }).payload) : null;
export function listProjects(): Project[] {
  return db
    .prepare("SELECT payload FROM projects ORDER BY rowid")
    .all()
    .map((r) => parse<Project>(r)!);
}
export function getProject(id: string) {
  return parse<Project>(
    db.prepare("SELECT payload FROM projects WHERE id=?").get(id),
  );
}
export function saveProject(input: ProjectInput, id?: string) {
  const old = id ? getProject(id) : null;
  if (id && !old) throw new Error("Không tìm thấy dự án");
  const p: Project = {
    ...input,
    id: id || randomUUID(),
    createdAt: old?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO projects(id,payload) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
  ).run(p.id, JSON.stringify(p));
  audit(p.id, old ? "project.updated" : "project.created");
  return p;
}
export function audit(project: string, action: string) {
  db.prepare("INSERT INTO audit VALUES(?,?,?,?)").run(
    randomUUID(),
    project,
    action,
    new Date().toISOString(),
  );
}
export function seed() {
  if (!listProjects().length)
    saveProject({
      name: "BS.TTƯT. Hữu Thị Chung",
      facebook: "https://www.facebook.com/BS.TTUT.huuchung",
      specialty: "",
      location: "",
      website: "",
      tiktok: "",
      youtube: "",
      services: "",
      audience: "",
      budget: 0,
      revenueGoal: 0,
      patientGoal: 0,
      competitors: "",
    });
}
export function observations(
  id: string,
  start?: string,
  end?: string,
): Observation[] {
  return db
    .prepare(
      "SELECT payload FROM observations WHERE project_id=? AND date>=? AND date<=? ORDER BY date",
    )
    .all(id, start || "0000", end || "9999")
    .map((r) => parse<Observation>(r)!);
}
export function importRows(id: string, rows: Observation[], name: string) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO observations VALUES(?,?,?,?,?) ON CONFLICT(project_id,date) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at,source=excluded.source",
    );
    for (const row of rows)
      stmt.run(id, row.date, JSON.stringify(row), now, name);
    db.prepare("INSERT INTO imports VALUES(?,?,?,?,?)").run(
      randomUUID(),
      id,
      name,
      rows.length,
      now,
    );
    audit(id, "data.imported");
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function imports(id: string) {
  return db
    .prepare(
      "SELECT name,row_count AS rowCount,created_at AS createdAt FROM imports WHERE project_id=? ORDER BY created_at DESC",
    )
    .all(id);
}
export function reports(id: string): Research[] {
  return db
    .prepare(
      "SELECT payload FROM reports WHERE project_id=? ORDER BY number DESC",
    )
    .all(id)
    .map((r) => parse<Research>(r)!);
}
export function report(id: string) {
  return parse<Research>(
    db.prepare("SELECT payload FROM reports WHERE id=?").get(id),
  );
}
export function storeReport(r: Research) {
  db.prepare("INSERT INTO reports VALUES(?,?,?,?)").run(
    r.id,
    r.projectId,
    r.number,
    JSON.stringify(r),
  );
  audit(r.projectId, "report.created");
}
export type Job = {
  id: string;
  project_id: string;
  status: string;
  request: string;
  error: string | null;
  report_id: string | null;
  created_at: string;
  updated_at: string;
};
export function jobs(id: string) {
  return db
    .prepare(
      "SELECT * FROM jobs WHERE project_id=? ORDER BY created_at DESC LIMIT 10",
    )
    .all(id) as Job[];
}
export function enqueue(projectId: string, request: unknown) {
  const active = db
    .prepare(
      "SELECT * FROM jobs WHERE project_id=? AND status IN ('queued','running')",
    )
    .get(projectId);
  if (active) return active as Job;
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare("INSERT INTO jobs VALUES(?,?,?, ?,NULL,NULL,?,?)").run(
    id,
    projectId,
    "queued",
    JSON.stringify(request),
    now,
    now,
  );
  return db.prepare("SELECT * FROM jobs WHERE id=?").get(id) as Job;
}
export function content(id: string) {
  return db
    .prepare(
      "SELECT id,payload FROM content WHERE project_id=? ORDER BY rowid DESC",
    )
    .all(id)
    .map((r) => ({ id: r.id, ...parse<Record<string, unknown>>(r) }));
}

export function getResearchWorkspace(
  projectId: string,
): ResearchWorkspace | null {
  const row = db
    .prepare(
      "SELECT revision,payload,updated_at FROM research_workspaces WHERE project_id=?",
    )
    .get(projectId) as
    { revision: number; payload: string; updated_at: string } | undefined;
  return row
    ? {
        tables: JSON.parse(row.payload),
        revision: row.revision,
        updatedAt: row.updated_at,
      }
    : null;
}
export function saveResearchWorkspace(
  projectId: string,
  tables: StrategyTable[],
  expectedRevision: number,
): ResearchWorkspace {
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = getResearchWorkspace(projectId);
    if ((current?.revision || 0) !== expectedRevision)
      throw new Error(
        "Dữ liệu đã được lưu từ cửa sổ khác. Tải lại dự án trước khi lưu để tránh ghi đè.",
      );
    const revision = expectedRevision + 1,
      updatedAt = new Date().toISOString();
    db.prepare(
      "INSERT INTO research_workspaces VALUES(?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload,updated_at=excluded.updated_at",
    ).run(projectId, revision, JSON.stringify(tables), updatedAt);
    audit(projectId, "research-workspace.saved");
    db.exec("COMMIT");
    return { tables, revision, updatedAt };
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
