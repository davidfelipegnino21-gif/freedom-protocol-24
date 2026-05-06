import { useEffect, useState, useSyncExternalStore } from "react";

export type Mood = "fuerte" | "estable" | "tentado" | "debil";

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Mood;
  urge: number; // 0-10
  relapse: boolean;
  habitsCompleted: string[]; // habit ids
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
}

export interface AppState {
  startDate: string; // ISO date when user began
  lastRelapseDate: string; // ISO date of last reset
  currentPhase: number; // 1-7
  habits: Habit[];
  entries: Record<string, DailyEntry>; // by date
}

const STORAGE_KEY = "protocolo-libertad-v1";

const DEFAULT_HABITS: Habit[] = [
  { id: "ejercicio", name: "Ejercicio físico", icon: "💪", createdAt: new Date().toISOString() },
  { id: "lectura", name: "Lectura 20 min", icon: "📖", createdAt: new Date().toISOString() },
  { id: "meditacion", name: "Meditación / oración", icon: "🧘", createdAt: new Date().toISOString() },
  { id: "agua", name: "Agua fría / ducha", icon: "🚿", createdAt: new Date().toISOString() },
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
    return next;
  });
}

export function addHabit(name: string, icon: string) {
  setState((s) => ({
    ...s,
    habits: [
      ...s.habits,
      { id: crypto.randomUUID(), name, icon, createdAt: new Date().toISOString() },
    ],
  }));
}

export function removeHabit(id: string) {
  setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
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
  { n: 1, name: "Despertar", days: 3, desc: "Reconocer el ciclo. Cortar el patrón." },
  { n: 2, name: "Desintoxicación", days: 7, desc: "Resistir la tormenta inicial." },
  { n: 3, name: "Reconstrucción", days: 14, desc: "Crear nuevos hábitos diarios." },
  { n: 4, name: "Disciplina", days: 30, desc: "La mente recupera el control." },
  { n: 5, name: "Claridad", days: 60, desc: "Energía y enfoque renovados." },
  { n: 6, name: "Propósito", days: 90, desc: "Construir tu nueva identidad." },
  { n: 7, name: "Libertad", days: 180, desc: "Dueño de ti mismo." },
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
