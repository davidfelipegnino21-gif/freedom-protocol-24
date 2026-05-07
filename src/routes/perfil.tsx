import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";
import { useAppState, useHydrated, daysSince, bestStreak, totalRelapses, resetAll } from "@/lib/store";
import { Flame, Trophy, AlertTriangle, Calendar, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Protocolo Libertad" }, { name: "description", content: "Tu perfil, estadísticas y configuración." }] }),
  component: Perfil,
});

function Perfil() {
  const s = useAppState();
  const hydrated = useHydrated();
  const days = hydrated ? daysSince(s.lastRelapseDate) : 0;
  const best = hydrated ? bestStreak(s) : 0;
  const relapses = hydrated ? totalRelapses(s) : 0;
  const totalEntries = Object.keys(s.entries).length;
  const stats = [
    { icon: Flame, label: "Días limpio", value: days, color: "var(--red)" },
    { icon: Trophy, label: "Mejor racha", value: best, color: "var(--gold)" },
    { icon: AlertTriangle, label: "Recaídas", value: relapses, color: "var(--text-3)" },
    { icon: Calendar, label: "Días registrados", value: totalEntries, color: "var(--blue)" },
  ];
  const handleReset = () => {
    if (confirm("¿Reiniciar todo el protocolo? Esta acción no se puede deshacer.")) {
      resetAll();
      location.reload();
    }
  };
  return (
    <div className="px-5 pt-8">
      <PageHeader kicker="Tu camino" title={s.profile.name || "Guerrero"} subtitle={`XP total: ${s.xp}`} />
      <section className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((st) => (
          <div key={st.label} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
            <st.icon className="h-4 w-4 mb-2" style={{ color: st.color }} />
            <div className="font-display font-extrabold tabular text-2xl text-1">{st.value}</div>
            <div className="text-3 text-[10px] uppercase tracking-wider font-display mt-0.5">{st.label}</div>
          </div>
        ))}
      </section>
      <ComingSoon title="Logros, configuración y cuenta" />
      <button onClick={handleReset} className="w-full h-12 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 mt-6"
        style={{ background: "transparent", color: "var(--text-4)", border: "1px solid var(--border-soft)" }}>
        <RotateCcw className="h-4 w-4" /> Reiniciar protocolo
      </button>
    </div>
  );
}
