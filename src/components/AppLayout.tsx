import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, CheckSquare, Flame, Map, Shield } from "lucide-react";

const NAV = [
  { to: "/", label: "Centro", icon: LayoutDashboard },
  { to: "/checkin", label: "Check-in", icon: CheckSquare },
  { to: "/habitos", label: "Hábitos", icon: Flame },
  { to: "/fases", label: "Fases", icon: Map },
];

export function AppLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/70 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-md bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">Protocolo</div>
              <div className="text-sm font-bold tracking-tight">LIBERTAD</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = loc.pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-foreground border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-sm">
        <div className="grid grid-cols-4">
          {NAV.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center gap-1 py-3 text-[10px] uppercase tracking-wider font-mono ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
