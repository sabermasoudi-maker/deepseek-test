import { clamp } from './format'

function scoreFundamental(s) {
  let score = 0
  // حاشیه سود (۰–۶)
  if (s.profitMargin >= 25) score += 6
  else if (s.profitMargin >= 15) score += 4.5
  else if (s.profitMargin >= 8) score += 3
  else if (s.profitMargin >= 0) score += 1.5

  // پوشش سودآوری (۰–۶)
  if (s.earningsCoverage >= 1.4) score += 6
  else if (s.earningsCoverage >= 1.1) score += 4.5
  else if (s.earningsCoverage >= 0.9) score += 3
  else if (s.earningsCoverage >= 0.5) score += 1.5

  // P/E (۰–۶) — صفر = زیان‌ده
  if (s.pe > 0 && s.pe <= 6) score += 6
  else if (s.pe > 6 && s.pe <= 9) score += 4.5
  else if (s.pe > 9 && s.pe <= 14) score += 3
  else if (s.pe > 14) score += 1.5

  // P/S (۰–۳.۵)
  if (s.ps > 0 && s.ps <= 1) score += 3.5
  else if (s.ps <= 1.5) score += 2.5
  else if (s.ps <= 2.5) score += 1.5
  else score += 0.5

  // بهای تمام‌شده (۰–۲)
  if (s.costTrend === 'improving') score += 2
  else if (s.costTrend === 'stable') score += 1

  // روند سود فصلی (۰–۱.۵)
  if (s.seasonalProfit === 'up') score += 1.5
  else if (s.seasonalProfit === 'flat') score += 0.75

  return clamp(score, 0, 25)
}

function scoreSmartMoney(s) {
  let score = 0
  // قدرت حقیقی به حقوقی (۰–۷)
  if (s.realToLegalPower >= 2) score += 7
  else if (s.realToLegalPower >= 1.5) score += 5.5
  else if (s.realToLegalPower >= 1.1) score += 4
  else if (s.realToLegalPower >= 0.9) score += 2
  else score += 0.5

  // جریان پول هوشمند (میلیارد) (۰–۸)
  if (s.smartMoneyFlow >= 80) score += 8
  else if (s.smartMoneyFlow >= 40) score += 6
  else if (s.smartMoneyFlow >= 10) score += 4
  else if (s.smartMoneyFlow >= 0) score += 2
  else if (s.smartMoneyFlow >= -40) score += 1

  // حجم مشکوک نسبت به مبنا (۰–۵)
  const volRatio = s.baseVolume > 0 ? s.volume / s.baseVolume : 1
  if (volRatio >= 4) score += 5
  else if (volRatio >= 2.5) score += 4
  else if (volRatio >= 1.5) score += 3
  else if (volRatio >= 1) score += 1.5

  // سرانه خرید/فروش (۰–۵)
  const perCapita = s.sellPerCapita > 0 ? s.buyPerCapita / s.sellPerCapita : 1
  if (perCapita >= 2) score += 5
  else if (perCapita >= 1.4) score += 3.5
  else if (perCapita >= 1) score += 2
  else score += 0.5

  return clamp(score, 0, 25)
}

function scoreTechnical(s) {
  let score = 0
  if (s.trend === 'up') score += 9
  else if (s.trend === 'sideways') score += 4.5
  else score += 1

  // RSI (۰–۸)
  if (s.rsi >= 45 && s.rsi <= 65) score += 8
  else if (s.rsi > 65 && s.rsi <= 72) score += 5
  else if (s.rsi >= 35 && s.rsi < 45) score += 4
  else if (s.rsi > 72) score += 2
  else score += 1.5

  if (s.macd === 'bullish') score += 5
  else if (s.macd === 'neutral') score += 2.5
  else score += 0.5

  if (s.vsMA === 'above') score += 3
  else if (s.vsMA === 'near') score += 1.5

  return clamp(score, 0, 25)
}

function scoreSupportResistance(s) {
  const price = s.price
  const risk = Math.max(price - s.s1, 1)
  const reward = Math.max(s.r1 - price, 0)
  const rr = reward / risk

  let score = 0
  // ریسک به ریوارد (۰–۱۲)
  if (rr >= 2.5) score += 12
  else if (rr >= 2) score += 10
  else if (rr >= 1.5) score += 7.5
  else if (rr >= 1) score += 5
  else if (rr >= 0.5) score += 2.5

  // فاصله امن تا حمایت (۰–۷)
  const supportCushion = ((price - s.s1) / price) * 100
  if (supportCushion >= 2 && supportCushion <= 6) score += 7
  else if (supportCushion > 6 && supportCushion <= 10) score += 5
  else if (supportCushion >= 1) score += 3
  else score += 1

  // فضای رشد تا مقاومت (۰–۶)
  const upside = ((s.r2 - price) / price) * 100
  if (upside >= 8) score += 6
  else if (upside >= 5) score += 4
  else if (upside >= 2) score += 2

  return {
    score: clamp(score, 0, 25),
    riskReward: Number(rr.toFixed(2)),
    risk,
    reward,
  }
}

export function analyzeStock(stock) {
  const fundamental = scoreFundamental(stock)
  const smartMoney = scoreSmartMoney(stock)
  const technical = scoreTechnical(stock)
  const sr = scoreSupportResistance(stock)
  const total = Number((fundamental + smartMoney + technical + sr.score).toFixed(1))

  const reasons = buildReasons(stock, { fundamental, smartMoney, technical, sr, total })

  return {
    ...stock,
    scores: {
      fundamental: Number(fundamental.toFixed(1)),
      smartMoney: Number(smartMoney.toFixed(1)),
      technical: Number(technical.toFixed(1)),
      supportResistance: Number(sr.score.toFixed(1)),
      total,
    },
    riskReward: sr.riskReward,
    reasons,
  }
}

function buildReasons(s, scores) {
  const fund = []
  const tech = []

  if (s.profitMargin >= 15) fund.push(`حاشیه سود ${s.profitMargin}٪`)
  if (s.pe > 0 && s.pe <= 9) fund.push(`P/E جذاب (${s.pe})`)
  if (s.earningsCoverage >= 1.2) fund.push('پوشش سودآوری مناسب')
  if (s.seasonalProfit === 'up') fund.push('روند سود فصلی صعودی')
  if (s.costTrend === 'improving') fund.push('بهبود بهای تمام‌شده')

  if (s.smartMoneyFlow > 20) tech.push(`ورود پول هوشمند (+${s.smartMoneyFlow} میلیارد)`)
  if (s.realToLegalPower >= 1.4) tech.push(`قدرت حقیقی/حقوقی ${s.realToLegalPower}`)
  if (s.volume / s.baseVolume >= 2) tech.push('حجم مشکوک نسبت به مبنا')
  if (s.trend === 'up') tech.push('روند صعودی')
  if (s.macd === 'bullish') tech.push('MACD مثبت')
  if (s.vsMA === 'above') tech.push('بالای میانگین‌های کلیدی')
  if (scores.sr.riskReward >= 1.5) tech.push(`R/R = ${scores.sr.riskReward}`)

  if (!fund.length) fund.push('فاندامنتال متوسط')
  if (!tech.length) tech.push('تکنیکال خنثی')

  return { fundamental: fund, technical: tech }
}

export function rankStocks(stocks) {
  return stocks
    .map(analyzeStock)
    .sort((a, b) => b.scores.total - a.scores.total)
}

export function getTopBuyCandidates(ranked, limit = 10) {
  return ranked
    .filter((s) => s.scores.total >= 55 && s.trend !== 'down')
    .slice(0, limit)
}
