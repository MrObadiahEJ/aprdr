export const CENTER = {
  name: "MC LIVE TECH",
  program: "APRDR",
  tagline: "Centre de formation en numérique",
  location: "Yaoundé — Quabang, au carrefour",
  surface: "90 m²",
  hours: "08:00 → 16:00",
  price: 50000,
  cycleMonths: 2,
  sessionsPerGroup: 24,
  formats: [
    { id: "standard", label: "Standard", months: 2, sessions: 24, note: "Format de lancement" },
    { id: "extended", label: "Étendu", months: 3, sessions: 36, note: "Phase 2" },
    { id: "deep", label: "Approfondi", months: 6, sessions: 72, note: "Phase 2 + stage" },
  ],
  groups: [
    { id: "A", days: "lun · mer · ven", label: "Groupe A — lundi, mercredi, vendredi" },
    { id: "B", days: "mar · jeu · sam", label: "Groupe B — mardi, jeudi, samedi" },
  ],
  pedagogy: [
    "Pratique d'abord",
    "Livrables hebdomadaires",
    "Un projet final (capstone) par étudiant",
  ],
  contact: { phone: "", whatsapp: "" },
};

export const groupDays = (id) => CENTER.groups.find((g) => g.id === id)?.days || "";
export const groupLabel = (id) => CENTER.groups.find((g) => g.id === id)?.label || `Groupe ${id}`;
