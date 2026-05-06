import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, useHydrated, addHabit, removeHabit, habitStreak } from "@/lib/store";
import { Flame, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/habitos")({
  head: () => ({
    meta: [
      { title: "Hábitos — Protocolo Libertad" },
      { name: "description", content: "Gestiona tus hábitos diarios y construye rachas que te transformen." },
    ],
  }),
  component: Habits,
});

const ICONS = ["💪", "📖", "🧘", "🚿", "🏃", "💧", "🍎", "✍️", "🌅", "🛏️", "🔥", "⚔️"];

function Habits() {
  const s = useAppState();
  const hydrated = useHydrated();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⚔️");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(name.trim(), icon);
    setName("");
    setIcon("⚔️");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-2">Arsenal diario</div>
        <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
        <p className="text-sm text-muted-foreground mt-1">Lo que haces todos los días te define. Construye rachas.</p>
      </header>

      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.18em] font-mono text-muted-foreground">Nuevo hábito</h2>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`h-10 w-10 rounded-md text-lg border transition-all ${
                icon === i ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-background/40 hover:border-primary/30"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Meditar 10 minutos"
            className="flex-1 rounded-lg border border-border bg-background/40 px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            className="bg-gradient-primary text-primary-foreground font-bold px-5 rounded-lg shadow-glow hover:opacity-95 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Añadir
          </button>
        </div>
      </form>

      <section className="space-y-2">
        {s.habits.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
            Aún no tienes hábitos. Añade el primero arriba.
          </div>
        )}
        {s.habits.map((h) => {
          const streak = hydrated ? habitStreak(s, h.id) : 0;
          return (
            <div key={h.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                  {h.icon}
                </div>
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Flame className="h-3.5 w-3.5 text-primary" />
                    Racha: <span className="text-foreground font-bold">{streak}</span> días
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeHabit(h.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
