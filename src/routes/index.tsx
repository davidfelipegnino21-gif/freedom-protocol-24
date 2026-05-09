import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  useAppState, useHydrated, daysSince, phaseProgress, todayKey, bestStreak, PHASES, type DailyEntry,
} from "@/lib/store";
import { cat } from "@/lib/categories";
import { Flame, ArrowRight, ChevronRight, Shield, Zap } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio — Protocolo Libertad" },
      { name: "description", content: "Tu centro de mando diario: racha, hábitos, fase y misión activa." },
    ],
  }),
  component: Inicio,
});

const MOOD_DISPLAY: Record<string, { emoji: string; label: string }> = {
  excelente: { emoji: "🔥", label: "Excelente" },
  bien: { emoji: "💪", label: "Bien" },
  normal: { emoji: "😐", label: "Normal" },
  luchando: { emoji: "😢", label: "Luchando" },
  muymal: { emoji: "💔", label: "Muy mal" },
};

const MESSAGES = [
  "El que vence es quien se levanta una vez más de las que cae.",
  "La libertad no se promete: se conquista cada día.",
  "Lo que no se enfrenta, te gobierna.",
  "Tu disciplina de hoy es la libertad de mañana.",
  "No eres tus deseos. Eres lo que decides hacer con ellos.",
  "Dios no te llamó a sobrevivir. Te llamó a vencer.",
  "El silencio del enemigo es ruido para el alma. Sigue.",
  "Cada ‘no’ a la tentación es un ‘sí’ a tu propósito.",
  "Pequeñas victorias diarias construyen hombres invencibles.",
  "Lo que repites te define, no lo que sientes.",
];

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Buenos días,";
  if (h >= 12 && h < 19) return "Buenas tardes,";
  return "Buenas noches,";
}

function getLevel(xp: number) {
  if (xp < 100) return { name: "Despertar", icon: "👁" };
  if (xp < 300) return { name: "Iniciado", icon: "🛡" };
  if (xp < 700) return { name: "Disciplinado", icon: "⚔️" };
  if (xp < 1500) return { name: "Guerrero", icon: "🔥" };
  return { name: "Libre", icon: "👑" };
}

function Inicio() {
  const s = useAppState();
  const hydrated = useHydrated();
  const days = hydrated ? daysSince(s.lastRelapseDate) : 0;
  const best = hydrated ? bestStreak(s) : 0;
  const phase = phaseProgress(s);
  const today = s.entries[todayKey()];
  const level = getLevel(s.xp);
  const xpInLevel = s.xp % 100;
  const message = MESSAGES[Math.floor(Date.now() / 86400000) % MESSAGES.length];

  // 7-day dot history
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const e: DailyEntry | undefined = s.entries[key];
    const dayName = ["D", "L", "M", "M", "J", "V", "S"][d.getDay()];
    let status: "done" | "relapse" | "empty" = "empty";
    if (e) status = e.relapse ? "relapse" : "done";
    return { key, dayName, status, isToday: i === 6 };
  });

  // Weekly habit completion %
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const e = s.entries[key];
    const total = s.habits.length || 1;
    const pct = e ? Math.round((e.habitsCompleted.length / total) * 100) : 0;
    return { day: ["D", "L", "M", "M", "J", "V", "S"][d.getDay()], pct };
  });

  const habitsCompletedCount = today?.habitsCompleted.length ?? 0;
  const habitsTotal = s.habits.length;
  const habitsPct = habitsTotal ? Math.round((habitsCompletedCount / habitsTotal) * 100) : 0;

  // Pending unified list
  const pendingHabits = s.habits.filter((h) => !today?.habitsCompleted.includes(h.id));

  return (
    <div className="px-5 pt-8 pb-4 space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <p className="font-display text-base text-2 leading-tight">
            {greeting()}<br/>
            <span style={{ color: "var(--red)" }} className="font-bold">
              {s.profile.name || "guerrero"}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-bold text-xs"
            style={{ background: "var(--red)", color: "#fff" }}
          >
            <span>{level.icon}</span>{level.name}
          </div>
          <div className="h-[3px] w-10 rounded-full mt-1.5 ml-auto" style={{ background: "var(--bg-elevated)" }}>
            <div className="h-full rounded-full" style={{ width: `${xpInLevel}%`, background: "var(--red)" }} />
          </div>
        </div>
      </header>

      {/* Streak Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-5"
        style={{
          background: "var(--gradient-streak)",
          border: "1px solid rgba(220,38,38,0.35)",
          boxShadow: "0 0 30px rgba(220,38,38,0.08)",
        }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-display font-extrabold leading-none tabular" style={{ fontSize: 80, color: "var(--red)" }}>
              {hydrated ? String(days).padStart(2, "0") : "00"}
            </div>
            <div className="text-3 text-sm mt-1 font-display">días limpios</div>
          </div>
          <div className="flex gap-1.5">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`h-3 w-3 rounded-full ${d.isToday ? "pl-pulse" : ""}`}
                  style={{
                    background:
                      d.status === "done" ? "var(--green)" :
                      d.status === "relapse" ? "var(--red)" :
                      "transparent",
                    border: d.status === "empty" ? "1.5px solid var(--text-5)" : "none",
                  }}
                />
                <span className="text-[9px] font-display text-4">{d.dayName}</span>
              </div>
            ))}
          </div>
        </div>
        {hydrated && best > 0 && (
          <div className="mt-4 flex items-center gap-1.5 text-xs font-display font-semibold" style={{ color: "var(--gold)" }}>
            <Flame className="h-3.5 w-3.5" /> Tu mejor racha: {best} días
          </div>
        )}
        {hydrated && days === 0 && (
          <p className="mt-3 text-sm text-2 italic">Hoy comienza todo. Un día a la vez.</p>
        )}
      </motion.section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-2.5">
        <QuickStat
          title="Estado"
          value={today ? MOOD_DISPLAY[today.mood]?.emoji : "—"}
          sub={today ? MOOD_DISPLAY[today.mood]?.label : "Sin registrar"}
        />
        <QuickStat
          title="Hábitos"
          value={`${habitsCompletedCount}/${habitsTotal}`}
          sub={`${habitsPct}%`}
          accent
        />
        <QuickStat
          title="Devocional"
          value={today?.godTime ? "✅" : "—"}
          sub={today?.godTime ? "Hecho" : "Pendiente"}
        />
      </section>

      {/* Tu día de hoy — unified list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg text-1">Tu día de hoy</h2>
          {pendingHabits.length > 0 && (
            <span
              className="px-2.5 py-1 rounded-full font-display font-bold text-[11px]"
              style={{ background: "var(--red)", color: "#fff" }}
            >{pendingHabits.length}</span>
          )}
        </div>

        {pendingHabits.length === 0 ? (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: "rgba(22,163,74,0.06)",
              border: "1px solid rgba(22,163,74,0.3)",
              boxShadow: "0 0 20px rgba(22,163,74,0.10)",
            }}
          >
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-display font-bold text-1">¡Día perfecto hasta ahora!</div>
            <div className="text-3 text-xs mt-1">+50 XP bonus pendiente</div>
          </div>
        ) : (
          <ul className="space-y-2">
            {pendingHabits.slice(0, 6).map((h) => {
              const c = cat(h.category);
              return (
                <li key={h.id} className="card-pl flex items-center gap-3 p-3 pl-0 overflow-hidden">
                  <span className="w-[3px] self-stretch" style={{ background: c.color }} />
                  <span
                    className="h-9 w-9 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ background: c.glow }}
                  >{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-1 text-sm truncate">{h.name}</div>
                    <div className="text-3 text-[11px]">Hábito · {c.label}</div>
                  </div>
                  <Link
                    to="/hoy"
                    className="px-3 py-1.5 rounded-lg font-display font-medium text-xs"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-2)" }}
                  >Hacer</Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Misión activa */}
      <section
        className="rounded-2xl p-5"
        style={{
          border: "1px solid var(--border-gold)",
          background: "rgba(212,175,55,0.04)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="h-3 w-3" style={{ color: "var(--gold)" }} />
          <span className="font-display font-bold text-[10px] tracking-widest uppercase" style={{ color: "var(--gold)" }}>
            Misión activa
          </span>
        </div>
        <h3 className="font-display font-bold text-1 text-base">
          Fase {phase.current.n}: {phase.current.name}
        </h3>
        <p className="italic text-2 text-sm mt-1">{phase.current.desc}</p>
        <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          <div className="h-full rounded-full" style={{ width: `${phase.pct}%`, background: "var(--gold)" }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-3 text-[11px] font-display tabular">
            {phase.days}d / {phase.next ? `${phase.next.days}d` : `${phase.current.days}d`}
          </span>
          <Link
            to="/metas"
            className="font-display font-semibold text-xs flex items-center gap-1"
            style={{ color: "var(--gold)" }}
          >Ver misión <ChevronRight className="h-3 w-3" /></Link>
        </div>
      </section>

      {/* Weekly chart */}
      <section className="card-pl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm text-1">Esta semana</h3>
          <span className="text-4 text-[11px] font-display tabular">
            {new Date(Date.now() - 6 * 86400000).toLocaleDateString("es", { day: "numeric", month: "short" })} — {new Date().toLocaleDateString("es", { day: "numeric", month: "short" })}
          </span>
        </div>
        <div style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-soft)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-3)" }}
                formatter={(v: any) => [`${v}%`, "Hábitos"]}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {weekData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= 80 ? "#16A34A" : d.pct >= 50 ? "#D4AF37" : d.pct > 0 ? "#DC2626" : "rgba(255,255,255,0.07)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-7 mt-1">
          {weekData.map((d, i) => (
            <span key={i} className="text-center text-[10px] font-display text-4">{d.day}</span>
          ))}
        </div>
      </section>

      {/* Motivational */}
      <section
        className="rounded-2xl p-5 relative"
        style={{ background: "var(--bg-card)", borderLeft: "3px solid var(--red)" }}
      >
        <span className="absolute top-2 left-3 text-3xl leading-none" style={{ color: "var(--red)", opacity: 0.2 }}>“</span>
        <p className="italic text-2 text-sm pl-6">{message}</p>
      </section>
{/* Finanzas */}
      {hydrated && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg text-1">💰 Finanzas</h2>
            <span className="text-[10px] font-display uppercase tracking-widest" style={{ color: "var(--gold)" }}>10-20-70</span>
          </div>
          <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: "var(--gradient-streak)", border: "1px solid var(--border-gold)" }}
          >
            <div className="text-[10px] font-display uppercase tracking-widest" style={{ color: "var(--gold)" }}>Ingreso mensual</div>
            <div className="font-display font-extrabold text-2xl tabular text-1 mt-1">
              {s.profile.currency} {s.profile.monthlyIncome.toLocaleString()}
            </div>
          </div>
          <div className="space-y-2">
            {[
              { pct: 10, label: "Diezmo", emoji: "🙏", color: "var(--gold)", desc: "Para Dios primero" },
              { pct: 20, label: "Ahorro", emoji: "💰", color: "var(--green)", desc: "Para tu futuro" },
              { pct: 70, label: "Gastos", emoji: "🏠", color: "var(--text-2)", desc: "Para vivir" },
            ].map((b) => (
              <div key={b.label} className="rounded-2xl p-3 flex items-center gap-3"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
                <span className="text-2xl">{b.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-extrabold text-lg tabular" style={{ color: b.color }}>{b.pct}%</span>
                    <span className="font-display font-semibold text-1 text-xs">{b.label}</span>
                  </div>
                  <div className="text-3 text-[10px]">{b.desc}</div>
                </div>
                <div className="font-display font-bold tabular text-1 text-sm">
                  {s.profile.currency} {(s.profile.monthlyIncome * b.pct / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Comunidad */}
      <a
        href="https://www.skool.com"
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl p-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(90deg, rgba(124,58,237,0.10), rgba(220,38,38,0.10))",
          border: "1px solid rgba(124,58,237,0.25)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">👥</span>
          <div>
            <div className="font-display font-semibold text-1 text-sm">Únete a los guerreros</div>
            <div className="text-3 text-[11px]">Comunidad en Skool</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-2" />
      </a>
    </div>
  );
}

function QuickStat({ title, value, sub, accent }: { title: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${accent ? "var(--border-active)" : "var(--border-soft)"}`,
        boxShadow: accent ? "0 0 16px var(--red-glow)" : "none",
      }}
    >
      <div className="text-[10px] font-display uppercase tracking-wider text-4">{title}</div>
      <div className={`font-display font-extrabold mt-1 ${accent ? "" : ""}`} style={{ fontSize: 22, color: accent ? "var(--red)" : "var(--text-1)" }}>
        {value}
      </div>
      <div className="text-3 text-[11px] mt-0.5 truncate">{sub}</div>
    </div>
  );
}
