import { AlertTriangle, Download, PieChart, ShieldAlert, Scale } from 'lucide-react'
import { PORTFOLIO_TEMPLATE_COLUMNS } from '../data/sampleData'
import { formatNumber, formatPct } from '../utils/format'
import { downloadTemplate } from '../utils/parsers'
import { Badge, Card, EmptyHint, FileButton, GhostButton, SectionTitle } from './ui'

const ALERT_META = {
  exit: {
    tone: 'loss',
    label: 'خروج اضطراری',
    icon: ShieldAlert,
    border: 'border-loss/40 bg-loss-dim/40',
  },
  hold: {
    tone: 'warn',
    label: 'نگهداری / سیو سود',
    icon: AlertTriangle,
    border: 'border-warn/40 bg-warn-dim/35',
  },
  rebalance: {
    tone: 'accent',
    label: 'سبدگردانی',
    icon: Scale,
    border: 'border-accent/35 bg-accent-dim/35',
  },
}

export function PortfolioSection({ portfolio, onImport }) {
  const { rows, totalValue, totalPnl, totalPnlPct, portfolioBeta, industryWeights, alerts } = portfolio

  return (
    <div className="fade-in space-y-5">
      <SectionTitle
        title="مدیریت پرتفوی هوشمند و سیستم هشدار"
        subtitle="سود/زیان باز، وزن‌ها، بتای سبد و هشدارهای سه‌رنگ ریسک"
        action={
          <div className="flex flex-wrap gap-2">
            <GhostButton
              onClick={() =>
                downloadTemplate(PORTFOLIO_TEMPLATE_COLUMNS, 'portfolio-template.xlsx', {
                  symbol: 'فولاد',
                  qty: 50000,
                  avgCost: 6200,
                })
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <Download size={14} /> قالب پرتفو
              </span>
            </GhostButton>
            <FileButton id="portfolio-import" label="بارگذاری پرتفو Excel" onFile={onImport} />
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-ink-400">ارزش روز سبد</p>
          <p className="num mt-2 text-xl font-bold text-ink-200">{formatNumber(Math.round(totalValue))}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-400">سود/زیان باز</p>
          <p className={`num mt-2 text-xl font-bold ${totalPnl >= 0 ? 'text-gain' : 'text-loss'}`}>
            {formatNumber(Math.round(totalPnl))}
          </p>
          <p className={`text-sm ${totalPnlPct >= 0 ? 'text-gain' : 'text-loss'}`}>{formatPct(totalPnlPct)}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-400">بتای پرتفو</p>
          <p className="num mt-2 text-xl font-bold text-accent">{formatNumber(portfolioBeta, 2)}</p>
          <p className="text-xs text-ink-400">ریسک سیستماتیک نسبی</p>
        </Card>
        <Card>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-ink-400">
            <PieChart size={14} /> تمرکز صنعتی
          </p>
          <div className="space-y-1.5">
            {Object.entries(industryWeights)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([ind, w]) => (
                <div key={ind} className="flex items-center justify-between text-xs">
                  <span className="text-ink-300">{ind}</span>
                  <span className={`num ${w >= 35 ? 'text-warn' : 'text-ink-200'}`}>{formatNumber(w, 1)}٪</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <Card className="!p-0">
        <div className="border-b border-ink-700/50 px-4 py-3 font-semibold text-ink-200">دارایی‌های پرتفو</div>
        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyHint>پرتفویی بارگذاری نشده است.</EmptyHint>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-ink-850/80 text-xs text-ink-400">
                <tr>
                  <th className="px-3 py-3 font-medium">نماد</th>
                  <th className="px-3 py-3 font-medium">تعداد</th>
                  <th className="px-3 py-3 font-medium">میانگین خرید</th>
                  <th className="px-3 py-3 font-medium">قیمت روز</th>
                  <th className="px-3 py-3 font-medium">ارزش روز</th>
                  <th className="px-3 py-3 font-medium">سود/زیان</th>
                  <th className="px-3 py-3 font-medium">وزن</th>
                  <th className="px-3 py-3 font-medium">بتا</th>
                  <th className="px-3 py-3 font-medium">صنعت</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.symbol} className="border-t border-ink-700/40 hover:bg-ink-800/40">
                    <td className="px-3 py-2.5 font-semibold text-ink-200">{r.symbol}</td>
                    <td className="num px-3 py-2.5">{formatNumber(r.qty)}</td>
                    <td className="num px-3 py-2.5">{formatNumber(r.avgCost)}</td>
                    <td className="num px-3 py-2.5">{formatNumber(r.price)}</td>
                    <td className="num px-3 py-2.5">{formatNumber(Math.round(r.marketValue))}</td>
                    <td className={`num px-3 py-2.5 ${r.pnl >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {formatNumber(Math.round(r.pnl))}
                      <div className="text-xs">{formatPct(r.pnlPct)}</div>
                    </td>
                    <td className="num px-3 py-2.5">{formatNumber(r.weight, 1)}٪</td>
                    <td className="num px-3 py-2.5">{formatNumber(r.beta, 2)}</td>
                    <td className="px-3 py-2.5 text-ink-300">{r.industry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold text-ink-200">Risk Alerts — هشدارهای خودکار</h3>
        {alerts.length === 0 ? (
          <EmptyHint>در حال حاضر هشدار فعالی وجود ندارد.</EmptyHint>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((a, i) => {
              const meta = ALERT_META[a.level]
              const Icon = meta.icon
              return (
                <div key={`${a.symbol}-${i}`} className={`rounded-xl border p-3 ${meta.border}`}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <Icon size={16} className="opacity-80" />
                  </div>
                  <p className="font-semibold text-ink-200">{a.symbol}</p>
                  <p className="mt-1 text-sm text-ink-300">{a.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">{a.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
