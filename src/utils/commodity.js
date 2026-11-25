export function analyzeCertificate(c) {
  const bubble = c.physicalPrice > 0
    ? ((c.close - c.physicalPrice) / c.physicalPrice) * 100
    : 0

  let signal = 'خنثی'
  let signalLevel = 'neutral'
  if (bubble >= 3) {
    signal = 'حباب مثبت — فروش گواهی / خرید فیزیکی یا صندوق'
    signalLevel = 'sell'
  } else if (bubble <= -3) {
    signal = 'حباب منفی — خرید گواهی (آربیتراژ احتمالی)'
    signalLevel = 'buy'
  } else {
    signal = 'نزدیک ارزش منصفانه'
    signalLevel = 'fair'
  }

  return {
    ...c,
    bubble: Number(bubble.toFixed(2)),
    signal,
    signalLevel,
  }
}

export function analyzeCommodityDerivative(d) {
  const basis =
    d.type === 'future' && d.spot
      ? ((d.price - d.spot) / d.spot) * 100
      : null

  let note = ''
  if (d.type === 'future') {
    if (basis > 1.5) note = 'کونتانگو — پرمیوم آتی نسبت به نقد'
    else if (basis < -1.5) note = 'بک‌واردیشن — آتی زیر نقد (فرصت نسبی)'
    else note = 'بیسیس متعادل'
  } else if (d.type === 'call') {
    note = 'اختیار خرید کالا — اهرم صعودی'
  } else {
    note = 'اختیار فروش کالا — پوشش یا جهت نزولی'
  }

  return {
    ...d,
    basis: basis != null ? Number(basis.toFixed(2)) : null,
    note,
  }
}

export function getArbitrageSignals(certificates) {
  return certificates
    .map(analyzeCertificate)
    .filter((c) => Math.abs(c.bubble) >= 2.5)
    .sort((a, b) => Math.abs(b.bubble) - Math.abs(a.bubble))
}
