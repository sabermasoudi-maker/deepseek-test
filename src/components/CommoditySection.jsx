import { formatNumber, formatPct } from '../utils/format'
import { Badge, Card, SectionTitle } from './ui'

export function CommoditySection({ certificates, derivatives, arbitrage }) {
  return (
    <div className="fade-in space-y-5">
      <SectionTitle
        title="بورس کالا — گواهی سپرده و مشتقه کالا"
        subtitle="حباب قیمتی، آربیتراژ، اهرم و موقعیت‌های باز قراردادها"
      />

      {arbitrage.length > 0 && (
        <Card className="border-warn/25">
          <h3 className="mb-3 font-semibold text-warn">سیگنال‌های آربیتراژ</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {arbitrage.map((c) => (
              <div key={c.symbol} className="rounded-xl border border-ink-600/50 bg-ink-900/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-200">{c.symbol}</span>
                  <Badge tone={c.signalLevel === 'buy' ? 'gain' : c.signalLevel === 'sell' ? 'loss' : 'neutral'}>
                    حباب {formatPct(c.bubble)}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-300">{c.signal}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="!p-0">
        <div className="border-b border-ink-700/50 px-4 py-3 font-semibold text-ink-200">
          الف) گواهی سپرده کالایی
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="bg-ink-850/80 text-xs text-ink-400">
              <tr>
                <th className="px-3 py-3 font-medium">نماد</th>
                <th className="px-3 py-3 font-medium">کالا</th>
                <th className="px-3 py-3 font-medium">حجم</th>
                <th className="px-3 py-3 font-medium">قیمت پایانی</th>
                <th className="px-3 py-3 font-medium">بازار فیزیکی</th>
                <th className="px-3 py-3 font-medium">حباب (مثبت=گران‌تر از فیزیکی)</th>
                <th className="px-3 py-3 font-medium">سیگنال</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.symbol} className="border-t border-ink-700/40 hover:bg-ink-800/40">
                  <td className="px-3 py-2.5 font-semibold text-ink-200">{c.symbol}</td>
                  <td className="px-3 py-2.5">{c.commodity}</td>
                  <td className="num px-3 py-2.5">{formatNumber(c.volume)}</td>
                  <td className="num px-3 py-2.5">
                    {formatNumber(c.close)}
                    <div className="text-[11px] text-ink-400">{c.unit}</div>
                  </td>
                  <td className="num px-3 py-2.5">{formatNumber(c.physicalPrice)}</td>
                  <td className={`num px-3 py-2.5 font-semibold ${c.bubble >= 0 ? 'text-loss' : 'text-gain'}`}>
                    {formatPct(c.bubble)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-300 max-w-[260px]">{c.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="!p-0">
        <div className="border-b border-ink-700/50 px-4 py-3 font-semibold text-ink-200">
          ب) قراردادهای مشتقه بورس کالا (آتی و اختیار)
        </div>
        <div className="table-scroll">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead className="bg-ink-850/80 text-xs text-ink-400">
              <tr>
                <th className="px-3 py-3 font-medium">نماد</th>
                <th className="px-3 py-3 font-medium">نوع</th>
                <th className="px-3 py-3 font-medium">پایه</th>
                <th className="px-3 py-3 font-medium">قیمت / پرمیوم</th>
                <th className="px-3 py-3 font-medium">نقد/اسپات</th>
                <th className="px-3 py-3 font-medium">بیسیس</th>
                <th className="px-3 py-3 font-medium">اهرم</th>
                <th className="px-3 py-3 font-medium">سررسید (روز)</th>
                <th className="px-3 py-3 font-medium">OI / حجم</th>
                <th className="px-3 py-3 font-medium">تحلیل</th>
              </tr>
            </thead>
            <tbody>
              {derivatives.map((d) => (
                <tr key={d.symbol} className="border-t border-ink-700/40 hover:bg-ink-800/40">
                  <td className="px-3 py-2.5 font-semibold text-ink-200">{d.symbol}</td>
                  <td className="px-3 py-2.5">
                    <Badge
                      tone={
                        d.type === 'future' ? 'accent' : d.type === 'call' ? 'gain' : 'loss'
                      }
                    >
                      {d.type === 'future' ? 'آتی' : d.type === 'call' ? 'Call' : 'Put'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">{d.underlying}</td>
                  <td className="num px-3 py-2.5">{formatNumber(d.premium ?? d.price)}</td>
                  <td className="num px-3 py-2.5">{formatNumber(d.spot)}</td>
                  <td className="num px-3 py-2.5">
                    {d.basis == null ? '—' : formatPct(d.basis)}
                  </td>
                  <td className="num px-3 py-2.5 text-warn">{formatNumber(d.leverage)}×</td>
                  <td className="num px-3 py-2.5">{formatNumber(d.daysToExpiry)}</td>
                  <td className="num px-3 py-2.5 text-xs">
                    {formatNumber(d.openInterest)} / {formatNumber(d.volume)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-300">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
