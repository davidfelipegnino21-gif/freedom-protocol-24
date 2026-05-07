export type CatKey = "spiritual" | "mental" | "physical" | "discipline" | "finance" | "work" | "personal";

export const CATEGORIES: Record<CatKey, { label: string; color: string; glow: string; emoji: string }> = {
  spiritual: { label: "Espiritual", color: "#7C3AED", glow: "rgba(124,58,237,0.12)", emoji: "🙏" },
  mental:    { label: "Mental",     color: "#3B82F6", glow: "rgba(59,130,246,0.12)", emoji: "🧠" },
  physical:  { label: "Físico",     color: "#16A34A", glow: "rgba(22,163,74,0.12)", emoji: "💪" },
  discipline:{ label: "Disciplina", color: "#DC2626", glow: "rgba(220,38,38,0.12)", emoji: "⚔️" },
  finance:   { label: "Finanzas",   color: "#D4AF37", glow: "rgba(212,175,55,0.12)", emoji: "💰" },
  work:      { label: "Trabajo",    color: "#EA580C", glow: "rgba(234,88,12,0.12)", emoji: "💼" },
  personal:  { label: "Personal",   color: "#EC4899", glow: "rgba(236,72,153,0.12)", emoji: "✨" },
};

export function cat(c?: string) {
  return CATEGORIES[(c as CatKey) ?? "personal"] ?? CATEGORIES.personal;
}