import { useEffect, useState, useSyncExternalStore } from "react";

export type Mood = "excelente" | "bien" | "normal" | "luchando" | "muymal";
export type Category = "spiritual" | "mental" | "physical" | "discipline" | "finance" | "work" | "personal";

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Mood;
  urge: number; // 0-10
  relapse: boolean;
  habitsCompleted: string[]; // habit ids
  godTime?: number; // minutes with God
  notes?: string;
  energy?: "baja" | "normal" | "alta";
  sleptWell?: boolean;
  godActivities?: string[];
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category?: Category;
  createdAt: string;
}

export interface OnboardingData {
  name: string;
  motivation: string;
  duration: string;
  currency: string;
  monthlyIncome: number;
}

export interface AppState {
  startDate: string; // ISO date when user began
  lastRelapseDate: string; // ISO date of last reset
  currentPhase: number; // 1-7
  habits: Habit[];
  entries: Record<string, DailyEntry>; // by date
  onboarded: boolean;
  profile: OnboardingData;
  xp: number;
}

const STORAGE_KEY = "protocolo-libertad-v2";

const DEFAULT_HABITS: Habit[] = [
  { id: "orar", name: "Orar", icon: "🙏", category: "spiritual", createdAt: new Date().toISOString() },
  { id: "biblia", name: "Leer Biblia", icon: "📖", category: "spiritual", createdAt: new Date().toISOString() },
  { id: "ejercicio", name: "Ejercicio", icon: "💪", category: "physical", createdAt: new Date().toISOString() },
  { id: "meditacion", name: "Meditación", icon: "🎯", category: "mental", createdAt: new Date().toISOString() },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): AppState {
  const today = todayISO();
  return {
    startDate: today,
    lastRelapseDate: today,
    currentPhase: 1,
    habits: DEFAULT_HABITS,
    entries: {},
    onboarded: false,
    profile: { name: "", motivation: "", duration: "", currency: "USD", monthlyIncome: 0 },
    xp: 0,
  };
}

let state: AppState = defaultState();
let initialized = false;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  emit();
}

function save() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emit() {
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  save();
  emit();
}

export function useAppState(): AppState {
  useEffect(() => {
    load();
  }, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}

// Hydration-safe wrapper for components that render different content based on stored state
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// --- Actions ---

export function saveEntry(entry: DailyEntry) {
  setState((s) => {
    const next: AppState = {
      ...s,
      entries: { ...s.entries, [entry.date]: entry },
    };
    if (entry.relapse) {
      next.lastRelapseDate = entry.date;
      next.currentPhase = 1;
    }
    next.currentPhase = computePhase(next);
    next.xp = s.xp + (entry.relapse ? 5 : 25);
    return next;
  });
}

export function addHabit(name: string, icon: string, category: Category = "personal") {
  setState((s) => ({
    ...s,
    habits: [
      ...s.habits,
      { id: crypto.randomUUID(), name, icon, category, createdAt: new Date().toISOString() },
    ],
  }));
}

export function removeHabit(id: string) {
  setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
}

export function completeOnboarding(data: OnboardingData, selectedHabits: Habit[]) {
  setState((s) => ({
    ...s,
    onboarded: true,
    profile: data,
    habits: selectedHabits.length ? selectedHabits : s.habits,
    xp: s.xp + 50,
  }));
}

export function toggleHabitToday(habitId: string) {
  const today = todayISO();
  setState((s) => {
    const existing = s.entries[today];
    const base: DailyEntry = existing ?? {
      date: today, mood: "normal", urge: 0, relapse: false, habitsCompleted: [],
    };
    const wasCompleted = base.habitsCompleted.includes(habitId);
    const completed = wasCompleted
      ? base.habitsCompleted.filter((id) => id !== habitId)
      : [...base.habitsCompleted, habitId];
    return {
      ...s,
      entries: { ...s.entries, [today]: { ...base, habitsCompleted: completed } },
      xp: s.xp + (wasCompleted ? 0 : 10),
    };
  });
}

export function resetCounter() {
  setState((s) => ({
    ...s,
    lastRelapseDate: todayISO(),
    currentPhase: 1,
  }));
}

export function resetAll() {
  setState(() => defaultState());
}

// --- Computations ---

export function daysSince(iso: string): number {
  const start = new Date(iso + "T00:00:00");
  const now = new Date(todayISO() + "T00:00:00");
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

export const PHASES = [
  { n: 1, name: "Revelación", days: 3, desc: "Ver la verdad. Reconocer el ciclo." },
  { n: 2, name: "Identidad", days: 7, desc: "Recordar quién eres realmente." },
  { n: 3, name: "Corte Radical", days: 14, desc: "Eliminar accesos, triggers y atajos." },
  { n: 4, name: "Reemplazo", days: 30, desc: "Sustituir el viejo patrón con nuevos hábitos." },
  { n: 5, name: "Disciplina", days: 60, desc: "La mente recupera el control." },
  { n: 6, name: "Control Mental", days: 90, desc: "Dominas tus pensamientos, no te dominan." },
  { n: 7, name: "Propósito", days: 180, desc: "Vives para algo más grande. Libertad." },
];

export function computePhase(s: AppState): number {
  const d = daysSince(s.lastRelapseDate);
  let phase = 1;
  for (const p of PHASES) {
    if (d >= p.days) phase = Math.min(7, p.n + 1);
  }
  return phase;
}

export function phaseProgress(s: AppState): { current: typeof PHASES[number]; next?: typeof PHASES[number]; pct: number; days: number } {
  const days = daysSince(s.lastRelapseDate);
  const phase = computePhase(s);
  const current = PHASES[phase - 1];
  const next = PHASES[phase] ?? undefined;
  const prevDays = phase === 1 ? 0 : PHASES[phase - 2].days;
  const targetDays = next ? next.days : current.days;
  const span = Math.max(1, targetDays - prevDays);
  const pct = Math.min(100, Math.max(0, ((days - prevDays) / span) * 100));
  return { current, next, pct, days };
}

export function habitStreak(s: AppState, habitId: string): number {
  let streak = 0;
  const cur = new Date(todayISO() + "T00:00:00");
  while (true) {
    const key = cur.toISOString().slice(0, 10);
    const e = s.entries[key];
    if (e && e.habitsCompleted.includes(habitId)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function todayKey() {
  return todayISO();
}

export function bestStreak(s: AppState): number {
  const dates = Object.keys(s.entries).sort();
  if (dates.length === 0) return daysSince(s.lastRelapseDate);
  let best = 0;
  let run = 0;
  // simplest: best = max gap between relapses including current streak
  const relapses = dates.filter((d) => s.entries[d].relapse).sort();
  const currentStreak = daysSince(s.lastRelapseDate);
  if (relapses.length === 0) return currentStreak;
  // compute gaps between consecutive relapses
  let prev = new Date(s.startDate + "T00:00:00").getTime();
  for (const r of relapses) {
    const t = new Date(r + "T00:00:00").getTime();
    const gap = Math.floor((t - prev) / 86400000);
    if (gap > best) best = gap;
    prev = t;
  }
  best = Math.max(best, currentStreak, run);
  return best;
}

export function totalRelapses(s: AppState): number {
  return Object.values(s.entries).filter((e) => e.relapse).length;
}
