import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { db, nextStudentCode, computeReport } from "./db.js";

const app = new Hono();
const serverDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(serverDir, "..", "..", "web", "dist");

const TRACKS = ["T1", "T2", "T3", "T4", "T5"];
const GROUPS = ["A", "B"];
const STAGES = ["new", "contacted", "qualified", "enrolled", "graduated", "lost"];

const STUDENT_FIELDS = [
  "full_name", "phone", "email", "city_quartier", "group_name", "track",
  "cycle_number", "stage", "fees_expected", "fees_paid", "attendance_rate",
  "portfolio_url", "parent_name", "parent_phone", "consent_marketing", "notes",
];

const getStudent = (id) =>
  db.prepare("SELECT * FROM students WHERE id = ?").get(Number(id));

const getGrades = (id) =>
  db.prepare("SELECT weekly, midterm, capstone, continuous, updated_at FROM grades WHERE student_id = ?").get(Number(id));

const getAchievements = (id) =>
  db.prepare("SELECT * FROM achievements WHERE student_id = ? ORDER BY issued_at DESC, id DESC").all(Number(id));

app.onError((err, c) => c.json({ error: err.message || "Erreur serveur" }, 500));

app.get("/api/stats", (c) => {
  const students = db.prepare("SELECT * FROM students ORDER BY id DESC").all();
  const total = students.length;
  const by_track = Object.fromEntries(TRACKS.map((t) => [t, 0]));
  const by_group = { A: 0, B: 0 };
  const by_stage = {};
  let fees_expected = 0;
  let fees_paid = 0;
  let eligible_certificates = 0;
  for (const s of students) {
    by_track[s.track] = (by_track[s.track] || 0) + 1;
    by_group[s.group_name] = (by_group[s.group_name] || 0) + 1;
    by_stage[s.stage] = (by_stage[s.stage] || 0) + 1;
    fees_expected += s.fees_expected;
    fees_paid += s.fees_paid;
    if (computeReport(s, getGrades(s.id)).eligible) eligible_certificates += 1;
  }
  const achievements_count = db.prepare("SELECT COUNT(*) AS n FROM achievements").get().n;
  const recent = db
    .prepare("SELECT id, student_code, full_name, track, group_name, stage, created_at FROM students ORDER BY id DESC LIMIT 8")
    .all();
  return c.json({
    total, by_track, by_group, by_stage,
    fees_expected, fees_paid, balance: fees_expected - fees_paid,
    eligible_certificates, achievements_count, recent,
  });
});

app.get("/api/students", (c) => {
  const q = (c.req.query("q") || "").trim();
  const track = c.req.query("track");
  const group = c.req.query("group");
  const stage = c.req.query("stage");
  const where = [];
  const params = [];
  if (q) {
    where.push("(full_name LIKE ? OR student_code LIKE ? OR phone LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (track && TRACKS.includes(track)) { where.push("track = ?"); params.push(track); }
  if (group && GROUPS.includes(group)) { where.push("group_name = ?"); params.push(group); }
  if (stage && STAGES.includes(stage)) { where.push("stage = ?"); params.push(stage); }
  const sql =
    "SELECT * FROM students" +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY id DESC";
  return c.json(db.prepare(sql).all(...params));
});

app.post("/api/students", async (c) => {
  const b = await c.req.json().catch(() => ({}));
  if (!b.full_name?.trim()) return c.json({ error: "Le nom complet est requis." }, 400);
  if (!b.phone?.trim()) return c.json({ error: "Le téléphone est requis." }, 400);
  if (!GROUPS.includes(b.group_name)) return c.json({ error: "Groupe invalide (A ou B)." }, 400);
  if (!TRACKS.includes(b.track)) return c.json({ error: "Piste invalide (T1–T5)." }, 400);
  if (b.stage && !STAGES.includes(b.stage)) return c.json({ error: "Statut invalide." }, 400);

  const { code, seq } = nextStudentCode(b.group_name);
  const cycle = Math.max(1, Number(b.cycle_number) || 1);
  const result = db
    .prepare(
      `INSERT INTO students
        (student_code, seq, full_name, phone, email, city_quartier, group_name, track,
         cycle_number, stage, fees_expected, fees_paid, attendance_rate, portfolio_url,
         parent_name, parent_phone, consent_marketing, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      code, seq,
      b.full_name.trim(), b.phone.trim(), b.email || null, b.city_quartier || null,
      b.group_name, b.track, cycle, b.stage || "enrolled",
      Number(b.fees_expected) || 50000, Number(b.fees_paid) || 0,
      Number(b.attendance_rate) || 0, b.portfolio_url || null,
      b.parent_name || null, b.parent_phone || null,
      b.consent_marketing ? 1 : 0, b.notes || null
    );
  return c.json(getStudent(Number(result.lastInsertRowid)), 201);
});

app.get("/api/students/:id", (c) => {
  const student = getStudent(c.req.param("id"));
  if (!student) return c.json({ error: "Étudiant introuvable." }, 404);
  const grades = getGrades(student.id) || null;
  return c.json({
    ...student,
    grades,
    achievements: getAchievements(student.id),
    report: computeReport(student, grades),
  });
});

app.put("/api/students/:id", async (c) => {
  const student = getStudent(c.req.param("id"));
  if (!student) return c.json({ error: "Étudiant introuvable." }, 404);
  const b = await c.req.json().catch(() => ({}));
  if (b.track && !TRACKS.includes(b.track)) return c.json({ error: "Piste invalide." }, 400);
  if (b.group_name && !GROUPS.includes(b.group_name)) return c.json({ error: "Groupe invalide." }, 400);
  if (b.stage && !STAGES.includes(b.stage)) return c.json({ error: "Statut invalide." }, 400);

  const sets = [];
  const params = [];
  for (const f of STUDENT_FIELDS) {
    if (!(f in b)) continue;
    sets.push(`${f} = ?`);
    let v = b[f];
    if (["cycle_number", "fees_expected", "fees_paid"].includes(f)) v = Number(v) || 0;
    if (f === "attendance_rate") v = Math.min(100, Math.max(0, Number(v) || 0));
    if (f === "consent_marketing") v = v ? 1 : 0;
    if (typeof v === "string") v = v.trim() || null;
    params.push(v);
  }
  if (!sets.length) return c.json({ error: "Aucune donnée à mettre à jour." }, 400);
  sets.push("updated_at = datetime('now')");
  params.push(student.id);
  db.prepare(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  return c.json(getStudent(student.id));
});

app.delete("/api/students/:id", (c) => {
  const student = getStudent(c.req.param("id"));
  if (!student) return c.json({ error: "Étudiant introuvable." }, 404);
  db.prepare("DELETE FROM students WHERE id = ?").run(student.id);
  return c.json({ ok: true, deleted: student.student_code });
});

app.put("/api/students/:id/grades", async (c) => {
  const student = getStudent(c.req.param("id"));
  if (!student) return c.json({ error: "Étudiant introuvable." }, 404);
  const b = await c.req.json().catch(() => ({}));
  const clamp = (v) =>
    v === null || v === undefined || v === "" ? null : Math.min(100, Math.max(0, Number(v) || 0));
  db.prepare(
    `INSERT INTO grades (student_id, weekly, midterm, capstone, continuous, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(student_id) DO UPDATE SET
       weekly = excluded.weekly, midterm = excluded.midterm,
       capstone = excluded.capstone, continuous = excluded.continuous,
       updated_at = datetime('now')`
  ).run(student.id, clamp(b.weekly), clamp(b.midterm), clamp(b.capstone), clamp(b.continuous));
  if ("attendance_rate" in b) {
    db.prepare(
      "UPDATE students SET attendance_rate = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(Math.min(100, Math.max(0, Number(b.attendance_rate) || 0)), student.id);
  }
  const updated = getStudent(student.id);
  const grades = getGrades(student.id);
  return c.json({ ...updated, grades, report: computeReport(updated, grades) });
});

app.post("/api/students/:id/achievements", async (c) => {
  const student = getStudent(c.req.param("id"));
  if (!student) return c.json({ error: "Étudiant introuvable." }, 404);
  const b = await c.req.json().catch(() => ({}));
  if (!b.title?.trim()) return c.json({ error: "Le titre est requis." }, 400);
  const type = ["badge", "certificate", "award"].includes(b.type) ? b.type : "badge";
  if (type === "certificate") {
    const report = computeReport(student, getGrades(student.id));
    if (!report.eligible)
      return c.json(
        { error: "Certificat refusé : participation ≥ 80 % et note ≥ 60 requis." },
        400
      );
  }
  const result = db
    .prepare("INSERT INTO achievements (student_id, type, title, description) VALUES (?, ?, ?, ?)")
    .run(student.id, type, b.title.trim(), b.description || null);
  return c.json(
    db.prepare("SELECT * FROM achievements WHERE id = ?").get(Number(result.lastInsertRowid)),
    201
  );
});

app.delete("/api/achievements/:id", (c) => {
  const row = db.prepare("SELECT * FROM achievements WHERE id = ?").get(Number(c.req.param("id")));
  if (!row) return c.json({ error: "Réalisation introuvable." }, 404);
  db.prepare("DELETE FROM achievements WHERE id = ?").run(row.id);
  return c.json({ ok: true });
});

app.get("/api/export", (c) => {
  const payload = {
    exported_at: new Date().toISOString(),
    students: db.prepare("SELECT * FROM students ORDER BY id").all(),
    grades: db.prepare("SELECT * FROM grades").all(),
    achievements: db.prepare("SELECT * FROM achievements ORDER BY id").all(),
  };
  c.header("Content-Disposition", 'attachment; filename="aprdr-export.json"');
  return c.json(payload);
});

app.use("/*", serveStatic({ root: relative(process.cwd(), distDir) || "." }));

app.get("*", async (c) => {
  if (c.req.path.startsWith("/api")) return c.notFound();
  try {
    return c.html(await readFile(join(distDir, "index.html"), "utf8"));
  } catch {
    return c.text("Build du front introuvable — lance: pnpm build", 404);
  }
});

const port = Number(process.env.PORT) || 8787;
serve({ fetch: app.fetch, port }, () => {
  console.log(`APRDR server → http://localhost:${port}`);
});
