export function analyzeOption(opt) {
  const { type, strike, premium, underlyingPrice, daysToExpiry, iv, openInterest, volume } = opt

  let intrinsic = 0
  if (type === 'call') intrinsic = Math.max(underlyingPrice - strike, 0)
  else intrinsic = Math.max(strike - underlyingPrice, 0)

  const timeValue = Math.max(premium - intrinsic, 0)
  const leverage = premium > 0 ? (underlyingPrice / premium) : 0
  const moneyness =
    type === 'call'
      ? ((underlyingPrice - strike) / strike) * 100
      : ((strike - underlyingPrice) / strike) * 100

  const oiVolumeRatio = volume > 0 ? openInterest / volume : openInterest
  const professionalFlow =
    volume > 2000 && openInterest > 5000
      ? 'ورود احتمالی بازیگران حرفه‌ای / بازارگردان'
      : volume > 1000
        ? 'فعالیت متوسط بازار'
        : 'نقدشوندگی محدود'

  const strategy = suggestStrategy({ type, iv, intrinsic, timeValue, moneyness, daysToExpiry, leverage })

  return {
    ...opt,
    intrinsic: Number(intrinsic.toFixed(0)),
    timeValue: Number(timeValue.toFixed(0)),
    leverage: Number(leverage.toFixed(1)),
    moneyness: Number(moneyness.toFixed(1)),
    oiVolumeRatio: Number(oiVolumeRatio.toFixed(1)),
    professionalFlow,
    strategy,
  }
}

function suggestStrategy({ type, iv, intrinsic, timeValue, moneyness, daysToExpiry, leverage }) {
  if (iv >= 0.5 && type === 'call' && moneyness < -3) {
    return {
      name: 'Long Call (اهرم بالا)',
      kind: 'leveraged',
      note: 'IV بالا و OTM — ریسک زمانی زیاد؛ فقط با مدیریت حجم',
    }
  }
  if (iv >= 0.45 && type === 'put') {
    return {
      name: 'Protective Put (پوشش ریسک)',
      kind: 'hedge',
      note: 'مناسب پوشش پرتفوی سهم پایه در برابر اصلاح',
    }
  }
  if (type === 'call' && intrinsic > 0 && timeValue / Math.max(premiumSafe(intrinsic, timeValue), 1) < 0.4) {
    return {
      name: 'ITM Call کم‌زمان',
      kind: 'directional',
      note: 'ارزش ذاتی غالب — حساسیت دلتا بالاتر به حرکت سهم',
    }
  }
  if (daysToExpiry <= 20 && timeValue > intrinsic) {
    return {
      name: 'اجتناب از Theta Decay',
      kind: 'caution',
      note: 'سررسید نزدیک و ارزش زمانی بالا — خطر فرسایش زمانی',
    }
  }
  if (leverage >= 15) {
    return {
      name: 'اهرم تهاجمی',
      kind: 'leveraged',
      note: `اهرم حدود ${Number(leverage).toFixed(1)}× — مناسب سفته‌بازی کوتاه‌مدت`,
    }
  }
  return {
    name: type === 'call' ? 'Call جهت‌دار' : 'Put دفاعی/جهت‌دار',
    kind: type === 'put' ? 'hedge' : 'directional',
    note: 'بر اساس IV و موقعیت نسبت به قیمت اعمال ارزیابی کنید',
  }
}

function premiumSafe(intrinsic, timeValue) {
  return intrinsic + timeValue
}

export function analyzeOptions(list) {
  return list.map(analyzeOption)
}
