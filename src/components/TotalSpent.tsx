import { ParsedPurchase } from "../types";
import { formatCurrency } from "../utils";

interface TotalSpentProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  conversionRates: Record<string, Record<string, string>>;
}

export default function TotalSpent({
  purchases,
  selectedCurrency,
  conversionRates,
}: TotalSpentProps) {
  const convertAmount = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === selectedCurrency) {
      return amount;
    }
    const rate = conversionRates[fromCurrency]?.[selectedCurrency];
    if (!rate) {
      return 0;
    }
    return amount * parseFloat(rate);
  };

  const totalSpent = purchases
    .filter((p) => p.amount > 0)
    .reduce((sum, purchase) => {
      return sum + convertAmount(purchase.amount, purchase.currency);
    }, 0);

  return (
    <div className="text-right">
      <p className="text-sm text-base-content/70">Total Spent</p>
      <p className="text-xl font-bold">
        {formatCurrency(totalSpent, selectedCurrency)}
      </p>
    </div>
  );
}
