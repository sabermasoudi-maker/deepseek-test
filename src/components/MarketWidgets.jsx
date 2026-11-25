import { Activity, ArrowDownRight, ArrowUpRight, Landmark, Waves } from 'lucide-react'
import { formatCompact, formatNumber, formatPct } from '../utils/format'
import { Card } from './ui'

export function MarketWidgets({ overview }) {
  const items = [
    {
      key: 'index',
      label: 'شاخص کل',
      value: formatNumber(overview.index),
      sub: formatPct(overview.indexChangePct),
      positive: overview.indexChangePct >= 0,
      icon: Landmark,
    },
    {
      key: 'retail',
      label: 'ارزش معاملات خرد',
      value: `${formatNumber(overview.retailValueBn)} میلیارد`,
      sub: 'ریال',
      icon: Activity,
    },
    {
      key: 'smart',
      label: 'وضعیت پول هوشمند',
      value: `${formatNumber(Math.abs(overview.smartMoneyBn))} میلیارد`,
      sub: overview.smartMoneyDir === 'in' ? 'ورود خالص' : 'خروج خالص',
      positive: overview.smartMoneyDir === 'in',
      icon: Waves,
    },
    {
      key: 'breadth',
      label: 'عرضه بازار',
      value: `${formatNumber(overview.advancers)}↑ / ${formatNumber(overview.decliners)}↓`,
      sub: `${formatNumber(overview.unchanged)} بدون تغییر`,
      icon: overview.advancers >= overview.decliners ? ArrowUpRight : ArrowDownRight,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <Card
            key={item.key}
            className="slide-up relative overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-ink-400">{item.label}</p>
                <p className="num mt-2 text-xl font-semibold tracking-tight text-ink-200 md:text-2xl">
                  {item.value}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    item.positive === true
                      ? 'text-gain'
                      : item.positive === false
                        ? 'text-loss'
                        : 'text-ink-400'
                  }`}
                >
                  {item.sub}
                </p>
              </div>
              <div className="rounded-xl bg-ink-800/80 p-2.5 text-accent">
                <Icon size={18} />
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
          </Card>
        )
      })}
    </div>
  )
}

export function LiveStamp({ updatedAt }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-400">
      <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-gain" />
      <span>نمونه زنده · به‌روزرسانی: {updatedAt}</span>
      <span className="hidden sm:inline">· حجم‌ها: {formatCompact(1e9)}</span>
    </div>
  )
}
