import { Download, Search, Trophy } from 'lucide-react'
import { INDUSTRIES, STOCK_TEMPLATE_COLUMNS } from '../data/sampleData'
import { formatNumber, formatPct } from '../utils/format'
import { downloadTemplate } from '../utils/parsers'
import { Badge, Card, EmptyHint, FileButton, GhostButton, ScoreBar, SectionTitle } from './ui'

export function ScannerSection({
  ranked,
  top10,
  query,
  setQuery,
  industry,
  setIndustry,
  onImport,
}) {
  return (
    <div className="fade-in space-y-5">
      <SectionTitle
        title="اسکن، تحلیل چندبعدی و رتبه‌بندی نمادها"
        subtitle="امتیازدهی ۱۰۰‌امتیازی بر اساس فاندامنتال، پول هوشمند، تکنیکال و حمایت/مقاومت"
        action={
          <div className="flex flex-wrap gap-2">
            <GhostButton
              onClick={() =>
                downloadTemplate(
                  STOCK_TEMPLATE_COLUMNS,
                  'tse-stocks-template.xlsx',
                  {
                    symbol: 'فولاد',
                    name: 'فولاد مبارکه',
                    industry: 'فلزات',
                    price: 6850,
                    changePct: 1.4,
                    volume: 185000000,
                    baseVolume: 42000000,
                    pe: 6.8,
                    ps: 1.1,
                    profitMargin: 22,
                    earningsCoverage: 1.35,
                    costTrend: 'improving',
                    seasonalProfit: 'up',
                    realToLegalPower: 1.85,
                    smartMoneyFlow: 85,
                    buyPerCapita: 42,
                    sellPerCapita: 18,
                    trend: 'up',
                    rsi: 58,
                    macd: 'bullish',
                    vsMA: 'above',
                    s1: 6600,
                    s2: 6400,
                    s3: 6100,
                    r1: 7100,
                    r2: 7400,
                    r3: 7800,
                    beta: 1.15,
                  },
                )
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <Download size={14} /> قالب Excel
              </span>
            </GhostButton>
            <FileButton id="stock-import" label="ایمپورت Excel/CSV/JSON" onFile={onImport} />
          </div>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی سریع نماد یا نام شرکت..."
            className="w-full rounded-xl border border-ink-600/70 bg-ink-900/70 py-2.5 pr-10 pl-3 text-sm text-ink-200 outline-none ring-accent/40 placeholder:text-ink-400 focus:ring-2"
          />
        </div>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="rounded-xl border border-ink-600/70 bg-ink-900/70 px-3 py-2.5 text-sm text-ink-200 outline-none ring-accent/40 focus:ring-2"
        >
          <option value="">همه صنایع</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      <Card className="slide-up overflow-hidden !p-0">
        <div className="flex items-center gap-2 border-b border-ink-700/50 px-4 py-3">
          <Trophy size={16} className="text-warn" />
          <h3 className="font-semibold text-ink-200">ده نماد برتر برای خرید</h3>
          <Badge tone="warn">Top 10</Badge>
        </div>
        {top10.length === 0 ? (
          <div className="p-4">
            <EmptyHint>پس از فیلتر، نامزدی با امتیاز کافی یافت نشد.</EmptyHint>
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
            {top10.map((s, i) => (
              <div
                key={s.symbol}
                className="rounded-xl border border-ink-600/40 bg-ink-900/50 p-3 transition hover:border-accent/35"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-400">#{i + 1}</span>
                  <Badge tone={s.changePct >= 0 ? 'gain' : 'loss'}>{formatPct(s.changePct)}</Badge>
                </div>
                <p className="mt-1 text-base font-bold text-ink-200">{s.symbol}</p>
                <p className="truncate text-xs text-ink-400">{s.name}</p>
                <p className="num mt-2 text-lg font-semibold text-accent">{formatNumber(s.scores.total)}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-300">
                  <span className="text-gain">بنیادی:</span> {s.reasons.fundamental.slice(0, 2).join('، ')}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-300">
                  <span className="text-warn">تکنیکال:</span> {s.reasons.technical.slice(0, 2).join('، ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="!p-0">
        <div className="border-b border-ink-700/50 px-4 py-3 text-sm text-ink-300">
          جدول امتیازدهی کامل · {formatNumber(ranked.length)} نماد
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[1100px] text-right text-sm">
            <thead className="bg-ink-850/80 text-xs text-ink-400">
              <tr>
                <th className="px-3 py-3 font-medium">رتبه</th>
                <th className="px-3 py-3 font-medium">نماد</th>
                <th className="px-3 py-3 font-medium">صنعت</th>
                <th className="px-3 py-3 font-medium">قیمت</th>
                <th className="px-3 py-3 font-medium">کل /۱۰۰</th>
                <th className="px-3 py-3 font-medium">فاندامنتال</th>
                <th className="px-3 py-3 font-medium">پول هوشمند</th>
                <th className="px-3 py-3 font-medium">تکنیکال</th>
                <th className="px-3 py-3 font-medium">حمایت/مقاومت</th>
                <th className="px-3 py-3 font-medium">R/R</th>
                <th className="px-3 py-3 font-medium">S1 / R1</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, idx) => (
                <tr key={s.symbol} className="border-t border-ink-700/40 hover:bg-ink-800/40">
                  <td className="num px-3 py-2.5 text-ink-400">{idx + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-ink-200">{s.symbol}</div>
                    <div className="text-[11px] text-ink-400">{s.name}</div>
                  </td>
                  <td className="px-3 py-2.5 text-ink-300">{s.industry}</td>
                  <td className="num px-3 py-2.5">
                    {formatNumber(s.price)}
                    <div className={s.changePct >= 0 ? 'text-gain text-xs' : 'text-loss text-xs'}>
                      {formatPct(s.changePct)}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="num font-bold text-accent">{formatNumber(s.scores.total, 1)}</div>
                    <ScoreBar value={s.scores.total} max={100} color="#14b8a6" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="num text-xs">{formatNumber(s.scores.fundamental, 1)}</div>
                    <ScoreBar value={s.scores.fundamental} color="#34d399" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="num text-xs">{formatNumber(s.scores.smartMoney, 1)}</div>
                    <ScoreBar value={s.scores.smartMoney} color="#fbbf24" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="num text-xs">{formatNumber(s.scores.technical, 1)}</div>
                    <ScoreBar value={s.scores.technical} color="#2dd4bf" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="num text-xs">{formatNumber(s.scores.supportResistance, 1)}</div>
                    <ScoreBar value={s.scores.supportResistance} color="#60a5fa" />
                  </td>
                  <td className="num px-3 py-2.5 font-medium text-ink-200">{formatNumber(s.riskReward, 2)}</td>
                  <td className="num px-3 py-2.5 text-xs text-ink-300">
                    {formatNumber(s.s1)} / {formatNumber(s.r1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
