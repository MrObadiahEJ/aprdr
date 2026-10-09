import { useState } from "react";
import { TRACKS, GROUPS, STAGES, trackLabel } from "../lib/constants.js";
import { groupDays, CENTER } from "../lib/center.js";

const EMPTY = {
  full_name: "",
  phone: "",
  email: "",
  city_quartier: "",
  group_name: "A",
  track: "T1",
  cycle_number: 1,
  stage: "enrolled",
  fees_expected: CENTER.price,
  fees_paid: 0,
  attendance_rate: 0,
  portfolio_url: "",
  parent_name: "",
  parent_phone: "",
  consent_marketing: false,
  notes: "",
};

const INPUT =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none";

function Field({ label, className = "block", children }) {
  return (
    <label className={className}>
      <span className="block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Legend({ children }) {
  return (
    <h2 className="col-span-full border-b border-slate-100 pb-2 text-sm font-semibold text-slate-700">
      {children}
    </h2>
  );
}

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [v, setV] = useState(() => {
    const base = { ...EMPTY };
    if (initial) for (const k of Object.keys(EMPTY)) {
      if (initial[k] !== undefined && initial[k] !== null) base[k] = initial[k];
    }
    return base;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) =>
    setV((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!String(v.full_name).trim() || !String(v.phone).trim()) {
      setError("Le nom complet et le téléphone sont requis.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        ...v,
        full_name: String(v.full_name).trim(),
        phone: String(v.phone).trim(),
        email: String(v.email || "").trim(),
        city_quartier: String(v.city_quartier || "").trim(),
        portfolio_url: String(v.portfolio_url || "").trim(),
        parent_name: String(v.parent_name || "").trim(),
        parent_phone: String(v.parent_phone || "").trim(),
        notes: String(v.notes || "").trim(),
        group_name: String(v.group_name),
        track: String(v.track),
        stage: String(v.stage),
        cycle_number: Number(v.cycle_number) || 1,
        fees_expected: Number(v.fees_expected) || 0,
        fees_paid: Number(v.fees_paid) || 0,
        attendance_rate: Number(v.attendance_rate) || 0,
        consent_marketing: !!v.consent_marketing,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Legend>Identité</Legend>
        <Field label="Nom complet *">
          <input value={v.full_name} onChange={set("full_name")} className={INPUT} placeholder="Ex. Mbarga Aurélie" />
        </Field>
        <Field label="Téléphone *">
          <input value={v.phone} onChange={set("phone")} className={INPUT} placeholder="6XX XX XX XX" />
        </Field>
        <Field label="E-mail">
          <input type="email" value={v.email} onChange={set("email")} className={INPUT} placeholder="nom@exemple.com" />
        </Field>
        <Field label="Ville / quartier">
          <input value={v.city_quartier} onChange={set("city_quartier")} className={INPUT} placeholder="Yaoundé — Mvog-Ada" />
        </Field>
        <Field label="Parent / tuteur">
          <input value={v.parent_name} onChange={set("parent_name")} className={INPUT} />
        </Field>
        <Field label="Téléphone du parent">
          <input value={v.parent_phone} onChange={set("parent_phone")} className={INPUT} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Legend>Formation</Legend>
        <Field label="Piste *">
          <select value={v.track} onChange={set("track")} className={INPUT}>
            {TRACKS.map((t) => (
              <option key={t.id} value={t.id}>{`${t.id} · ${t.label}`}</option>
            ))}
          </select>
        </Field>
        <Field label="Groupe *">
          <select value={v.group_name} onChange={set("group_name")} className={INPUT}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>{`Groupe ${g} (${groupDays(g)})`}</option>
            ))}
          </select>
        </Field>
        <Field label="Cycle (n°)">
          <input type="number" min="1" value={v.cycle_number} onChange={set("cycle_number")} className={INPUT} />
        </Field>
        <Field label="Statut">
          <select value={v.stage} onChange={set("stage")} className={INPUT}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Portfolio (URL)" className="block sm:col-span-2">
          <input type="url" value={v.portfolio_url} onChange={set("portfolio_url")} className={INPUT} placeholder="https://…" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Legend>Frais &amp; participation</Legend>
        <Field label="Frais attendus (FCFA)">
          <input type="number" min="0" step="1000" value={v.fees_expected} onChange={set("fees_expected")} className={INPUT} />
        </Field>
        <Field label="Déjà payé (FCFA)">
          <input type="number" min="0" step="1000" value={v.fees_paid} onChange={set("fees_paid")} className={INPUT} />
        </Field>
        <Field label="Participation / assiduité %">
          <input type="number" min="0" max="100" value={v.attendance_rate} onChange={set("attendance_rate")} className={INPUT} />
        </Field>
        <Field label="Consentement communication">
          <span className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={!!v.consent_marketing}
              onChange={set("consent_marketing")}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Accepte de recevoir les communications du centre
          </span>
        </Field>
        <Field label="Notes" className="block sm:col-span-2">
          <textarea
            rows={3}
            value={v.notes}
            onChange={set("notes")}
            className={INPUT}
            placeholder="Informations complémentaires…"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {busy
            ? "Enregistrement…"
            : initial
              ? "Enregistrer les modifications"
              : `Inscrire (${trackLabel(v.track)})`}
        </button>
      </div>
    </form>
  );
}
