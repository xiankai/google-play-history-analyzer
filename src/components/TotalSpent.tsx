import { ParsedPurchase } from "../types";
import { formatCurrency } from "../utils";

interface TotalSpentProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
}

export default function TotalSpent({
  purchases,
  selectedCurrency,
}: TotalSpentProps) {
  if (selectedCurrency === "") {
    // Calculate totals for each currency separately
    const totalsByCurrency = purchases
      .filter((p) => p.amount > 0)
      .reduce((acc, purchase) => {
        const currency = purchase.currency;
        acc[currency] = (acc[currency] || 0) + purchase.amount;
        return acc;
      }, {} as Record<string, number>);

    const currencyStrings = Object.entries(totalsByCurrency)
      .map(([currency, total]) => formatCurrency(total, currency))
      .join(" ");

    return (
      <div>
        <p className="text-sm text-base-content/70">Total Spent</p>
        <p className="text-xl font-bold">{currencyStrings}</p>
      </div>
    );
  }

  const totalSpent = purchases
    .filter((p) => p.amount > 0 && p.currency === selectedCurrency)
    .reduce((sum, purchase) => {
      return sum + purchase.amount;
    }, 0);

  return (
    <div>
      <p className="text-sm text-base-content/70">Total Spent</p>
      <p className="text-xl font-bold">
        {formatCurrency(totalSpent, selectedCurrency)}
      </p>
    </div>
  );
}
