export function toFaDigits(value) {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

export function formatNumber(n, digits = 0) {
  if (n == null || Number.isNaN(n)) return '—'
  return toFaDigits(
    Number(n).toLocaleString('en-US', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }),
  )
}

export function formatPct(n, digits = 1) {
  if (n == null || Number.isNaN(n)) return '—'
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  const abs = Math.abs(n).toFixed(digits)
  // LTR isolate so sign stays before digits in RTL layouts
  return `\u2066${sign}${toFaDigits(abs)}٪\u2069`
}

export function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e9) return toFaDigits(`${(n / 1e9).toFixed(1)}B`)
  if (abs >= 1e6) return toFaDigits(`${(n / 1e6).toFixed(1)}M`)
  if (abs >= 1e3) return toFaDigits(`${(n / 1e3).toFixed(1)}K`)
  return formatNumber(n)
}

export function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${formatNumber(Math.round(n))} ریال`
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}
