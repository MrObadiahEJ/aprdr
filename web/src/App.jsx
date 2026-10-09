import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Register from "./pages/Register.jsx";
import Students from "./pages/Students.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import { CENTER, groupDays } from "./lib/center.js";
import { fcfa } from "./lib/constants.js";

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

const NAV = [
  { href: "#/", label: "Tableau de bord" },
  { href: "#/students", label: "Étudiants" },
  { href: "#/register", label: "Inscription" },
];

export default function App() {
  const route = useHashRoute();

  let page;
  if (route.startsWith("/student/")) page = <StudentDetail id={route.split("/")[2]} />;
  else if (route === "/register") page = <Register />;
  else if (route === "/students") page = <Students />;
  else page = <Dashboard />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="no-print sticky top-0 z-10 border-b border-slate-700 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <a href="#/" className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="rounded bg-sky-500 px-2 py-0.5 font-mono text-sm">MC</span>
            <span>
              MC LIVE TECH
              <span className="ml-2 text-sm font-normal text-slate-400">APRDR</span>
            </span>
          </a>
          <nav className="flex gap-1 text-sm">
            {NAV.map((n) => {
              const active =
                n.href === "#" + route ||
                (n.href === "#/students" && route.startsWith("/student"));
              return (
                <a
                  key={n.href}
                  href={n.href}
                  className={`rounded px-3 py-1.5 transition ${
                    active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {n.label}
                </a>
              );
            })}
          </nav>
          <a
            href="/api/export"
            className="ml-auto text-xs text-slate-400 hover:text-white"
            title="Sauvegarde JSON de toutes les données"
          >
            Exporter les données
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{page}</main>
      <footer className="no-print mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400">
        {CENTER.name} — {CENTER.program} · {CENTER.tagline} · {CENTER.location} · {CENTER.hours}
        <br />
        Groupe A : {groupDays("A")} · Groupe B : {groupDays("B")} · {fcfa(CENTER.price)} / pack
      </footer>
    </div>
  );
}
