import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState, useHydrated, daysSince, phaseProgress, habitStreak, todayKey, PHASES } from "@/lib/store";
import { Flame, TrendingUp, Calendar, ArrowRight, CheckCircle2, Circle, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Centro de Mando — Protocolo Libertad" },
      { name: "description", content: "Tu progreso diario, racha y fase actual del Protocolo Libertad." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useAppState();
  const hydrated = useHydrated();
  const days = hydrated ? daysSince(s.lastRelapseDate) : 0;
  const phase = phaseProgress(s);
  const today = s.entries[todayKey()];
  const totalEntries = Object.keys(s.entries).length;
  const cleanDays = Object.values(s.entries).filter((e) => !e.relapse).length;

  return (
    <div className="space-y-8">
      {/* Hero counter */}
      <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-card grid-bg shadow-elegant">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-ember)" }} />
        <div className="relative p-6 sm:p-10">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Operación en curso
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="font-mono text-7xl sm:text-8xl font-bold leading-none tracking-tighter text-gradient-primary">
              {hydrated ? String(days).padStart(2, "0") : "--"}
            </div>
            <div className="pb-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Días limpios</div>
              <div className="text-sm text-muted-foreground mt-1">desde {hydrated ? formatDate(s.lastRelapseDate) : "—"}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-background/40 px-5 py-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Fase actual</div>
              <div className="font-semibold">{phase.current.n}. {phase.current.name}</div>
            </div>
            <div className="font-mono text-2xl font-bold">{phase.current.n}<span className="text-muted-foreground text-base">/7</span></div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Link
              to="/checkin"
              className="group flex items-center justify-between rounded-lg bg-gradient-primary text-primary-foreground px-5 py-4 shadow-glow hover:opacity-95 transition-opacity"
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono opacity-80">
                  {today ? "Actualizar hoy" : "Acción diaria"}
                </div>
                <div className="font-bold">Registrar día</div>
              </div>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/habitos"
              className="group flex items-center justify-between rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-5 py-4 transition-colors"
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-primary">Arsenal</div>
                <div className="font-semibold">Ver hábitos</div>
              </div>
              <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/fases"
              className="group flex items-center justify-between rounded-lg border border-border bg-background/40 hover:border-primary/40 px-5 py-4 transition-colors"
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">Mapa</div>
                <div className="font-semibold">Ir a fases</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Flame} label="Racha actual" value={hydrated ? days : 0} suffix="d" />
        <StatCard icon={TrendingUp} label="Días registrados" value={hydrated ? totalEntries : 0} />
        <StatCard icon={CheckCircle2} label="Días limpios" value={hydrated ? cleanDays : 0} accent />
        <StatCard icon={Target} label="Hábitos activos" value={s.habits.length} />
      </section>

      {/* Phase progress */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono mb-1">Fase {phase.current.n} de 7</div>
            <h2 className="text-xl font-bold">{phase.current.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{phase.current.desc}</p>
          </div>
          <Link to="/fases" className="text-xs font-mono uppercase tracking-wider text-primary hover:text-primary-glow flex items-center gap-1">
            Ver mapa <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all duration-700" style={{ width: `${phase.pct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>{phase.days} días</span>
            <span>{phase.next ? `Siguiente: ${phase.next.name} (${phase.next.days}d)` : "Fase final alcanzada"}</span>
          </div>
        </div>
      </section>

      {/* Habits today */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Hábitos hoy</h2>
          <Link to="/habitos" className="text-xs font-mono uppercase tracking-wider text-primary hover:text-primary-glow">Gestionar</Link>
        </div>
        <ul className="divide-y divide-border">
          {s.habits.map((h) => {
            const done = today?.habitsCompleted.includes(h.id);
            const streak = hydrated ? habitStreak(s, h.id) : 0;
            return (
              <li key={h.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{h.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {streak} días
                    </div>
                  </div>
                </div>
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, accent }: { icon: any; label: string; value: number; suffix?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="font-mono text-2xl font-bold tracking-tight">{value}{suffix}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">{label}</div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
