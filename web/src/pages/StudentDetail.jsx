import { useCallback, useEffect, useState } from "react";
import { api, go } from "../lib/api.js";
import {
  BANDS, GRADE_FIELDS, ACHIEVEMENT_PRESETS,
  trackLabel, stageLabel, fcfa,
} from "../lib/constants.js";
import StudentForm from "../components/StudentForm.jsx";
import IdCard from "../components/IdCard.jsx";
import ReportCard from "../components/ReportCard.jsx";
import Certificate from "../components/Certificate.jsx";

function Section({ title, children, action }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function StudentDetail({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [grades, setGrades] = useState(null);
  const [newAch, setNewAch] = useState({ preset: 0, custom: "", description: "" });
  const [printTarget, setPrintTarget] = useState(null); // 'id' | 'report' | {certificate}
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api(`/api/students/${id}`)
      .then((d) => {
        setData(d);
        setGrades({
          weekly: d.grades?.weekly ?? "",
          midterm: d.grades?.midterm ?? "",
          capstone: d.grades?.capstone ?? "",
          continuous: d.grades?.continuous ?? "",
          attendance_rate: d.attendance_rate,
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    setData(null);
    setError("");
    load();
  }, [load]);

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <p className="text-slate-500">Chargement…</p>;

  const { report, achievements } = data;
  const band = report.band ? BANDS[report.band] : null;
  const paidPct = data.fees_expected
    ? Math.min(100, Math.round((data.fees_paid / data.fees_expected) * 100))
    : 0;

  async function saveGrades() {
    setBusy(true);
    try {
      const updated = await api(`/api/students/${data.id}/grades`, {
        method: "PUT",
        body: grades,
      });
      setData((prev) => ({ ...prev, ...updated }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addAchievement(e) {
    e.preventDefault();
    const preset = ACHIEVEMENT_PRESETS[Number(newAch.preset)];
    const title = preset.title === "Personnalisé…" ? newAch.custom.trim() : preset.title;
    if (!title) return setError("Titre requis pour la réalisation.");
    setBusy(true);
    try {
      await api(`/api/students/${data.id}/achievements`, {
        method: "POST",
        body: { type: preset.type, title, description: newAch.description },
      });
      setNewAch({ preset: 0, custom: "", description: "" });
      setError("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeAchievement(achId) {
    if (!confirm("Supprimer cette réalisation ?")) return;
    await api(`/api/achievements/${achId}`, { method: "DELETE" });
    load();
  }

  async function removeStudent() {
    if (!confirm(`Supprimer définitivement ${data.full_name} (${data.student_code}) ?`)) return;
    await api(`/api/students/${data.id}`, { method: "DELETE" });
    go("/students");
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center gap-3">
        <button onClick={() => go("/students")} className="text-sm text-slate-500 hover:text-slate-800">
          ← Retour
        </button>
        <span className="rounded bg-slate-900 px-2 py-1 font-mono text-sm text-sky-400">
          {data.student_code}
        </span>
        <h1 className="text-xl font-bold">{data.full_name}</h1>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
          {stageLabel(data.stage)}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            {editing ? "Fermer l'édition" : "Modifier"}
          </button>
          <button
            onClick={removeStudent}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100"
          >
            Supprimer
          </button>
        </div>
      </div>

      {editing ? (
        <StudentForm
          initial={data}
          onSubmit={async (values) => {
            await api(`/api/students/${data.id}`, { method: "PUT", body: values });
            setEditing(false);
            load();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Identité">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><dt className="text-slate-400">Téléphone</dt><dd>{data.phone}</dd></div>
              <div><dt className="text-slate-400">E-mail</dt><dd>{data.email || "—"}</dd></div>
              <div><dt className="text-slate-400">Ville / quartier</dt><dd>{data.city_quartier || "—"}</dd></div>
              <div><dt className="text-slate-400">Groupe</dt><dd>{data.group_name}</dd></div>
              <div><dt className="text-slate-400">Piste</dt><dd>{data.track} · {trackLabel(data.track)}</dd></div>
              <div><dt className="text-slate-400">Cycle</dt><dd>N° {data.cycle_number}</dd></div>
              <div><dt className="text-slate-400">Parent / tuteur</dt><dd>{data.parent_name || "—"}</dd></div>
              <div><dt className="text-slate-400">Tél. parent</dt><dd>{data.parent_phone || "—"}</dd></div>
              <div><dt className="text-slate-400">Portfolio</dt>
                <dd>{data.portfolio_url ? <a className="text-sky-600 hover:underline" href={data.portfolio_url} target="_blank" rel="noreferrer">ouvrir</a> : "—"}</dd>
              </div>
              <div><dt className="text-slate-400">Consentement</dt><dd>{data.consent_marketing ? "Oui" : "Non"}</dd></div>
              {data.notes && <div className="col-span-2"><dt className="text-slate-400">Notes</dt><dd>{data.notes}</dd></div>}
            </dl>
          </Section>

          <Section title="Frais de scolarité">
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Payé</span>
                <span className="font-semibold text-emerald-700">{fcfa(data.fees_paid)}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-slate-500">
                <span>Attendu : {fcfa(data.fees_expected)}</span>
                <span>Reste : <b className="text-amber-600">{fcfa(data.fees_expected - data.fees_paid)}</b></span>
              </div>
            </div>
          </Section>

          <Section
            title="Bulletin & participation"
            action={
              <button
                onClick={() => setPrintTarget("report")}
                className="no-print rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
              >
                Imprimer le bulletin
              </button>
            }
          >
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {band ? (
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${band.cls}`}>
                    {band.label} · {report.score}/100
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                    Aucune note saisie
                  </span>
                )}
                <span className={`rounded-full px-2 py-1 text-xs ${report.attendance_ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>
                  Participation {data.attendance_rate}% (min. 80%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GRADE_FIELDS.map((f) => (
                  <label key={f.id} className="block">
                    <span className="text-xs text-slate-500">{f.label} — poids {f.weight}%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grades?.[f.id] ?? ""}
                      onChange={(e) => setGrades((g) => ({ ...g, [f.id]: e.target.value }))}
                      className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 focus:border-sky-500 focus:outline-none"
                      placeholder="0–100"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-xs text-slate-500">Participation / assiduité %</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grades?.attendance_rate ?? ""}
                    onChange={(e) => setGrades((g) => ({ ...g, attendance_rate: e.target.value }))}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 focus:border-sky-500 focus:outline-none"
                  />
                </label>
              </div>

              <button
                onClick={saveGrades}
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Enregistrer le bulletin
              </button>
            </div>
          </Section>

          <Section title="Carte d'étudiant">
            <IdCard student={data} />
            <button
              onClick={() => setPrintTarget("id")}
              className="no-print mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Imprimer la carte
            </button>
          </Section>

          <Section title={`Réalisations (${achievements.length})`}>
            <div className="space-y-3">
              <div className={`rounded-lg border px-3 py-2 text-sm ${report.eligible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                {report.eligible
                  ? "✓ Éligible au certificat (participation ≥ 80 % et note ≥ 60)."
                  : `Certificat verrouillé — ${!report.attendance_ok ? "participation < 80 %" : "note < 60 ou notes manquantes"}.`}
              </div>

              <form onSubmit={addAchievement} className="no-print flex flex-wrap gap-2">
                <select
                  value={newAch.preset}
                  onChange={(e) => setNewAch((v) => ({ ...v, preset: e.target.value }))}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                >
                  {ACHIEVEMENT_PRESETS.map((p, i) => (
                    <option key={i} value={i}>{`${p.type === "certificate" ? "📜" : p.type === "award" ? "🏆" : "🏅"} ${p.title}`}</option>
                  ))}
                  <option value={ACHIEVEMENT_PRESETS.length}>✏️ Personnalisé…</option>
                </select>
                {Number(newAch.preset) === ACHIEVEMENT_PRESETS.length && (
                  <input
                    value={newAch.custom}
                    onChange={(e) => setNewAch((v) => ({ ...v, custom: e.target.value }))}
                    placeholder="Titre personnalisé"
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                )}
                <button
                  disabled={busy}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
                >
                  Délivrer
                </button>
              </form>

              <ul className="divide-y divide-slate-100">
                {achievements.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 py-2 text-sm">
                    <span>{a.type === "certificate" ? "📜" : a.type === "award" ? "🏆" : "🏅"}</span>
                    <div className="flex-1">
                      <div className="font-medium">{a.title}</div>
                      {a.description && <div className="text-xs text-slate-500">{a.description}</div>}
                      <div className="text-xs text-slate-400">{a.issued_at}</div>
                    </div>
                    {a.type === "certificate" && (
                      <button
                        onClick={() => setPrintTarget({ certificate: a })}
                        className="no-print rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        Imprimer
                      </button>
                    )}
                    <button
                      onClick={() => removeAchievement(a.id)}
                      className="no-print text-xs text-rose-500 hover:underline"
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {!achievements.length && (
                  <li className="py-3 text-sm text-slate-400">Aucune réalisation pour l'instant.</li>
                )}
              </ul>
            </div>
          </Section>
        </div>
      )}

      {printTarget && (
        <div className="fixed inset-0 z-20 flex items-start justify-center overflow-auto bg-slate-900/60 p-6">
          <div className="w-full max-w-2xl space-y-4">
            <div className="no-print flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
              >
                Imprimer / PDF
              </button>
              <button
                onClick={() => setPrintTarget(null)}
                className="rounded-lg bg-white px-4 py-2 text-sm hover:bg-slate-100"
              >
                Fermer
              </button>
            </div>
            {printTarget === "id" && <IdCard student={data} print />}
            {printTarget === "report" && <ReportCard student={data} report={report} grades={grades} />}
            {printTarget?.certificate && (
              <Certificate student={data} achievement={printTarget.certificate} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
