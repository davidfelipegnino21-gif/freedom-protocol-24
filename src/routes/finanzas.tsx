import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/PageHeader";
import { useAppState, useHydrated } from "@/lib/store";

export const Route = createFileRoute("/finanzas")({
  head: () => ({ meta: [{ title: "Finanzas — Protocolo Libertad" }, { name: "description", content: "Mayordomía bíblica: principio 10-20-70." }] }),
  component: Finanzas,
});

function Finanzas() {
  const s = useAppState();
  const hydrated = useHydrated();
  const income = s.profile.monthlyIncome || 0;
  const cur = s.profile.currency || "USD";
  const blocks = [
    { pct: 10, label: "Diezmo", emoji: "🙏", color: "var(--gold)", desc: "Para Dios primero" },
    { pct: 20, label: "Ahorro", emoji: "💰", color: "var(--green)", desc: "Para tu futuro" },
    { pct: 70, label: "Gastos", emoji: "🏠", color: "var(--blue)", desc: "Para vivir" },
  ];
  return (
    <div className="px-5 pt-8">
      <PageHeader kicker="Mayordomía bíblica" title="Finanzas" subtitle="Principio 10-20-70" />
      <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--gradient-streak)", border: "1px solid var(--border-gold)" }}>
        <div className="text-[10px] font-display uppercase tracking-widest" style={{ color: "var(--gold)" }}>Ingreso mensual</div>
        <div className="font-display font-extrabold text-3xl tabular text-1 mt-1">
          {hydrated ? `${cur} ${income.toLocaleString()}` : "—"}
        </div>
      </div>
      <div className="space-y-3">
        {blocks.map((b) => {
          const amount = income * (b.pct / 100);
          return (
            <div key={b.label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
              <span className="text-3xl">{b.emoji}</span>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-2xl tabular" style={{ color: b.color }}>{b.pct}%</span>
                  <span className="font-display font-semibold text-1 text-sm">{b.label}</span>
                </div>
                <div className="text-3 text-[11px]">{b.desc}</div>
              </div>
              <div className="font-display font-bold tabular text-1 text-base">
                {hydrated ? `${cur} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
              </div>
            </div>
          );
        })}
      </div>
      <ComingSoon title="Tracking de gastos por categoría" />
    </div>
  );
}
