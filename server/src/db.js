import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, "aprdr.db"));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_code TEXT UNIQUE NOT NULL,
  seq INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city_quartier TEXT,
  group_name TEXT NOT NULL CHECK (group_name IN ('A','B')),
  track TEXT NOT NULL CHECK (track IN ('T1','T2','T3','T4','T5')),
  cycle_number INTEGER NOT NULL DEFAULT 1,
  stage TEXT NOT NULL DEFAULT 'enrolled',
  fees_expected INTEGER NOT NULL DEFAULT 50000,
  fees_paid INTEGER NOT NULL DEFAULT 0,
  attendance_rate REAL NOT NULL DEFAULT 0,
  portfolio_url TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  consent_marketing INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS grades (
  student_id INTEGER PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  weekly REAL,
  midterm REAL,
  capstone REAL,
  continuous REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'badge',
  title TEXT NOT NULL,
  description TEXT,
  issued_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sequences (
  key TEXT PRIMARY KEY,
  next_seq INTEGER NOT NULL DEFAULT 1
);
`);

export function nextStudentCode(group) {
  const yy = String(new Date().getFullYear()).slice(2);
  const key = `${yy}-${group}`;
  const row = db.prepare("SELECT next_seq FROM sequences WHERE key = ?").get(key);
  const seq = row ? row.next_seq : 1;
  db.prepare(
    "INSERT INTO sequences (key, next_seq) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET next_seq = excluded.next_seq"
  ).run(key, seq + 1);
  return { code: `MLT-${yy}-${group}-${String(seq).padStart(4, "0")}`, seq };
}

export function computeReport(student, grades) {
  const g = grades || {};
  const num = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
  const hasAny = [g.weekly, g.midterm, g.capstone, g.continuous].some(
    (v) => typeof v === "number"
  );
  const score = hasAny
    ? num(g.weekly) * 0.3 + num(g.midterm) * 0.2 + num(g.capstone) * 0.4 + num(g.continuous) * 0.1
    : null;
  let band = null;
  if (score != null) {
    band =
      score >= 90 ? "haute_distinction" : score >= 80 ? "distinction" : score >= 60 ? "pass" : "insuffisant";
  }
  const attendance_ok = student.attendance_rate >= 80;
  return {
    score: score == null ? null : Math.round(score * 100) / 100,
    band,
    attendance_ok,
    eligible: score != null && score >= 60 && attendance_ok,
  };
}
