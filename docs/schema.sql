-- Schema hiện tại được khởi tạo bởi lib/db.ts. Không chứa seed data.
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS observations(project_id TEXT NOT NULL REFERENCES projects(id),date TEXT NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL,source TEXT NOT NULL,PRIMARY KEY(project_id,date));
CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),number INTEGER NOT NULL,payload TEXT NOT NULL,UNIQUE(project_id,number));
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),status TEXT NOT NULL,request TEXT NOT NULL,error TEXT,report_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_job ON jobs(project_id) WHERE status IN ('queued','running');
CREATE TABLE IF NOT EXISTS imports(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),name TEXT NOT NULL,row_count INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS research_workspaces(project_id TEXT PRIMARY KEY REFERENCES projects(id),revision INTEGER NOT NULL,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,project_id TEXT,action TEXT NOT NULL,created_at TEXT NOT NULL);
