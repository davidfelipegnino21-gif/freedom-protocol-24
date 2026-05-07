import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";
import { useAppState, phaseProgress, PHASES, useHydrated } from "@/lib/store";
import { Lock, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/metas")({
  head: () => ({ meta: [{ title: "Metas — Protocolo Libertad" }, { name: "description", content: "Tus metas SMART y el camino de las 7 fases del protocolo." }] }),
  component: Metas,
});

function Metas() {
  const s = useAppState();
  const hydrated = useHydrated();
  const progress = phaseProgress(s);
  const currentPhase = hydrated ? progress.current.n : 1;
  return (
    <div className="px-5 pt-8">
      <PageHeader kicker="S·M·A·R·T" title="Metas" subtitle="El camino de 7 fases hacia tu libertad." />
      <h2 className="font-display font-bold text-1 text-sm uppercase tracking-wider mb-3">Las 7 Fases</h2>
      <ol className="space-y-2.5">
        {PHASES.map((p) => {
          const status: "done" | "current" | "locked" = p.n < currentPhase ? "done" : p.n === currentPhase ? "current" : "locked";
          return (
            <li key={p.n} className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "var(--bg-card)", border: `1px solid ${status === "current" ? "var(--border-active)" : "var(--border-soft)"}`,
                boxShadow: status === "current" ? "var(--shadow-glow-soft)" : "none", opacity: status === "locked" ? 0.55 : 1 }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center font-display font-extrabold shrink-0"
                style={{ background: status === "current" ? "var(--gradient-primary)" : status === "done" ? "rgba(22,163,74,0.2)" : "var(--bg-elevated)",
                  color: status === "done" ? "var(--green)" : "#fff" }}>
                {status === "done" ? <Check className="h-5 w-5" /> : status === "locked" ? <Lock className="h-4 w-4" /> : p.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-1 text-base">{p.name}</h3>
                  {status === "current" && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-display font-bold uppercase tracking-wider flex items-center gap-1"
                      style={{ background: "var(--red-glow)", color: "var(--red)" }}>
                      <Zap className="h-2.5 w-2.5" />Actual
                    </span>
                  )}
                </div>
                <p className="text-3 text-xs mt-0.5">{p.desc}</p>
                {status === "current" && (
                  <div className="mt-3">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                      <div className="h-full" style={{ width: `${progress.pct}%`, background: "var(--gradient-primary)" }} />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] font-display tabular text-4">
                      <span>{progress.days}d</span>
                      <span>{progress.next ? `Meta: ${progress.next.days}d` : "Final"}</span>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <ComingSoon title="Metas SMART personalizadas" />
    </div>
  );
}
