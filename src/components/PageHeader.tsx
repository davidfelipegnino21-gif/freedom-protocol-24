export function PageHeader({ kicker, title, subtitle, right }: { kicker?: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-5">
      <div>
        {kicker && (
          <div className="text-[10px] font-display uppercase tracking-widest mb-1" style={{ color: "var(--text-4)" }}>
            {kicker}
          </div>
        )}
        <h1 className="font-display font-extrabold text-2xl text-1 leading-tight">{title}</h1>
        {subtitle && <p className="text-3 text-sm mt-1">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div
      className="rounded-2xl p-8 text-center mt-6"
      style={{ background: "var(--bg-card)", border: "1px dashed var(--border-soft)" }}
    >
      <div className="text-4xl mb-3">⚒️</div>
      <h3 className="font-display font-bold text-1 text-base">{title}</h3>
      <p className="text-3 text-xs mt-2 max-w-xs mx-auto">
        Próxima entrega — esta sección se desbloquea en la siguiente fase del build.
      </p>
    </div>
  );
}