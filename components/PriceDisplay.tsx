"use client";

import { useLocalizedCurrency } from "@/lib/useLocalizedCurrency";
import {
  convertFromUSD,
  convertToUSD,
  formatMoney,
} from "@/lib/currency";
import type { PriceModel } from "@/data/programs";

export function PriceDisplay({
  price,
  size = "md",
  installmentsLabel = true,
}: {
  price: PriceModel;
  size?: "sm" | "md" | "lg";
  installmentsLabel?: boolean;
}) {
  const { currency, rates, isLatam } = useLocalizedCurrency();

  let main: string;
  let sub: string | null = null;
  let installments: string | null = null;

  if (price.type === "DOP_FIXED") {
    main = formatMoney(price.amountDOP, "DOP");
    const usdEquivalent = convertToUSD(price.amountDOP, rates, "DOP");
    sub = `aprox. ${formatMoney(usdEquivalent, "USD")}`;
    if (installmentsLabel && price.installments > 1) {
      installments = `en ${price.installments} cuotas de ${formatMoney(
        price.amountDOP / price.installments,
        "DOP"
      )}`;
    }
  } else {
    if (isLatam && currency !== "USD") {
      const localAmount = convertFromUSD(price.amountUSD, rates, currency);
      main = formatMoney(localAmount, currency);
      sub = `aprox. ${formatMoney(price.amountUSD, "USD")}`;
    } else {
      main = formatMoney(price.amountUSD, "USD");
    }
  }

  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl md:text-5xl",
  }[size];

  return (
    <div>
      <div className={`font-bold text-white ${sizeClasses}`}>{main}</div>
      {sub && <div className="mt-0.5 text-sm text-white/50">({sub})</div>}
      {installments && (
        <div className="mt-1 text-sm font-medium text-jarvis-cyanSoft">
          {installments}
        </div>
      )}
    </div>
  );
}
