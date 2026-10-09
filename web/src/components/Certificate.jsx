import { trackLabel, fmtDate } from "../lib/constants.js";

export default function Certificate({ student, achievement }) {
  const report = student.report || null;
  const attendance = Number(student.attendance_rate) || 0;

  return (
    <div className="print-area rounded-xl border-4 border-double border-amber-400 bg-white p-8 text-center shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.3em] text-amber-600">
        MC LIVE TECH · Programme APRDR
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-wide text-slate-900">
        {achievement.title || "Certificat de réussite"}
      </h1>
      <div className="mx-auto mt-2 h-1 w-28 bg-amber-400" />

      <p className="mt-5 text-sm text-slate-500">Décerné à</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{student.full_name}</p>
      <p className="font-mono text-xs text-slate-500">{student.student_code}</p>

      <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-600">
        pour avoir satisfait aux exigences du programme{" "}
        <b className="text-slate-800">{trackLabel(student.track)}</b> — Groupe{" "}
        {student.group_name}, Cycle N° {student.cycle_number}
        {report?.score != null && (
          <>
            {" "}
            — avec une note finale de <b className="text-slate-800">{report.score}/100</b>
          </>
        )}{" "}
        et une participation de <b className="text-slate-800">{attendance} %</b>.
        {achievement.description && (
          <>
            <br />
            <span className="text-slate-500">{achievement.description}</span>
          </>
        )}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-10 text-xs">
        <div>
          <div className="mb-1 border-t border-slate-400 pt-1.5 font-medium text-slate-800">
            La Direction
          </div>
          <div className="text-slate-400">MC LIVE TECH · Yaoundé</div>
        </div>
        <div>
          <div className="mb-1 border-t border-slate-400 pt-1.5 font-medium text-slate-800">
            Le Formateur référent
          </div>
          <div className="text-slate-400">Cohorte APRDR</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[10px] text-slate-400">
        <span>Yaoundé, le {fmtDate(achievement.issued_at)}</span>
        <span className="font-mono">
          N° {student.student_code}
          {achievement.id ? `/${achievement.id}` : ""}
        </span>
      </div>
    </div>
  );
}
