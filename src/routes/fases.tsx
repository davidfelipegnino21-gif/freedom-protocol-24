import { createFileRoute } from "@tanstack/react-router";
import { useAppState, useHydrated, phaseProgress, PHASES } from "@/lib/store";
import { Lock, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/fases")({
  head: () => ({
    meta: [
      { title: "Las 7 Fases — Protocolo Libertad" },
      { name: "description", content: "El camino de 7 fases del Protocolo Libertad: del despertar a la libertad total." },
    ],
  }),
  component: Phases,
});

function Phases() {
  const s = useAppState();
  const hydrated = useHydrated();
  const progress = phaseProgress(s);
  const currentPhase = hydrated ? progress.current.n : 1;
  const days = hydrated ? progress.days : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-2">El camino</div>
        <h1 className="text-3xl font-bold tracking-tight">7 Fases del Protocolo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {hydrated ? `Llevas ${days} días. Estás en la fase ${currentPhase}.` : "Tu progreso paso a paso."}
        </p>
      </header>

      <ol className="relative space-y-3">
        {PHASES.map((p) => {
          const status: "done" | "current" | "locked" =
            p.n < currentPhase ? "done" : p.n === currentPhase ? "current" : "locked";
          return (
            <li
              key={p.n}
              className={`relative rounded-xl border p-5 transition-all ${
                status === "current"
                  ? "border-primary bg-primary/5 shadow-glow"
                  : status === "done"
                  ? "border-success/40 bg-success/5"
                  : "border-border bg-card opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg shrink-0 ${
                    status === "current"
                      ? "bg-gradient-primary text-primary-foreground"
                      : status === "done"
                      ? "bg-success/20 text-success"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {status === "done" ? <Check className="h-5 w-5" /> : status === "locked" ? <Lock className="h-4 w-4" /> : p.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      Día {p.n === 1 ? "0" : PHASES[p.n - 2].days}+
                    </span>
                    {status === "current" && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Actual
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>

                  {status === "current" && (
                    <div className="mt-4">
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gradient-primary" style={{ width: `${progress.pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1.5">
                        <span>{days} días</span>
                        <span>{progress.next ? `Meta: ${progress.next.days}d` : "Fase final"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
