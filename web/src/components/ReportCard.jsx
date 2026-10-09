import { BANDS, GRADE_FIELDS, trackLabel, fmtDate } from "../lib/constants.js";

const num = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export default function ReportCard({ student, report, grades }) {
  const g = grades || {};
  const rows = GRADE_FIELDS.map((f) => {
    const note = num(g[f.id]);
    return { ...f, note, contribution: note === null ? null : (note * f.weight) / 100 };
  });
  const band = report?.band ? BANDS[report.band] : null;
  const attendance = Number(student.attendance_rate) || 0;

  return (
    <div className="print-area rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-sky-400">MC</span>
            <span className="text-sm font-semibold text-slate-900">MC LIVE TECH</span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Bulletin de notes</h1>
          <p className="text-xs text-slate-500">Programme APRDR — Centre de formation, Yaoundé</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div className="font-mono text-sm text-slate-800">{student.student_code}</div>
          <div>{fmtDate(student.created_at)}</div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-400">Étudiant</dt>
          <dd className="font-medium text-slate-900">{student.full_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Piste</dt>
          <dd>{trackLabel(student.track)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Groupe</dt>
          <dd>
            {student.group_name} · Cycle N° {student.cycle_number}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Participation</dt>
          <dd className={attendance >= 80 ? "text-emerald-700" : "text-rose-600"}>
            {attendance}% (min. 80%)
          </dd>
        </div>
      </dl>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Composante</th>
            <th className="px-3 py-2 text-right">Poids</th>
            <th className="px-3 py-2 text-right">Note /100</th>
            <th className="px-3 py-2 text-right">Contribution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-3 py-2">{r.label}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-500">{r.weight}%</td>
              <td className="px-3 py-2 text-right tabular-nums">
                {r.note === null ? <span className="text-slate-300">—</span> : r.note}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {r.contribution === null ? (
                  <span className="text-slate-300">—</span>
                ) : (
                  r.contribution.toFixed(1)
                )}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-900 bg-slate-50 font-semibold">
            <td className="px-3 py-2">Score final pondéré</td>
            <td className="px-3 py-2 text-right text-slate-400">100%</td>
            <td className="px-3 py-2 text-right">
              {report?.score == null ? (
                <span className="text-slate-400">—</span>
              ) : (
                <span className="tabular-nums">{report.score}/100</span>
              )}
            </td>
            <td className="px-3 py-2 text-right">
              {band ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${band.cls}`}>
                  {band.label}
                </span>
              ) : (
                <span className="text-xs font-normal text-slate-400">Aucune note saisie</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-1 ${
            report?.attendance_ok
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          Participation {attendance}%
        </span>
        <span
          className={`rounded-full px-2 py-1 ${
            report?.eligible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          {report?.eligible
            ? "Éligible au certificat"
            : "Non éligible au certificat (participation ≥ 80 % et note ≥ 60)"}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-slate-500">
        <div>
          <div className="mb-1 border-t border-slate-300 pt-1 font-medium text-slate-700">
            Le Formateur référent
          </div>
          <div>Signature &amp; cachet</div>
        </div>
        <div>
          <div className="mb-1 border-t border-slate-300 pt-1 font-medium text-slate-700">
            La Direction
          </div>
          <div>MC LIVE TECH · Yaoundé</div>
        </div>
      </div>
    </div>
  );
}
