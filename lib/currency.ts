// Shared currency utilities: LatAm country -> currency mapping, formatting
// helpers, and hardcoded fallback exchange rates used whenever the live
// exchange-rate API is unreachable, so the page never fails to show a price.

export const LATAM_COUNTRY_CURRENCY: Record<string, string> = {
  DO: "DOP", // República Dominicana
  MX: "MXN",
  CO: "COP",
  AR: "ARS",
  CL: "CLP",
  PE: "PEN",
  GT: "GTQ",
  HN: "HNL",
  NI: "NIO",
  CR: "CRC",
  PA: "USD", // Panamá usa USD
  BO: "BOB",
  PY: "PYG",
  UY: "UYU",
  VE: "VES",
  BR: "BRL",
  EC: "USD", // Ecuador usa USD
  SV: "USD", // El Salvador usa USD
  PR: "USD",
};

// Fallback: 1 USD = X moneda local. Se usa si la API de tasas de cambio
// falla o no responde a tiempo. Los valores son aproximados y deben
// actualizarse periódicamente.
export const FALLBACK_RATES_FROM_USD: Record<string, number> = {
  USD: 1,
  DOP: 60.5,
  MXN: 18.7,
  COP: 4100,
  ARS: 1300,
  CLP: 980,
  PEN: 3.8,
  GTQ: 7.75,
  HNL: 25.7,
  NIO: 36.8,
  CRC: 520,
  BOB: 6.9,
  PYG: 7500,
  UYU: 40.5,
  VES: 46,
  BRL: 5.45,
};

export const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  DOP: "es-DO",
  MXN: "es-MX",
  COP: "es-CO",
  ARS: "es-AR",
  CLP: "es-CL",
  PEN: "es-PE",
  GTQ: "es-GT",
  HNL: "es-HN",
  NIO: "es-NI",
  CRC: "es-CR",
  BOB: "es-BO",
  PYG: "es-PY",
  UYU: "es-UY",
  VES: "es-VE",
  BRL: "pt-BR",
};

export function formatMoney(amount: number, currency: string): string {
  const rounded =
    currency === "USD" || currency === "DOP"
      ? Math.round(amount * 100) / 100
      : Math.round(amount);

  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] || "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    }).format(rounded);
  } catch {
    return `${currency} ${rounded.toLocaleString("es-DO")}`;
  }
}

export function convertFromUSD(
  amountUSD: number,
  ratesFromUSD: Record<string, number>,
  currency: string
): number {
  const rate = ratesFromUSD[currency];
  if (!rate) return amountUSD;
  return amountUSD * rate;
}

export function convertToUSD(
  localAmount: number,
  ratesFromUSD: Record<string, number>,
  currency: string
): number {
  const rate = ratesFromUSD[currency];
  if (!rate) return localAmount;
  return localAmount / rate;
}
