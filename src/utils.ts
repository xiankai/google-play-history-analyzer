import { currencySymbolMap } from "country-data-list";

export function formatCurrency(amount: number, currency: string) {
  // Try if the currency code ca be directly used
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch (error) {}

  const currencyCodes = currencySymbolMap
    .filter((entry) => entry.symbol === currency)
    .map((entry) => entry.code);

  // If we found a unique currency code we can just use it
  if (currencyCodes.length === 1) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCodes[0],
    }).format(amount);
  }

  // Fallback
  return `${currency}${amount.toFixed(2)}`;
}
