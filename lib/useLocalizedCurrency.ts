"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_RATES_FROM_USD,
  LATAM_COUNTRY_CURRENCY,
} from "@/lib/currency";

const CACHE_KEY = "gpa_currency_cache_v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

interface CurrencyCache {
  countryCode: string | null;
  currency: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface LocalizedCurrencyState {
  currency: string;
  rates: Record<string, number>;
  isLatam: boolean;
  loading: boolean;
}

function readCache(): CurrencyCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CurrencyCache = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: CurrencyCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota excedida, etc.)
  }
}

// Detecta el país del visitante por IP y su tasa de cambio en tiempo real,
// con cache en localStorage y respaldo hardcodeado ante cualquier falla.
export function useLocalizedCurrency(): LocalizedCurrencyState {
  const [state, setState] = useState<LocalizedCurrencyState>({
    currency: "USD",
    rates: FALLBACK_RATES_FROM_USD,
    isLatam: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveCurrency() {
      const cached = readCache();
      if (cached) {
        if (!cancelled) {
          setState({
            currency: cached.currency,
            rates: cached.rates,
            isLatam: cached.currency !== "USD",
            loading: false,
          });
        }
        return;
      }

      let countryCode: string | null = null;
      let rates: Record<string, number> = FALLBACK_RATES_FROM_USD;

      try {
        const geoRes = await fetch("/api/geo");
        const geoData = await geoRes.json();
        countryCode = geoData.countryCode || null;
      } catch {
        countryCode = null;
      }

      try {
        const ratesRes = await fetch("/api/exchange-rate");
        const ratesData = await ratesRes.json();
        if (ratesData?.rates) rates = ratesData.rates;
      } catch {
        rates = FALLBACK_RATES_FROM_USD;
      }

      const currency = countryCode
        ? LATAM_COUNTRY_CURRENCY[countryCode.toUpperCase()] || "USD"
        : "USD";

      const nextState: LocalizedCurrencyState = {
        currency,
        rates,
        isLatam: currency !== "USD",
        loading: false,
      };

      writeCache({
        countryCode,
        currency,
        rates,
        timestamp: Date.now(),
      });

      if (!cancelled) setState(nextState);
    }

    resolveCurrency();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
