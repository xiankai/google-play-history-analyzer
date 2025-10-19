import { ParsedPurchase } from "../types";

interface CurrencyDisplayProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
}

export default function CurrencyDisplay({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
}: CurrencyDisplayProps) {
  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  if (currencies.length <= 1) {
    return null;
  }

  return (
    <div>
      <p className="text-sm text-base-content/70">Show purchases in</p>
      <select
        className="select select-bordered select-sm"
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        <option value="">All currencies</option>
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
}
