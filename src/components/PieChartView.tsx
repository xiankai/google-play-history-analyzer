import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ParsedPurchase } from "../types";
import CurrencyDropdown from "./CurrencyDropdown";
import { formatCurrency } from "../utils";

interface PieChartViewProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  conversionRates: Record<string, Record<string, string>>;
  setConversionRates: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
  darkMode: boolean;
}

export default function PieChartView({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
  darkMode,
}: PieChartViewProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

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

  // Filter out N/A amounts and group by app
  const appData = purchases
    .filter((p) => p.amount > 0)
    .reduce((acc, purchase) => {
      const app = purchase.appName || "Other";
      if (!acc[app]) {
        acc[app] = 0;
      }
      acc[app] += convertAmount(purchase.amount, purchase.currency);
      return acc;
    }, {} as Record<string, number>);

  // Sort by total and group bottom 5% as "Others"
  const sortedAppData = Object.entries(appData).sort(([, a], [, b]) => b - a);
  const totalAmount = sortedAppData.reduce(
    (sum, [, amount]) => sum + amount,
    0
  );

  let runningTotal = 0;
  let othersTotal = 0;
  const top95Apps: [string, number][] = [];

  sortedAppData.forEach(([app, amount]) => {
    if (runningTotal < totalAmount * 0.95) {
      top95Apps.push([app, amount]);
      runningTotal += amount;
    } else {
      othersTotal += amount;
    }
  });

  const appChartLabels = top95Apps.map(([app]) => app);
  const appChartSeries = top95Apps.map(([, total]) => total);

  if (othersTotal > 0) {
    appChartLabels.push("Others");
    appChartSeries.push(othersTotal);
  }

  // When an app is selected, group by title
  const titleData = selectedApp
    ? selectedApp === "Others"
      ? purchases
          .filter((p) => {
            const app = p.appName || "Other";
            return (
              !top95Apps.some(([topApp]) => topApp === app) && p.amount > 0
            );
          })
          .reduce((acc, purchase) => {
            const app = purchase.appName || "Other";
            if (!acc[app]) {
              acc[app] = 0;
            }
            acc[app] += convertAmount(purchase.amount, purchase.currency);
            return acc;
          }, {} as Record<string, number>)
      : purchases
          .filter((p) => p.appName === selectedApp && p.amount > 0)
          .reduce((acc, purchase) => {
            const title = purchase.title || "Unknown";
            if (!acc[title]) {
              acc[title] = 0;
            }
            acc[title] += convertAmount(purchase.amount, purchase.currency);
            return acc;
          }, {} as Record<string, number>)
    : null;

  // Apply same 95% logic to title data
  let titleChartLabels: string[] = [];
  let titleChartSeries: number[] = [];
  if (titleData) {
    const sortedTitleData = Object.entries(titleData).sort(
      ([, a], [, b]) => b - a
    );
    const titleTotalAmount = sortedTitleData.reduce(
      (sum, [, amount]) => sum + amount,
      0
    );

    let titleRunningTotal = 0;
    let titleOthersTotal = 0;
    const top95Titles: [string, number][] = [];

    sortedTitleData.forEach(([title, amount]) => {
      if (titleRunningTotal < titleTotalAmount * 0.95) {
        top95Titles.push([title, amount]);
        titleRunningTotal += amount;
      } else {
        titleOthersTotal += amount;
      }
    });

    titleChartLabels = top95Titles.map(([title]) => title);
    titleChartSeries = top95Titles.map(([, total]) => total);

    if (titleOthersTotal > 0) {
      titleChartLabels.push("Others");
      titleChartSeries.push(titleOthersTotal);
    }
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: "pie",
      background: "transparent",
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const label = !selectedApp
            ? appChartLabels[config.dataPointIndex]
            : null;
          if (label) {
            setSelectedApp(label);
          }
        },
      },
    },
    labels: !selectedApp ? appChartLabels : titleChartLabels,
    theme: {
      mode: darkMode ? "dark" : "light",
    },
    plotOptions: {
      pie: {
        dataLabels: {
          minAngleToShowLabel: 10,
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_: number, opts) => {
        const label = opts.w.globals.labels[opts.seriesIndex];
        const value = opts.w.globals.series[opts.seriesIndex];
        return `${label}\n${formatCurrency(value, selectedCurrency)}`;
      },
    },
    legend: {
      position: "bottom",
      labels: {
        colors: darkMode ? "#ffffff" : "#000000",
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val, selectedCurrency),
      },
    },
  };

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <h2 className="card-title text-2xl">Spending Breakdown by App</h2>
            <div className="flex flex-col items-end gap-1 w-2/5">
              <CurrencyDropdown
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                conversionRates={conversionRates}
                setConversionRates={setConversionRates}
              />
            </div>
          </div>

          {selectedApp && (
            <button
              onClick={() => setSelectedApp(null)}
              className="btn btn-sm btn-outline mb-4 w-fit"
            >
              ← Back to Apps
            </button>
          )}

          {!selectedApp ? (
            <div className="flex justify-center">
              <Chart
                options={chartOptions}
                series={appChartSeries}
                type="pie"
                width="600"
              />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">{selectedApp}</h3>
              <div className="flex justify-center">
                <Chart
                  options={chartOptions}
                  series={titleChartSeries}
                  type="pie"
                  width="600"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
