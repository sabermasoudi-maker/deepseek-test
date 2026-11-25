export function Card({ children, className = '', style }) {
  return (
    <div className={`glass rounded-2xl p-4 md:p-5 ${className}`} style={style}>
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-ink-200 md:text-xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-ink-700/60 text-ink-300',
    gain: 'bg-gain-dim/80 text-gain',
    loss: 'bg-loss-dim/80 text-loss',
    warn: 'bg-warn-dim/70 text-warn',
    accent: 'bg-accent-dim/70 text-accent',
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function ScoreBar({ value, max = 25, color = '#14b8a6' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="score-bar" title={`${value}/${max}`}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function FileButton({ id, label, onFile, accept = '.xlsx,.xls,.csv,.json' }) {
  return (
    <label
      htmlFor={id}
      className="cursor-pointer rounded-xl border border-accent/30 bg-accent-dim/40 px-3 py-2 text-sm font-medium text-accent transition hover:border-accent/60 hover:bg-accent-dim/70"
    >
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </label>
  )
}

export function GhostButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border border-ink-600/80 bg-ink-800/50 px-3 py-2 text-sm text-ink-300 transition hover:border-ink-400/40 hover:text-ink-200 ${className}`}
    >
      {children}
    </button>
  )
}

export function EmptyHint({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-600/60 bg-ink-900/40 px-4 py-8 text-center text-sm text-ink-400">
      {children}
    </div>
  )
}
