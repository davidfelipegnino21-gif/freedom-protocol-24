import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, ArrowRight } from "lucide-react";
import { completeOnboarding, type OnboardingData, type Habit } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";

const MOTIVATIONS = [
  { id: "dios", emoji: "🙏", label: "Por mi relación con Dios" },
  { id: "familia", emoji: "👨‍👩‍👧", label: "Por mi familia o pareja" },
  { id: "mente", emoji: "🧠", label: "Por mi salud mental" },
  { id: "version", emoji: "⚡", label: "Por ser mi mejor versión" },
];

const DURATIONS = [
  { id: "1", emoji: "⏱", label: "Menos de 1 año" },
  { id: "1-3", emoji: "📅", label: "1 a 3 años" },
  { id: "3-7", emoji: "🗓", label: "3 a 7 años" },
  { id: "7+", emoji: "⌛", label: "Más de 7 años" },
];

const HABIT_OPTIONS: Habit[] = [
  { id: "orar", name: "Orar", icon: "🙏", category: "spiritual", createdAt: "" },
  { id: "biblia", name: "Leer Biblia", icon: "📖", category: "spiritual", createdAt: "" },
  { id: "ejercicio", name: "Ejercicio", icon: "💪", category: "physical", createdAt: "" },
  { id: "meditacion", name: "Meditación", icon: "🎯", category: "mental", createdAt: "" },
  { id: "leer", name: "Leer 15 minutos", icon: "📚", category: "mental", createdAt: "" },
  { id: "caminar", name: "Caminar", icon: "🚶", category: "physical", createdAt: "" },
  { id: "journal", name: "Journaling", icon: "✍️", category: "mental", createdAt: "" },
  { id: "noscreens", name: "Sin pantallas 1h antes de dormir", icon: "🌙", category: "discipline", createdAt: "" },
];

const CURRENCIES = ["USD", "MXN", "COP", "EUR", "PEN", "ARS"];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "", motivation: "", duration: "", currency: "USD", monthlyIncome: 0,
  });
  const [selected, setSelected] = useState<string[]>(HABIT_OPTIONS.map((h) => h.id));

  const next = () => setStep((s) => Math.min(5, s + 1));

  const finish = () => {
    const habits: Habit[] = HABIT_OPTIONS
      .filter((h) => selected.includes(h.id))
      .map((h) => ({ ...h, createdAt: new Date().toISOString() }));
    completeOnboarding(data, habits);
  };

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom" style={{ background: "var(--bg-base)" }}>
      {/* Splash */}
      {step === -1 && null}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === step ? 24 : 6,
              background: i <= step ? "var(--red)" : "var(--border-soft)",
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-6 pb-6 max-w-md w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && <StepName data={data} setData={setData} onNext={next} />}
            {step === 1 && <StepChoice
              title="¿Por qué quieres ser libre?"
              options={MOTIVATIONS}
              value={data.motivation}
              onChange={(v) => setData({ ...data, motivation: v })}
              onNext={next}
            />}
            {step === 2 && <StepChoice
              title="¿Cuánto tiempo llevas en esto?"
              options={DURATIONS}
              value={data.duration}
              onChange={(v) => setData({ ...data, duration: v })}
              onNext={next}
            />}
            {step === 3 && <StepHabits selected={selected} setSelected={setSelected} onNext={next} />}
            {step === 4 && <StepBudget data={data} setData={setData} onNext={next} />}
            {step === 5 && <StepFinish name={data.name} onFinish={finish} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CTAButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full mt-auto h-14 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
      style={{
        background: "var(--gradient-primary)",
        color: "#fff",
        boxShadow: disabled ? "none" : "var(--shadow-glow)",
      }}
    >
      {children} <ArrowRight className="h-5 w-5" />
    </button>
  );
}

function StepName({ data, setData, onNext }: any) {
  return (
    <>
      <div className="text-6xl mb-4">👤</div>
      <h1 className="font-display font-bold text-2xl mb-2 text-1">¿Cuál es tu nombre?</h1>
      <p className="text-3 text-sm mb-8">El nombre con el que te conoce Dios.</p>
      <input
        autoFocus
        type="text"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        placeholder="Tu nombre"
        className="w-full h-14 rounded-2xl px-5 font-display font-medium text-lg outline-none transition-colors"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-1)",
          border: `1px solid ${data.name ? "var(--border-active)" : "var(--border-soft)"}`,
        }}
      />
      <CTAButton disabled={!data.name.trim()} onClick={onNext}>Continuar</CTAButton>
    </>
  );
}

function StepChoice({ title, options, value, onChange, onNext }: any) {
  return (
    <>
      <h1 className="font-display font-bold text-2xl mb-6 text-1">{title}</h1>
      <div className="space-y-3 mb-6">
        {options.map((o: any) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className="w-full p-5 rounded-2xl flex items-center gap-4 text-left transition-all"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${active ? "var(--border-active)" : "var(--border-soft)"}`,
                boxShadow: active ? "0 0 20px var(--red-glow)" : "none",
              }}
            >
              <span className="text-3xl">{o.emoji}</span>
              <span className="font-display font-semibold text-1 flex-1">{o.label}</span>
              {active && <Check className="h-5 w-5" style={{ color: "var(--red)" }} />}
            </button>
          );
        })}
      </div>
      <CTAButton disabled={!value} onClick={onNext}>Continuar</CTAButton>
    </>
  );
}

function StepHabits({ selected, setSelected, onNext }: any) {
  const toggle = (id: string) =>
    setSelected((prev: string[]) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return (
    <>
      <h1 className="font-display font-bold text-2xl mb-2 text-1">Elige tus hábitos base</h1>
      <p className="text-3 text-sm mb-6">Puedes editarlos cuando quieras.</p>
      <div className="space-y-2 mb-6 overflow-y-auto" style={{ maxHeight: "55vh" }}>
        {HABIT_OPTIONS.map((h) => {
          const c = CATEGORIES[h.category as keyof typeof CATEGORIES];
          const active = selected.includes(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              className="w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${active ? "var(--border-active)" : "var(--border-soft)"}`,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span className="text-2xl">{h.icon}</span>
              <span className="font-display font-medium text-1 flex-1 text-sm">{h.name}</span>
              <span
                className="h-6 w-6 rounded-md flex items-center justify-center"
                style={{
                  background: active ? "var(--red)" : "transparent",
                  border: active ? "none" : "1.5px solid var(--text-4)",
                }}
              >
                {active && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <CTAButton onClick={onNext}>Continuar</CTAButton>
    </>
  );
}

function StepBudget({ data, setData, onNext }: any) {
  const tithe = data.monthlyIncome * 0.10;
  const savings = data.monthlyIncome * 0.20;
  const expenses = data.monthlyIncome * 0.70;
  return (
    <>
      <h1 className="font-display font-bold text-2xl mb-2 text-1">Tu presupuesto bíblico</h1>
      <p className="text-3 text-sm mb-6">Principio 10-20-70</p>

      <div
        className="rounded-2xl p-5 mb-6 space-y-3"
        style={{ background: "rgba(212,175,55,0.04)", border: "1px solid var(--border-gold)" }}
      >
        <Row emoji="🙏" pct="10%" label="Para Dios primero" sub="Diezmo" amount={tithe} cur={data.currency} />
        <Row emoji="💰" pct="20%" label="Para tu futuro" sub="Ahorro" amount={savings} cur={data.currency} />
        <Row emoji="🏠" pct="70%" label="Para vivir" sub="Gastos" amount={expenses} cur={data.currency} />
      </div>

      <label className="text-3 text-xs uppercase tracking-wider font-display mb-2 block">Moneda</label>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => setData({ ...data, currency: c })}
            className="h-11 rounded-xl font-display font-semibold text-sm transition-all"
            style={{
              background: data.currency === c ? "var(--red)" : "var(--bg-card)",
              color: data.currency === c ? "#fff" : "var(--text-2)",
              border: `1px solid ${data.currency === c ? "var(--red)" : "var(--border-soft)"}`,
            }}
          >{c}</button>
        ))}
      </div>

      <label className="text-3 text-xs uppercase tracking-wider font-display mb-2 block">Ingreso mensual</label>
      <input
        type="number"
        inputMode="numeric"
        value={data.monthlyIncome || ""}
        onChange={(e) => setData({ ...data, monthlyIncome: Number(e.target.value) || 0 })}
        placeholder="0"
        className="w-full h-14 rounded-2xl px-5 font-display font-bold text-xl outline-none mb-6"
        style={{
          background: "var(--bg-card)",
          color: "var(--text-1)",
          border: "1px solid var(--border-soft)",
        }}
      />
      <CTAButton onClick={onNext}>Continuar</CTAButton>
    </>
  );
}

function Row({ emoji, pct, label, sub, amount, cur }: any) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1">
        <div className="font-display font-semibold text-1 text-sm">
          <span style={{ color: "var(--gold)" }}>{pct}</span> — {label}
        </div>
        <div className="text-3 text-xs">{sub}</div>
      </div>
      <div className="font-display font-bold text-1 text-sm tabular">
        {amount > 0 ? `${cur} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
      </div>
    </div>
  );
}

function StepFinish({ name, onFinish }: { name: string; onFinish: () => void }) {
  const dots = Array.from({ length: 20 });
  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 relative">
      <div className="relative h-32 w-32 mb-8 flex items-center justify-center">
        {dots.map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const tx = Math.cos(angle) * 140;
          const ty = Math.sin(angle) * 140;
          return (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full pl-burst"
              style={{
                background: i % 2 === 0 ? "var(--red)" : "var(--gold)",
                ["--tx" as any]: `${tx}px`,
                ["--ty" as any]: `${ty}px`,
                animationDelay: `${i * 0.04}s`,
              }}
            />
          );
        })}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-7xl"
        >🛡️</motion.div>
      </div>
      <h1 className="font-display font-extrabold text-3xl mb-6 text-1 tracking-tight">
        ¡BIENVENIDO,<br/>{name.toUpperCase()}!
      </h1>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Pill>Nivel: Despertar</Pill>
        <Pill>Día 0</Pill>
        <Pill>Fase 1: Revelación</Pill>
      </div>
      <CTAButton onClick={onFinish}>Entrar al protocolo</CTAButton>
    </div>
  );
}

function Pill({ children }: any) {
  return (
    <span
      className="px-3 py-1.5 rounded-full font-display font-medium text-xs"
      style={{ background: "var(--bg-card)", color: "var(--text-2)", border: "1px solid var(--border-soft)" }}
    >{children}</span>
  );
}