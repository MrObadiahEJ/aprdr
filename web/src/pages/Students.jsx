import { useEffect, useState } from "react";
import { api, go } from "../lib/api.js";
import { TRACKS, GROUPS, STAGES, trackLabel, stageLabel, fcfa } from "../lib/constants.js";

export default function Students() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", track: "", group: "", stage: "" });

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      api(`/api/students?${params}`)
        .then((d) => alive && setRows(d))
        .catch((e) => alive && setError(e.message));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [filters]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Étudiants</h1>
        <button
          onClick={() => go("/register")}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nouvel étudiant
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={filters.q}
          onChange={set("q")}
          placeholder="Rechercher (nom, ID, téléphone)…"
          className="w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
        />
        <select value={filters.track} onChange={set("track")} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          <option value="">Toutes pistes</option>
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>{`${t.id} · ${t.label}`}</option>
          ))}
        </select>
        <select value={filters.group} onChange={set("group")} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          <option value="">Tous groupes</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>Groupe {g}</option>
          ))}
        </select>
        <select value={filters.stage} onChange={set("stage")} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          <option value="">Tous statuts</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-rose-600">{error}</p>}
      {!rows && !error && <p className="text-slate-500">Chargement…</p>}

      {rows && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Nom</th>
                <th className="px-4 py-2.5">Piste</th>
                <th className="px-4 py-2.5">Grp</th>
                <th className="px-4 py-2.5">Statut</th>
                <th className="px-4 py-2.5 text-right">Participation</th>
                <th className="px-4 py-2.5 text-right">Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => go(`/student/${s.id}`)}
                  className="cursor-pointer hover:bg-sky-50"
                >
                  <td className="px-4 py-2.5 font-mono text-xs">{s.student_code}</td>
                  <td className="px-4 py-2.5 font-medium">{s.full_name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{trackLabel(s.track)}</td>
                  <td className="px-4 py-2.5">{s.group_name}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                      {stageLabel(s.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className={s.attendance_rate >= 80 ? "text-emerald-700" : "text-rose-600"}>
                      {s.attendance_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {fcfa(s.fees_expected - s.fees_paid)}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    Aucun résultat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
