import { createFileRoute } from "@tanstack/react-router";
import { useAppState, useHydrated, daysSince, bestStreak, totalRelapses, phaseProgress } from "@/lib/store";
import { Flame, AlertTriangle, Trophy, Calendar } from "lucide-react";

export const Route = createFileRoute("/progreso")({
  head: () => ({
    meta: [
      { title: "Progreso — Protocolo Libertad" },
      { name: "description", content: "Tu progreso completo: días limpios, recaídas y mejor racha." },
    ],
  }),
  component: Progreso,
});

function Progreso() {
  const s = useAppState();
  const hydrated = useHydrated();
  const days = hydrated ? daysSince(s.lastRelapseDate) : 0;
  const best = hydrated ? bestStreak(s) : 0;
  const relapses = hydrated ? totalRelapses(s) : 0;
  const phase = phaseProgress(s);
  const totalEntries = Object.keys(s.entries).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-2">Estadísticas</div>
        <h1 className="text-3xl font-bold tracking-tight">Progreso</h1>
        <p className="text-sm text-muted-foreground mt-1">Las cifras de tu transformación.</p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <Big icon={Flame} label="Días limpio" value={days} accent />
        <Big icon={Trophy} label="Mejor racha" value={best} />
        <Big icon={AlertTriangle} label="Recaídas" value={relapses} />
        <Big icon={Calendar} label="Días registrados" value={totalEntries} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-3">Fase actual</div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold">{phase.current.n}. {phase.current.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{phase.current.desc}</p>
          </div>
          <div className="font-mono text-3xl font-bold">{phase.current.n}<span className="text-muted-foreground text-base">/7</span></div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-gradient-primary" style={{ width: `${phase.pct}%` }} />
        </div>
      </section>
    </div>
  );
}

function Big({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-primary/40 bg-primary/5 shadow-glow" : "border-border bg-card"}`}>
      <Icon className={`h-5 w-5 mb-3 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <div className="font-mono text-4xl font-bold tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">{label}</div>
    </div>
  );
}
