import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory";
import { ParsedPurchase } from "../types";
import CurrencyDropdown from "./CurrencyDropdown";

interface BarChartViewProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  conversionRates: Record<string, Record<string, string>>;
  setConversionRates: (rates: Record<string, Record<string, string>>) => void;
}

export default function BarChartView({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
}: BarChartViewProps) {
  const convertAmount = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === selectedCurrency) {
      return amount;
    }
    const rate = conversionRates[fromCurrency]?.[selectedCurrency];
    if (!rate) {
      return 0; // Return 0 if no conversion rate is set
    }
    return amount * parseFloat(rate);
  };

  // Group by month and sum amounts
  const monthlyData = purchases
    .filter((p) => p.amount > 0)
    .reduce((acc, purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += convertAmount(purchase.amount, purchase.currency);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      x: month,
      y: total,
    }));

  const totalSpent = chartData.reduce((sum, item) => sum + item.y, 0);

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="card-title text-2xl mb-4">Monthly Spending</h2>
              <p className="text-lg mb-4">
                Total Spent:{" "}
                <span className="font-bold">${totalSpent.toFixed(2)}</span>
              </p>
            </div>
            <CurrencyDropdown
              purchases={purchases}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
              conversionRates={conversionRates}
              setConversionRates={setConversionRates}
            />
          </div>

          <div className="flex justify-center">
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={20}
              width={800}
              height={400}
            >
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10, angle: -45, textAnchor: "end" },
                  grid: { stroke: "none" },
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => `$${x}`}
                style={{
                  tickLabels: { fontSize: 12 },
                  grid: { stroke: "none" },
                }}
              />
              <VictoryBar
                data={chartData}
                style={{
                  data: { fill: "#4f46e5" },
                }}
              />
            </VictoryChart>
          </div>
        </div>
      </div>
    </div>
  );
}
