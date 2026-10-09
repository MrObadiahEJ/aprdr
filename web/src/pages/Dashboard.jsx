import { useEffect, useState } from "react";
import { api, go } from "../lib/api.js";
import { TRACKS, STAGES, trackLabel, stageLabel, fcfa } from "../lib/constants.js";
import { CENTER, groupDays } from "../lib/center.js";

function Stat({ label, value, sub, accent = "text-slate-900" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function Bar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-40 shrink-0 truncate text-slate-600">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 text-right tabular-nums text-slate-700">
        {count} <span className="text-slate-400">({pct}%)</span>
      </span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Chargement…</p>;

  const total = stats.total;
  const feePct = stats.fees_expected
    ? Math.round((stats.fees_paid / stats.fees_expected) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Étudiants" value={stats.total} sub="toutes promotions" />
        <Stat
          label="Frais perçus"
          value={fcfa(stats.fees_paid)}
          sub={`sur ${fcfa(stats.fees_expected)} · ${feePct}%`}
          accent="text-emerald-700"
        />
        <Stat
          label="Solde dû"
          value={fcfa(stats.balance)}
          sub="à recouvrer"
          accent="text-amber-600"
        />
        <Stat
          label="Certificats éligibles"
          value={stats.eligible_certificates}
          sub={`${stats.achievements_count} réalisations délivrées`}
          accent="text-sky-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Répartition par piste</h2>
          <div className="space-y-2">
            {TRACKS.map((t, i) => (
              <Bar
                key={t.id}
                label={`${t.id} · ${t.label}`}
                count={stats.by_track[t.id] || 0}
                total={total}
                color={["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"][i]}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Groupes & statuts</h2>
          <div className="space-y-2">
            <Bar label={`Groupe A (${groupDays("A")})`} count={stats.by_group.A || 0} total={total} color="bg-sky-500" />
            <Bar label={`Groupe B (${groupDays("B")})`} count={stats.by_group.B || 0} total={total} color="bg-violet-500" />
            <div className="mt-4 border-t border-slate-100 pt-3">
              {STAGES.filter((s) => stats.by_stage[s.id]).map((s) => (
                <div key={s.id} className="flex justify-between py-0.5 text-sm">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-medium tabular-nums">{stats.by_stage[s.id]}</span>
                </div>
              ))}
              {!Object.keys(stats.by_stage).length && (
                <p className="text-sm text-slate-400">Aucune inscription pour l'instant.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Le centre — {CENTER.name} · {CENTER.program}
          </h2>
          <span className="text-xs text-slate-400">
            {CENTER.location} · {CENTER.surface}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
          <div>
            <div className="text-xs text-slate-400">Tarif par pack</div>
            <div className="font-semibold text-emerald-700">{fcfa(CENTER.price)}</div>
            <div className="text-xs text-slate-500">par étudiant · par cycle</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Cycle standard</div>
            <div className="font-semibold">{CENTER.cycleMonths} mois</div>
            <div className="text-xs text-slate-500">{CENTER.sessionsPerGroup} séances / groupe</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Horaires</div>
            <div className="font-semibold">{CENTER.hours}</div>
            <div className="text-xs text-slate-500">pauses incluses</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Groupes</div>
            <div className="font-semibold">A · B</div>
            <div className="text-xs text-slate-500">
              {groupDays("A")} / {groupDays("B")}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-3 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              Les 5 filières
            </div>
            <ul className="space-y-1.5 text-sm">
              {TRACKS.map((t) => (
                <li key={t.id} className="flex gap-2">
                  <span className="shrink-0 font-mono text-xs text-sky-600">{t.id}</span>
                  <span className="text-slate-700">
                    {t.label}
                    <span className="block text-xs text-slate-400">{t.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Formats</div>
            <div className="flex flex-wrap gap-2">
              {CENTER.formats.map((f) => (
                <span
                  key={f.id}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                >
                  {f.label} · {f.months} mois ({f.sessions} séances)
                </span>
              ))}
            </div>
            <div className="mb-2 mt-4 text-xs uppercase tracking-wide text-slate-400">
              Pédagogie
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              {CENTER.pedagogy.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Dernières inscriptions</h2>
          <button
            onClick={() => go("/register")}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Nouvel étudiant
          </button>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucun étudiant — commencez par inscrire le premier membre de la Cohorte 1.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.recent.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(`/student/${s.id}`)}
                  className="flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-slate-50"
                >
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                    {s.student_code}
                  </span>
                  <span className="flex-1 truncate font-medium">{s.full_name}</span>
                  <span className="text-xs text-slate-500">
                    {trackLabel(s.track)} · Groupe {s.group_name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {stageLabel(s.stage)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
