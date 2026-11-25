import * as XLSX from 'xlsx'

const ALIASES = {
  symbol: ['symbol', 'نماد', 'نام نماد', 'code'],
  name: ['name', 'نام', 'شرکت'],
  industry: ['industry', 'صنعت', 'گروه'],
  price: ['price', 'قیمت', 'قیمت روز', 'close'],
  changePct: ['changepct', 'تغییر', 'درصد تغییر', 'change'],
  volume: ['volume', 'حجم'],
  basevolume: ['basevolume', 'حجم مبنا', 'base_volume'],
  pe: ['pe', 'p/e', 'پی به ای'],
  ps: ['ps', 'p/s'],
  profitmargin: ['profitmargin', 'حاشیه سود', 'margin'],
  earningscoverage: ['earningscoverage', 'پوشش سود'],
  costtrend: ['costtrend', 'بهای تمام شده', 'cost'],
  seasonalprofit: ['seasonalprofit', 'سود فصلی'],
  realtolegalpower: ['realtolegalpower', 'قدرت حقیقی', 'حقیقی به حقوقی'],
  smartmoneyflow: ['smartmoneyflow', 'پول هوشمند', 'جریان نقدینگی'],
  buypercapita: ['buypercapita', 'سرانه خرید'],
  sellpercapita: ['sellpercapita', 'سرانه فروش'],
  trend: ['trend', 'روند'],
  rsi: ['rsi'],
  macd: ['macd'],
  vsma: ['vsma', 'میانگین'],
  s1: ['s1', 'حمایت1', 'support1'],
  s2: ['s2', 'حمایت2'],
  s3: ['s3', 'حمایت3'],
  r1: ['r1', 'مقاومت1', 'resistance1'],
  r2: ['r2', 'مقاومت2'],
  r3: ['r3', 'مقاومت3'],
  beta: ['beta', 'بتا'],
  qty: ['qty', 'تعداد', 'volume_holding', 'quantity'],
  avgcost: ['avgcost', 'میانگین خرید', 'قیمت میانگین', 'avg'],
}

function normalizeKey(key) {
  return String(key).trim().toLowerCase().replace(/\s+/g, '')
}

function mapRow(raw) {
  const mapped = {}
  const entries = Object.entries(raw)
  for (const [canon, aliases] of Object.entries(ALIASES)) {
    const normAliases = aliases.map((a) => normalizeKey(a))
    const found = entries.find(([k]) => normAliases.includes(normalizeKey(k)))
    if (found) mapped[canon === 'basevolume' ? 'baseVolume'
      : canon === 'changepct' ? 'changePct'
      : canon === 'profitmargin' ? 'profitMargin'
      : canon === 'earningscoverage' ? 'earningsCoverage'
      : canon === 'costtrend' ? 'costTrend'
      : canon === 'seasonalprofit' ? 'seasonalProfit'
      : canon === 'realtolegalpower' ? 'realToLegalPower'
      : canon === 'smartmoneyflow' ? 'smartMoneyFlow'
      : canon === 'buypercapita' ? 'buyPerCapita'
      : canon === 'sellpercapita' ? 'sellPerCapita'
      : canon === 'vsma' ? 'vsMA'
      : canon === 'avgcost' ? 'avgCost'
      : canon] = found[1]
  }
  return mapped
}

function toNumber(v, fallback = 0) {
  if (v == null || v === '') return fallback
  if (typeof v === 'number') return v
  const cleaned = String(v).replace(/,/g, '').replace(/٪/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : fallback
}

function coerceStock(row) {
  const m = mapRow(row)
  if (!m.symbol) return null
  const price = toNumber(m.price)
  return {
    symbol: String(m.symbol).trim(),
    name: m.name ? String(m.name) : String(m.symbol),
    industry: m.industry ? String(m.industry) : 'سایر',
    price,
    changePct: toNumber(m.changePct),
    volume: toNumber(m.volume),
    baseVolume: toNumber(m.baseVolume, Math.max(price, 1)),
    pe: toNumber(m.pe),
    ps: toNumber(m.ps),
    profitMargin: toNumber(m.profitMargin),
    earningsCoverage: toNumber(m.earningsCoverage, 1),
    costTrend: m.costTrend || 'stable',
    seasonalProfit: m.seasonalProfit || 'flat',
    realToLegalPower: toNumber(m.realToLegalPower, 1),
    smartMoneyFlow: toNumber(m.smartMoneyFlow),
    buyPerCapita: toNumber(m.buyPerCapita, 20),
    sellPerCapita: toNumber(m.sellPerCapita, 20),
    trend: m.trend || 'sideways',
    rsi: toNumber(m.rsi, 50),
    macd: m.macd || 'neutral',
    vsMA: m.vsMA || 'near',
    s1: toNumber(m.s1, price * 0.96),
    s2: toNumber(m.s2, price * 0.93),
    s3: toNumber(m.s3, price * 0.9),
    r1: toNumber(m.r1, price * 1.04),
    r2: toNumber(m.r2, price * 1.08),
    r3: toNumber(m.r3, price * 1.12),
    beta: toNumber(m.beta, 1),
  }
}

function coercePortfolio(row) {
  const m = mapRow(row)
  if (!m.symbol) return null
  return {
    symbol: String(m.symbol).trim(),
    qty: toNumber(m.qty),
    avgCost: toNumber(m.avgCost),
  }
}

export async function parseImportFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.json')) {
    const text = await file.text()
    const data = JSON.parse(text)
    return Array.isArray(data) ? data : data.rows || data.data || []
  }

  if (name.endsWith('.csv')) {
    const text = await file.text()
    const wb = XLSX.read(text, { type: 'string' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet)
  }

  // xlsx / xls
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

export async function parseStockFile(file) {
  const rows = await parseImportFile(file)
  return rows.map(coerceStock).filter(Boolean)
}

export async function parsePortfolioFile(file) {
  const rows = await parseImportFile(file)
  return rows.map(coercePortfolio).filter((r) => r && r.qty > 0)
}

export function downloadTemplate(columns, filename, sampleRow) {
  const ws = XLSX.utils.json_to_sheet([sampleRow || Object.fromEntries(columns.map((c) => [c, '']))])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'template')
  XLSX.writeFile(wb, filename)
}
