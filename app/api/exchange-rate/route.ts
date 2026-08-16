import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_RATES_FROM_USD } from "@/lib/currency";

// Server-side exchange-rate lookup. Keeps EXCHANGE_RATE_API_KEY out of the
// client bundle. Always resolves 200 with a usable rates object — falling
// back to hardcoded rates on any failure — so the page never loses pricing.
export async function GET(_request: NextRequest) {
  const apiUrl = process.env.EXCHANGE_RATE_API_URL;
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiUrl || !apiKey) {
    return NextResponse.json({
      rates: FALLBACK_RATES_FROM_USD,
      source: "fallback",
    });
  }

  try {
    const res = await fetch(`${apiUrl}/${apiKey}/latest/USD`, {
      // Exchange rates move slowly enough for an hourly edge cache.
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Exchange rate API status ${res.status}`);

    const data = await res.json();
    const rates = data.conversion_rates || data.rates;

    if (!rates) throw new Error("Malformed exchange rate response");

    return NextResponse.json({ rates, source: "live" });
  } catch (error) {
    return NextResponse.json({
      rates: FALLBACK_RATES_FROM_USD,
      source: "fallback",
    });
  }
}
