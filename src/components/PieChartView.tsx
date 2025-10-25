import { ParsedPurchase } from "../types";
import SinglePieChart from "./SinglePieChart";

interface PieChartViewProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  darkMode: boolean;
}

export default function PieChartView({
  purchases,
  selectedCurrency,
  darkMode,
}: PieChartViewProps) {
  // Get all unique currencies from purchases
  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  // Filter purchases by currency
  const getCurrencyPurchases = (currency: string) => {
    return purchases.filter((p) => p.currency === currency);
  };

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-2xl">Spending Breakdown by App</h2>
            <p className="text-sm text-base-content/70 mt-1">
              Click on a pie chart slice to see the purchases breakdown for that
              app
            </p>
          </div>
          {selectedCurrency ? (
            <div className="flex justify-center">
              <SinglePieChart
                purchases={getCurrencyPurchases(selectedCurrency)}
                currency={selectedCurrency}
                darkMode={darkMode}
                showTitle={false}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currencies.map((currency) => (
                <SinglePieChart
                  key={currency}
                  purchases={getCurrencyPurchases(currency)}
                  currency={currency}
                  darkMode={darkMode}
                  showTitle={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
