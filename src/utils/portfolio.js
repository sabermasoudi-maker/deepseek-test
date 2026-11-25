export function enrichPortfolio(holdings, stocksBySymbol) {
  const rows = holdings.map((h) => {
    const stock = stocksBySymbol[h.symbol]
    const price = stock?.price ?? h.avgCost
    const marketValue = h.qty * price
    const costValue = h.qty * h.avgCost
    const pnl = marketValue - costValue
    const pnlPct = costValue > 0 ? (pnl / costValue) * 100 : 0
    const beta = stock?.beta ?? 1
    const industry = stock?.industry ?? 'نامشخص'
    return {
      ...h,
      price,
      marketValue,
      costValue,
      pnl,
      pnlPct,
      beta,
      industry,
      stock,
    }
  })

  const totalValue = rows.reduce((a, r) => a + r.marketValue, 0)
  const totalCost = rows.reduce((a, r) => a + r.costValue, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const withWeight = rows.map((r) => ({
    ...r,
    weight: totalValue > 0 ? (r.marketValue / totalValue) * 100 : 0,
  }))

  const portfolioBeta =
    totalValue > 0
      ? withWeight.reduce((a, r) => a + (r.beta * r.marketValue) / totalValue, 0)
      : 0

  // تمرکز صنعتی
  const industryWeights = {}
  for (const r of withWeight) {
    industryWeights[r.industry] = (industryWeights[r.industry] || 0) + r.weight
  }

  const alerts = buildAlerts(withWeight, industryWeights)

  return {
    rows: withWeight.sort((a, b) => b.marketValue - a.marketValue),
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPct,
    portfolioBeta: Number(portfolioBeta.toFixed(2)),
    industryWeights,
    alerts,
  }
}

function buildAlerts(rows, industryWeights) {
  const alerts = []

  for (const r of rows) {
    const s = r.stock
    if (!s) {
      alerts.push({
        level: 'rebalance',
        symbol: r.symbol,
        title: 'داده بازار ناقص',
        message: `برای ${r.symbol} داده قیمت روز در دیده‌بان یافت نشد.`,
      })
      continue
    }

    // خروج اضطراری
    if (s.price < s.s1 || s.smartMoneyFlow <= -50 || r.pnlPct <= -12) {
      const reasons = []
      if (s.price < s.s1) reasons.push('شکست حمایت کلیدی S1')
      if (s.smartMoneyFlow <= -50) reasons.push('خروج سنگین پول هوشمند')
      if (r.pnlPct <= -12) reasons.push('از دست رفتن حد ضرر تقریبی (−۱۲٪)')
      alerts.push({
        level: 'exit',
        symbol: r.symbol,
        title: 'اخطار خروج اضطراری',
        message: reasons.join(' · '),
      })
      continue
    }

    // نگهداری / سیو سود
    if (s.price >= s.r1 * 0.98 || s.rsi >= 70 || r.pnlPct >= 20) {
      const reasons = []
      if (s.price >= s.r1 * 0.98) reasons.push('نزدیک مقاومت R1')
      if (s.rsi >= 70) reasons.push('اشباع خرید (RSI)')
      if (r.pnlPct >= 20) reasons.push('سود باز قابل توجه — تریلینگ استاپ')
      alerts.push({
        level: 'hold',
        symbol: r.symbol,
        title: 'هشدار نگهداری / سیو سود',
        message: reasons.join(' · '),
      })
    }
  }

  for (const [industry, weight] of Object.entries(industryWeights)) {
    if (weight >= 35) {
      alerts.push({
        level: 'rebalance',
        symbol: industry,
        title: 'سبدگردانی و اصلاح وزن',
        message: `تمرکز ${weight.toFixed(0)}٪ روی صنعت ${industry} — ریسک تمرکز بالا`,
      })
    }
  }

  const order = { exit: 0, hold: 1, rebalance: 2 }
  return alerts.sort((a, b) => order[a.level] - order[b.level])
}
