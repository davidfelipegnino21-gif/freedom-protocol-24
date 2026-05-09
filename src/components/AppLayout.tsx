import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Home, ClipboardList, Dumbbell, User, Plus, X } from "lucide-react";
import { useAppState, useHydrated } from "@/lib/store";
import { Onboarding } from "./Onboarding";

const NAV = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/hoy", label: "Hoy", icon: ClipboardList },
  { to: "/entrena", label: "Entrena", icon: Dumbbell },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

const RADIAL = [
  { to: "/metas", label: "Metas", emoji: "🎯", color: "#DC2626" },
  { to: "/habitos", label: "Hábitos", emoji: "💪", color: "#16A34A" },
  { to: "/tareas", label: "Tareas", emoji: "📌", color: "#3B82F6" },
  { to: "/finanzas", label: "Finanzas", emoji: "💰", color: "#D4AF37" },
  { to: "/devocional", label: "Devocional", emoji: "🙏", color: "#D4AF37" },
  { to: "/ajustes", label: "Ajustes", emoji: "⚙️", color: "#6B7280" },
];

// Posiciones hexagonales perfectas — radio 105px
const POSITIONS = [
  { x: 0,    y: -105 }, // top
  { x: 91,   y: -52  }, // top-right
  { x: 91,   y: 52   }, // bottom-right
  { x: 0,    y: 105  }, // bottom
  { x: -91,  y: 52   }, // bottom-left
  { x: -91,  y: -52  }, // top-left
];

export function AppLayout() {
  const loc = useLocation();
  const s = useAppState();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>

      {hydrated && !s.onboarded && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--bg-base)" }}>
          <Onboarding />
        </div>
      )}

      <main className="flex-1 w-full mx-auto pb-24 max-w-md">
        <Outlet />
      </main>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menú radial */}
      {open && (
        <div className="fixed z-40" style={{
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
        }}>
          {RADIAL.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                left: POSITIONS[i].x - 32,
                top: POSITIONS[i].y - 32,
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#111",
                border: `2px solid ${item.color}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxShadow: `0 0 16px ${item.color}55`,
                animation: `radialPop 0.25s ease ${i * 0.04}s both`,
              }}
            >
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: item.color,
                letterSpacing: "0.5px",
                marginTop: 2,
              }}>{item.label}</span>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @keyframes radialPop {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom" style={{
        background: "rgba(7,7,7,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-soft)",
      }}>
        <div className="flex items-center max-w-md mx-auto h-16">

          {/* Inicio y Hoy */}
          {NAV.slice(0, 2).map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className="flex flex-col items-center justify-center gap-1 relative flex-1"
                style={{ color: active ? "var(--red)" : "var(--text-4)" }}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="font-display text-[10px] font-medium tracking-wide">{n.label}</span>
                {active && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: "var(--red)" }} />}
              </Link>
            );
          })}

          {/* Botón + central */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setOpen(!open)}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: open ? "#222" : "var(--red)",
                border: open ? "2px solid var(--red)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: open ? "none" : "0 0 24px rgba(220,38,38,0.5)",
                transition: "all 0.25s",
                transform: open ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              {open
                ? <X style={{ color: "var(--red)", width: 22, height: 22 }} />
                : <Plus style={{ color: "#fff", width: 24, height: 24 }} />
              }
            </button>
          </div>

          {/* Entrena y Perfil */}
          {NAV.slice(2).map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className="flex flex-col items-center justify-center gap-1 relative flex-1"
                style={{ color: active ? "var(--red)" : "var(--text-4)" }}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="font-display text-[10px] font-medium tracking-wide">{n.label}</span>
                {active && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: "var(--red)" }} />}
              </Link>
            );
          })}

        </div>
      </nav>
    </div>
  );
}
