import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from "victory";
import { ParsedPurchase } from "../types";

interface BarChartViewProps {
  purchases: ParsedPurchase[];
}

export default function BarChartView({ purchases }: BarChartViewProps) {
  // Group by month and sum amounts
  const monthlyData = purchases
    .filter((p) => p.amount !== "N/A")
    .reduce((acc, purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const amount = parseFloat(purchase.amount);

      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += amount;
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
          <h2 className="card-title text-2xl mb-4">Monthly Spending</h2>
          <p className="text-lg mb-4">
            Total Spent:{" "}
            <span className="font-bold">${totalSpent.toFixed(2)}</span>
          </p>

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
