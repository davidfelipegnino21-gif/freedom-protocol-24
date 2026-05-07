import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAppState, useHydrated, saveEntry, todayKey, toggleHabitToday, type Mood } from "@/lib/store";
import { cat } from "@/lib/categories";
import { PageHeader, ComingSoon } from "@/components/PageHeader";

export const Route = createFileRoute("/hoy")({
  head: () => ({ meta: [{ title: "Hoy — Protocolo Libertad" }, { name: "description", content: "Tu acción diaria: registro, hábitos, tareas y devocional." }] }),
  component: Hoy,
});

const TABS = [
  { id: "registro", label: "📝 Registro" },
  { id: "habitos", label: "💪 Hábitos" },
  { id: "tareas", label: "✅ Tareas" },
  { id: "devocional", label: "📖 Devocional" },
] as const;

const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: "excelente", emoji: "🔥", label: "Excelente" },
  { id: "bien", emoji: "💪", label: "Bien" },
  { id: "normal", emoji: "😐", label: "Normal" },
  { id: "luchando", emoji: "😢", label: "Luchando" },
  { id: "muymal", emoji: "💔", label: "Muy mal" },
];

function Hoy() {
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("registro");
  return (
    <div className="px-5 pt-8">
      <PageHeader kicker="Centro de acción" title="Hoy" subtitle="Lo que harás ahora define lo que serás mañana." />
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 h-10 rounded-full font-display font-semibold text-xs whitespace-nowrap"
              style={{ background: active ? "var(--red)" : "var(--bg-card)", color: active ? "#fff" : "var(--text-3)", border: `1px solid ${active ? "var(--red)" : "var(--border-soft)"}` }}>
              {t.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === "registro" && <RegistroTab />}
          {tab === "habitos" && <HabitosTab />}
          {tab === "tareas" && <ComingSoon title="Sistema de tareas" />}
          {tab === "devocional" && <ComingSoon title="Devocional diario" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RegistroTab() {
  const s = useAppState();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const today = todayKey();
  const existing = s.entries[today];
  const [mood, setMood] = useState<Mood>("normal");
  const [urge, setUrge] = useState(3);
  const [relapse, setRelapse] = useState(false);
  const [godTime, setGodTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (existing) { setMood(existing.mood); setUrge(existing.urge); setRelapse(existing.relapse); setGodTime(existing.godTime ?? 0); setNotes(existing.notes ?? ""); }
  }, [existing]);

  if (!hydrated) return null;

  const submit = () => {
    saveEntry({ date: today, mood, urge, relapse, habitsCompleted: existing?.habitsCompleted ?? [], godTime, notes });
    setTimeout(() => navigate({ to: "/" }), 600);
  };

  return (
    <div className="space-y-5">
      <Block label="¿Cómo fue hoy?">
        <div className="grid grid-cols-2 gap-3">
          <BigChoice label="Sin recaída" active={!relapse} color="var(--green)" glow="rgba(22,163,74,0.15)" onClick={() => { setRelapse(false); setShowCard(false); }} />
          <BigChoice label="Recaí hoy" active={relapse} color="var(--red)" glow="rgba(220,38,38,0.12)" onClick={() => { setRelapse(true); setShowCard(true); }} />
        </div>
        <AnimatePresence>
          {showCard && relapse && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-5 mt-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-soft)" }}>
              <h4 className="font-display font-bold text-1 text-lg">Hoy empieza de nuevo.</h4>
              <p className="text-2 text-sm mt-2">Una caída no define tu camino. Lo que importa es que estás aquí, siendo honesto contigo mismo. Eso ya es un acto de valentía.</p>
              <p className="text-3 text-xs italic mt-2">Sigue el registro. El protocolo no te abandona.</p>
              <button onClick={() => setShowCard(false)} className="mt-3 font-display font-semibold text-xs" style={{ color: "var(--red)" }}>Seguir adelante →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </Block>

      <Block label="¿Qué tan fuerte fue la tentación?">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3 text-[11px] font-display">Tranquilo</span>
          <span className="font-display font-extrabold tabular text-2xl" style={{ color: "var(--red)" }}>{urge}/10</span>
          <span className="text-3 text-[11px] font-display">Alta</span>
        </div>
        <input type="range" min={0} max={10} value={urge} onChange={(e) => setUrge(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--red) 0%, var(--red) ${urge*10}%, var(--bg-elevated) ${urge*10}%, var(--bg-elevated) 100%)`, accentColor: "var(--red)" }} />
      </Block>

      <Block label="¿Cómo está tu mente?">
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <motion.button key={m.id} whileTap={{ scale: 0.92 }} onClick={() => setMood(m.id)}
                className="rounded-xl py-3 flex flex-col items-center gap-1"
                style={{ background: active ? "var(--red-glow)" : "var(--bg-card)", border: `1px solid ${active ? "var(--border-active)" : "var(--border-soft)"}` }}>
                <span className="text-xl">{m.emoji}</span>
                <span className="font-display text-[9px]" style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}>{m.label}</span>
              </motion.button>
            );
          })}
        </div>
      </Block>

      <Block label="Tiempo con Dios (min)">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3 text-[11px] font-display">0</span>
          <span className="font-display font-extrabold tabular text-2xl" style={{ color: "var(--gold)" }}>{godTime}m</span>
          <span className="text-3 text-[11px] font-display">120</span>
        </div>
        <input type="range" min={0} max={120} step={5} value={godTime} onChange={(e) => setGodTime(Number(e.target.value))}
          className="w-full h-1.5" style={{ accentColor: "var(--gold)" }} />
      </Block>

      <Block label="Nota personal (opcional)">
        <textarea rows={3} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Qué aprendiste hoy? ¿Qué fue difícil? ¿Qué agradeces?"
          className="w-full p-3 rounded-xl outline-none resize-none text-sm font-body"
          style={{ background: "var(--bg-elevated)", color: "var(--text-1)", border: "1px solid var(--border-soft)" }} />
        <div className="text-right text-3 text-[10px] font-display mt-1 tabular">{notes.length}/500</div>
      </Block>

      <button onClick={submit} className="w-full h-14 rounded-2xl font-display font-bold text-base"
        style={{ background: "var(--gradient-primary)", color: "#fff", boxShadow: "var(--shadow-glow)" }}>
        GUARDAR REGISTRO
      </button>
    </div>
  );
}

function HabitosTab() {
  const s = useAppState();
  const hydrated = useHydrated();
  const today = s.entries[todayKey()];
  const completed = today?.habitsCompleted ?? [];
  if (!hydrated) return null;
  const pct = s.habits.length ? Math.round((completed.length / s.habits.length) * 100) : 0;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
        <div className="font-display font-semibold text-1 text-sm">{completed.length} de {s.habits.length} hábitos · {pct}%</div>
        <div className="h-2 rounded-full mt-2 overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full" style={{ background: "var(--gradient-primary)" }} />
        </div>
      </div>
      {s.habits.map((h) => {
        const c = cat(h.category);
        const done = completed.includes(h.id);
        return (
          <motion.button key={h.id} whileTap={{ scale: 0.98 }} onClick={() => toggleHabitToday(h.id)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 text-left overflow-hidden"
            style={{ background: "var(--bg-card)", border: `1px solid ${done ? "rgba(22,163,74,0.4)" : "var(--border-soft)"}` }}>
            <span className="w-[3px] h-12 rounded-full" style={{ background: c.color }} />
            <span className="h-10 w-10 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: c.glow }}>{h.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-1 text-sm truncate">{h.name}</div>
              <div className="text-3 text-[11px]">{c.label}</div>
            </div>
            <span className="h-7 w-7 rounded-full flex items-center justify-center"
              style={{ background: done ? "var(--green)" : "transparent", border: done ? "none" : "1.5px solid var(--text-4)" }}>
              {done && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><div className="text-3 text-[10px] font-display uppercase tracking-widest mb-2">{label}</div>{children}</div>);
}

function BigChoice({ label, active, color, glow, onClick }: { label: string; active: boolean; color: string; glow: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-16 rounded-2xl font-display font-bold text-base"
      style={{ background: active ? glow : "var(--bg-card)", color: "var(--text-1)", border: `1px solid ${active ? color : "var(--border-soft)"}`, boxShadow: active ? `0 0 20px ${glow}` : "none" }}>
      {label}
    </button>
  );
}
