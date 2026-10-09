import { trackLabel, stageLabel } from "../lib/constants.js";

const BARS = [3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1];

export default function IdCard({ student, print = false }) {
  const initials = String(student.full_name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const year = String(student.created_at || "").slice(0, 4) || String(new Date().getFullYear());

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        print ? "print-area mx-auto w-full max-w-lg" : "w-full"
      }`}
    >
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="rounded bg-sky-500 px-1.5 py-0.5 font-mono text-xs">MC</span>
          <div>
            <div className="text-sm font-semibold leading-tight">MC LIVE TECH</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">
              Carte d'étudiant · APRDR
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs text-sky-400">{student.student_code}</div>
          <div className="text-[10px] text-slate-400">{stageLabel(student.stage)}</div>
        </div>
      </div>

      <div className="flex gap-4 p-4">
        <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-slate-800 text-2xl font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-bold leading-tight text-slate-900">
            {student.full_name}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
            <div>
              <span className="text-slate-400">Piste </span>
              {trackLabel(student.track)}
            </div>
            <div>
              <span className="text-slate-400">Groupe </span>
              {student.group_name}
            </div>
            <div>
              <span className="text-slate-400">Cycle </span>N° {student.cycle_number}
            </div>
            <div>
              <span className="text-slate-400">Tél. </span>
              {student.phone}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2">
        <span className="text-[10px] leading-tight text-slate-400">
          Valable pour la promotion {year} — Centre de formation MC LIVE TECH, Yaoundé
        </span>
        <div className="flex h-6 shrink-0 items-end gap-px" aria-hidden="true">
          {BARS.map((w, i) => (
            <span
              key={i}
              className="block bg-slate-800"
              style={{ width: `${w}px`, height: i % 3 === 0 ? "100%" : "70%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
