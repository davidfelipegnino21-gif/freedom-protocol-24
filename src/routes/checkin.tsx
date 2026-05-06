import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppState, useHydrated, saveEntry, todayKey, type Mood } from "@/lib/store";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkin")({
  head: () => ({
    meta: [
      { title: "Check-in diario — Protocolo Libertad" },
      { name: "description", content: "Registra tu estado mental, urgencias y hábitos completados hoy." },
    ],
  }),
  component: CheckIn,
});

const MOODS: { id: Mood; label: string; emoji: string }[] = [
  { id: "fuerte", label: "Fuerte", emoji: "🛡️" },
  { id: "estable", label: "Estable", emoji: "⚖️" },
  { id: "tentado", label: "Tentado", emoji: "⚠️" },
  { id: "debil", label: "Débil", emoji: "🩸" },
];

function CheckIn() {
  const s = useAppState();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const today = todayKey();
  const existing = s.entries[today];

  const [mood, setMood] = useState<Mood>("estable");
  const [urge, setUrge] = useState(3);
  const [relapse, setRelapse] = useState(false);
  const [habits, setHabits] = useState<string[]>([]);
  const [godTime, setGodTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existing) {
      setMood(existing.mood);
      setUrge(existing.urge);
      setRelapse(existing.relapse);
      setHabits(existing.habitsCompleted);
      setGodTime(existing.godTime ?? 0);
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const toggleHabit = (id: string) => {
    setHabits((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  };

  const submit = () => {
    saveEntry({ date: today, mood, urge, relapse, habitsCompleted: habits, godTime, notes });
    setSaved(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  };

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-2">Reporte diario</div>
        <h1 className="text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="text-sm text-muted-foreground mt-1">{formatDate(today)} {existing && "· Ya completaste hoy, puedes actualizar."}</p>
      </header>

      {/* Mood */}
      <Card title="¿Cómo te sientes?">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`rounded-lg border p-4 text-center transition-all ${
                mood === m.id
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-background/40 hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xs font-mono uppercase tracking-wider">{m.label}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Urge level */}
      <Card title="Nivel de urgencia / tentación">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">0 — calma</span>
          <span className="font-mono text-3xl font-bold text-primary">{urge}</span>
          <span className="text-xs font-mono text-muted-foreground">10 — máxima</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={urge}
          onChange={(e) => setUrge(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </Card>

      {/* Habits */}
      <Card title="Hábitos completados hoy">
        {s.habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tienes hábitos definidos.</p>
        ) : (
          <div className="space-y-2">
            {s.habits.map((h) => {
              const checked = habits.includes(h.id);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                    checked ? "border-success/50 bg-success/5" : "border-border bg-background/40 hover:border-primary/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{h.icon}</span>
                    <span className="text-sm font-medium">{h.name}</span>
                  </span>
                  {checked ? <CheckCircle2 className="h-5 w-5 text-success" /> : <span className="h-5 w-5 rounded-full border border-muted-foreground/30" />}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Relapse */}
      <Card title="Estado del protocolo">
        <button
          onClick={() => setRelapse((r) => !r)}
          className={`w-full flex items-center justify-between rounded-lg border px-4 py-4 transition-all ${
            relapse
              ? "border-destructive bg-destructive/10"
              : "border-border bg-background/40 hover:border-primary/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {relapse ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Shield className="h-5 w-5 text-success" />}
            <div className="text-left">
              <div className="font-semibold">{relapse ? "Reportar recaída" : "Día limpio"}</div>
              <div className="text-xs text-muted-foreground">{relapse ? "El contador se reiniciará." : "Mantienes la racha."}</div>
            </div>
          </div>
          <div className={`h-6 w-11 rounded-full transition-colors ${relapse ? "bg-destructive" : "bg-secondary"}`}>
            <div className={`h-5 w-5 rounded-full bg-foreground mt-0.5 transition-transform ${relapse ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </div>
        </button>
      </Card>

      {/* Notes */}
      <Card title="Tiempo con Dios (minutos)">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">0 min</span>
          <span className="font-mono text-3xl font-bold text-primary">{godTime}</span>
          <span className="text-xs font-mono text-muted-foreground">120 min</span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          step={5}
          value={godTime}
          onChange={(e) => setGodTime(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </Card>

      <Card title="Notas (opcional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="¿Qué desencadenó hoy? ¿Qué aprendiste?"
          className="w-full rounded-lg border border-border bg-background/40 p-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
        />
      </Card>

      <button
        onClick={submit}
        disabled={saved}
        className="w-full bg-gradient-primary text-primary-foreground font-bold uppercase tracking-wider text-sm py-4 rounded-lg shadow-glow hover:opacity-95 transition-opacity disabled:opacity-60"
      >
        {saved ? "✓ Guardado" : "Confirmar reporte"}
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-[11px] uppercase tracking-[0.18em] font-mono text-muted-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" });
}
