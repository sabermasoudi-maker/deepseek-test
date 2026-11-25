import { useMemo, useState } from 'react'
import {
  BarChart3,
  Briefcase,
  CandlestickChart,
  HelpCircle,
  LayoutDashboard,
  Package,
} from 'lucide-react'
import { CommoditySection } from './components/CommoditySection'
import { LiveStamp, MarketWidgets } from './components/MarketWidgets'
import { OptionsSection } from './components/OptionsSection'
import { PortfolioSection } from './components/PortfolioSection'
import { ScannerSection } from './components/ScannerSection'
import { Card } from './components/ui'
import {
  marketOverview,
  sampleCertificates,
  sampleCommodityDerivatives,
  sampleOptions,
  samplePortfolio,
  sampleStocks,
} from './data/sampleData'
import {
  analyzeCertificate,
  analyzeCommodityDerivative,
  getArbitrageSignals,
} from './utils/commodity'
import { analyzeOptions } from './utils/options'
import { parsePortfolioFile, parseStockFile } from './utils/parsers'
import { enrichPortfolio } from './utils/portfolio'
import { getTopBuyCandidates, rankStocks } from './utils/scoring'

const NAV = [
  { id: 'scanner', label: 'دیده‌بان و Top 10', icon: CandlestickChart },
  { id: 'portfolio', label: 'تحلیل پرتفو', icon: Briefcase },
  { id: 'options', label: 'مشتقه سهام', icon: BarChart3 },
  { id: 'commodity', label: 'بورس کالا', icon: Package },
  { id: 'guide', label: 'راهنما', icon: HelpCircle },
]

export default function App() {
  const [tab, setTab] = useState('scanner')
  const [stocks, setStocks] = useState(sampleStocks)
  const [holdings, setHoldings] = useState(samplePortfolio)
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('')
  const [toast, setToast] = useState('')

  const ranked = useMemo(() => {
    const q = query.trim()
    const filtered = stocks.filter((s) => {
      const matchQ =
        !q ||
        s.symbol.includes(q) ||
        s.name.includes(q)
      const matchInd = !industry || s.industry === industry
      return matchQ && matchInd
    })
    return rankStocks(filtered)
  }, [stocks, query, industry])

  const top10 = useMemo(() => getTopBuyCandidates(ranked, 10), [ranked])

  const stocksBySymbol = useMemo(() => {
    const map = {}
    for (const s of stocks) map[s.symbol] = s
    return map
  }, [stocks])

  const portfolio = useMemo(
    () => enrichPortfolio(holdings, stocksBySymbol),
    [holdings, stocksBySymbol],
  )

  const options = useMemo(() => analyzeOptions(sampleOptions), [])
  const certificates = useMemo(
    () => sampleCertificates.map(analyzeCertificate),
    [],
  )
  const derivatives = useMemo(
    () => sampleCommodityDerivatives.map(analyzeCommodityDerivative),
    [],
  )
  const arbitrage = useMemo(() => getArbitrageSignals(sampleCertificates), [])

  async function handleStockImport(file) {
    try {
      const rows = await parseStockFile(file)
      if (!rows.length) throw new Error('ردیفی یافت نشد')
      setStocks(rows)
      showToast(`${rows.length} نماد از فایل بارگذاری شد`)
    } catch (err) {
      showToast(`خطا در ایمپورت: ${err.message || 'ناموفق'}`)
    }
  }

  async function handlePortfolioImport(file) {
    try {
      const rows = await parsePortfolioFile(file)
      if (!rows.length) throw new Error('ردیفی یافت نشد')
      setHoldings(rows)
      showToast(`${rows.length} موقعیت پرتفو بارگذاری شد`)
    } catch (err) {
      showToast(`خطا در ایمپورت پرتفو: ${err.message || 'ناموفق'}`)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-3 pb-10 pt-4 md:px-6 md:pt-6">
      <header className="glass-strong slide-up mb-5 rounded-2xl px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-warn/20 text-accent">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-ink-200 md:text-2xl">
                بازارلَب
              </h1>
              <p className="text-xs text-ink-400 md:text-sm">
                داشبورد تحلیلی بورس تهران و بورس کالا
              </p>
            </div>
          </div>
          <LiveStamp updatedAt={marketOverview.updatedAt} />
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                    : 'bg-ink-900/40 text-ink-400 hover:bg-ink-800/60 hover:text-ink-200'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </header>

      <div className="mb-5">
        <MarketWidgets overview={marketOverview} />
      </div>

      {tab === 'scanner' && (
        <ScannerSection
          ranked={ranked}
          top10={top10}
          query={query}
          setQuery={setQuery}
          industry={industry}
          setIndustry={setIndustry}
          onImport={handleStockImport}
        />
      )}
      {tab === 'portfolio' && (
        <PortfolioSection portfolio={portfolio} onImport={handlePortfolioImport} />
      )}
      {tab === 'options' && <OptionsSection options={options} />}
      {tab === 'commodity' && (
        <CommoditySection
          certificates={certificates}
          derivatives={derivatives}
          arbitrage={arbitrage}
        />
      )}
      {tab === 'guide' && <GuideSection />}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-accent/40 bg-ink-850 px-4 py-2.5 text-sm text-ink-200 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}

function GuideSection() {
  return (
    <div className="fade-in space-y-4">
      <Card>
        <h2 className="text-lg font-bold text-ink-200">راهنمای استفاده و ایمپورت داده</h2>
        <p className="mt-2 text-sm leading-7 text-ink-300">
          این داشبورد با دادهٔ نمونه اجرا می‌شود. برای داده واقعی، از دکمه‌های «ایمپورت» در بخش دیده‌بان و پرتفو
          فایل Excel، CSV یا JSON بارگذاری کنید. ستون‌ها می‌توانند فارسی یا انگلیسی باشند.
        </p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-accent">۱) فایل نمادهای بازار نقدی</h3>
          <p className="mt-2 text-sm text-ink-300">ستون‌های کلیدی:</p>
          <ul className="mt-2 list-disc pr-5 text-xs leading-6 text-ink-400">
            <li>نماد، نام، صنعت، قیمت، درصد تغییر، حجم، حجم مبنا</li>
            <li>pe, ps, حاشیه سود، پوشش سود، بهای تمام‌شده، سود فصلی</li>
            <li>قدرت حقیقی، پول هوشمند، سرانه خرید/فروش</li>
            <li>روند، rsi، macd، vsMA، s1–s3، r1–r3، بتا</li>
          </ul>
          <p className="mt-2 text-xs text-ink-400">از دکمه «قالب Excel» نمونه آماده بگیرید.</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-accent">۲) فایل پرتفو</h3>
          <ul className="mt-2 list-disc pr-5 text-xs leading-6 text-ink-400">
            <li>نماد (symbol)</li>
            <li>تعداد (qty)</li>
            <li>میانگین خرید (avgCost)</li>
          </ul>
          <p className="mt-2 text-xs text-ink-400">
            قیمت روز و صنعت از دیده‌بان تطبیق داده می‌شود؛ پس نمادها باید هم‌خوان باشند.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-warn">۳) سیستم امتیازدهی</h3>
          <p className="mt-2 text-sm leading-7 text-ink-300">
            هر ستون اصلی حداکثر ۲۵ امتیاز دارد (مجموع ۱۰۰). Top 10 از میان نمادهایی با امتیاز ≥ ۵۵ و روند غیرنزولی
            انتخاب می‌شود و دلیل بنیادی/تکنیکال پیشنهاد خرید نمایش داده می‌شود.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-warn">۴) هشدارهای پرتفو</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-300">
            <li><span className="text-loss">قرمز:</span> خروج اضطراری</li>
            <li><span className="text-warn">کهربایی:</span> نگهداری / تریلینگ استاپ</li>
            <li><span className="text-accent">فیروزه‌ای:</span> سبدگردانی تمرکز صنعتی</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
