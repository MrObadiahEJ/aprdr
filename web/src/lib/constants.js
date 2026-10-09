export const TRACKS = [
  { id: "T1", label: "Marketing Digital", desc: "Stratégie, contenu, réseaux sociaux, publicités, analytics" },
  { id: "T2", label: "Analyse de données", desc: "Excel, SQL, Python, Power BI, data storytelling" },
  { id: "T3", label: "Génie Logiciel Web", desc: "HTML/CSS/JS, React, API, bases de données, déploiement" },
  { id: "T4", label: "GL Desktop & Mobile", desc: "POO, Flutter, Electron, publication sur les stores" },
  { id: "T5", label: "Cybersécurité", desc: "Réseau, Linux, OWASP, sécurité défensive" },
];

export const GROUPS = ["A", "B"];

export const STAGES = [
  { id: "new", label: "Nouveau" },
  { id: "contacted", label: "Contacté" },
  { id: "qualified", label: "Qualifié" },
  { id: "enrolled", label: "Inscrit" },
  { id: "graduated", label: "Diplômé" },
  { id: "lost", label: "Perdu" },
];

export const BANDS = {
  haute_distinction: { label: "Haute distinction", cls: "bg-emerald-100 text-emerald-800" },
  distinction: { label: "Distinction", cls: "bg-sky-100 text-sky-800" },
  pass: { label: "Admis", cls: "bg-amber-100 text-amber-800" },
  insuffisant: { label: "Insuffisant", cls: "bg-rose-100 text-rose-800" },
};

export const GRADE_FIELDS = [
  { id: "weekly", label: "Livrables hebdo", weight: 30 },
  { id: "midterm", label: "Test mi-parcours", weight: 20 },
  { id: "capstone", label: "Capstone", weight: 40 },
  { id: "continuous", label: "Assiduité / participation", weight: 10 },
];

export const ACHIEVEMENT_PRESETS = [
  { type: "badge", title: "100 % d'assiduité" },
  { type: "badge", title: "Meilleur portfolio" },
  { type: "badge", title: "Capstone exceptionnel" },
  { type: "badge", title: "Leadership de groupe" },
  { type: "award", title: "Étudiant du mois" },
  { type: "certificate", title: "Certificat de réussite" },
];

export const trackLabel = (id) => TRACKS.find((t) => t.id === id)?.label || id;
export const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label || id;

export const fcfa = (n) =>
  `${new Intl.NumberFormat("fr-FR").format(Number(n) || 0)} FCFA`;

export const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(String(s).replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? String(s)
    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};
