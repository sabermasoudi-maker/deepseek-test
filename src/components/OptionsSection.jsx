import { formatNumber, formatPct } from '../utils/format'
import { Badge, Card, SectionTitle } from './ui'

const STRATEGY_TONE = {
  leveraged: 'warn',
  hedge: 'accent',
  directional: 'gain',
  caution: 'loss',
}

export function OptionsSection({ options }) {
  return (
    <div className="fade-in space-y-5">
      <SectionTitle
        title="بازار مشتقه سهام — اختیار معامله"
        subtitle="ارزش ذاتی/زمانی، اهرم، Open Interest و پیشنهاد استراتژی بر اساس IV"
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-xs text-ink-400">تعداد قراردادها</p>
          <p className="num mt-2 text-2xl font-bold text-ink-200">{formatNumber(options.length)}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-400">میانگین اهرم</p>
          <p className="num mt-2 text-2xl font-bold text-warn">
            {formatNumber(
              options.reduce((a, o) => a + o.leverage, 0) / Math.max(options.length, 1),
              1,
            )}
            ×
          </p>
        </Card>
        <Card>
          <p className="text-xs text-ink-400">قراردادهای با IV بالا (&gt;۴۰٪)</p>
          <p className="num mt-2 text-2xl font-bold text-accent">
            {formatNumber(options.filter((o) => o.iv >= 0.4).length)}
          </p>
        </Card>
      </div>

      <Card className="!p-0">
        <div className="table-scroll">
          <table className="w-full min-w-[1150px] text-right text-sm">
            <thead className="bg-ink-850/80 text-xs text-ink-400">
              <tr>
                <th className="px-3 py-3 font-medium">نماد اختیار</th>
                <th className="px-3 py-3 font-medium">پایه</th>
                <th className="px-3 py-3 font-medium">نوع</th>
                <th className="px-3 py-3 font-medium">اعمال</th>
                <th className="px-3 py-3 font-medium">پرمیوم</th>
                <th className="px-3 py-3 font-medium">ذاتی</th>
                <th className="px-3 py-3 font-medium">زمانی</th>
                <th className="px-3 py-3 font-medium">اهرم</th>
                <th className="px-3 py-3 font-medium">IV</th>
                <th className="px-3 py-3 font-medium">OI / حجم</th>
                <th className="px-3 py-3 font-medium">استراتژی</th>
              </tr>
            </thead>
            <tbody>
              {options.map((o) => (
                <tr key={o.symbol} className="border-t border-ink-700/40 hover:bg-ink-800/40">
                  <td className="px-3 py-2.5 font-semibold text-ink-200">{o.symbol}</td>
                  <td className="px-3 py-2.5">{o.underlying}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={o.type === 'call' ? 'gain' : 'loss'}>
                      {o.type === 'call' ? 'Call خرید' : 'Put فروش'}
                    </Badge>
                  </td>
                  <td className="num px-3 py-2.5">{formatNumber(o.strike)}</td>
                  <td className="num px-3 py-2.5">{formatNumber(o.premium)}</td>
                  <td className="num px-3 py-2.5 text-gain">{formatNumber(o.intrinsic)}</td>
                  <td className="num px-3 py-2.5 text-warn">{formatNumber(o.timeValue)}</td>
                  <td className="num px-3 py-2.5 font-semibold text-accent">{formatNumber(o.leverage, 1)}×</td>
                  <td className="num px-3 py-2.5">{formatPct(o.iv * 100, 0)}</td>
                  <td className="px-3 py-2.5">
                    <div className="num text-xs">
                      {formatNumber(o.openInterest)} / {formatNumber(o.volume)}
                    </div>
                    <div className="text-[11px] text-ink-400">{o.professionalFlow}</div>
                  </td>
                  <td className="px-3 py-2.5 max-w-[220px]">
                    <Badge tone={STRATEGY_TONE[o.strategy.kind] || 'neutral'}>{o.strategy.name}</Badge>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-400">{o.strategy.note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold text-ink-200">راهنمای سریع استراتژی</h3>
        <ul className="grid gap-2 text-sm text-ink-300 md:grid-cols-2">
          <li className="rounded-lg bg-ink-900/50 px-3 py-2">IV بالا + Put → پوشش ریسک پرتفو (Protective Put)</li>
          <li className="rounded-lg bg-ink-900/50 px-3 py-2">Call ITM با ارزش ذاتی غالب → جهت‌گیری با دلتای بالا</li>
          <li className="rounded-lg bg-ink-900/50 px-3 py-2">OI و حجم همزمان بالا → احتمال ورود بازارگردان/حرفه‌ای</li>
          <li className="rounded-lg bg-ink-900/50 px-3 py-2">سررسید نزدیک + ارزش زمانی بالا → احتیاط از Theta Decay</li>
        </ul>
      </Card>
    </div>
  )
}
