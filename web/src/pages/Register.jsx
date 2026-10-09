import { useState } from "react";
import { api, go } from "../lib/api.js";
import StudentForm from "../components/StudentForm.jsx";
import { CENTER, groupLabel } from "../lib/center.js";
import { fcfa } from "../lib/constants.js";

export default function Register() {
  const [error, setError] = useState("");

  async function handleSubmit(values) {
    try {
      const student = await api("/api/students", { method: "POST", body: values });
      go(`/student/${student.id}`);
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Inscrire un étudiant</h1>
        <p className="text-sm text-slate-500">
          Un identifiant unique <span className="font-mono">MLT-26-A-0001</span> est généré
          automatiquement à l'enregistrement.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {CENTER.cycleMonths} mois · {CENTER.sessionsPerGroup} séances · {fcfa(CENTER.price)} par
          pack · {CENTER.hours}
          <br />
          {groupLabel("A")} · {groupLabel("B")}
        </p>
      </div>
      {error && (
        <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <StudentForm onSubmit={handleSubmit} onCancel={() => go("/students")} />
    </div>
  );
}
