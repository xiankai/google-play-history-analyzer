import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ParsedPurchase } from "../types";
import { formatCurrency } from "../utils";

interface SinglePieChartProps {
  purchases: ParsedPurchase[];
  currency: string;
  darkMode: boolean;
  showTitle?: boolean;
}

export default function SinglePieChart({
  purchases,
  currency,
  darkMode,
  showTitle = false,
}: SinglePieChartProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Get app data for the given currency
  const getAppData = () => {
    return purchases
      .filter((p) => p.amount > 0 && p.currency === currency)
      .reduce((acc, purchase) => {
        const app = purchase.appName || "Other";
        if (!acc[app]) {
          acc[app] = 0;
        }
        acc[app] += purchase.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  // Get title data for a specific app
  const getTitleDataForApp = (appName: string) => {
    if (appName === "Others") {
      // Show apps that were grouped into "Others"
      const appData = getAppData();
      const sortedAppData = Object.entries(appData).sort(
        ([, a], [, b]) => b - a
      );
      const totalAmount = sortedAppData.reduce(
        (sum, [, amount]) => sum + amount,
        0
      );

      let runningTotal = 0;
      const top95Apps = new Set<string>();

      sortedAppData.forEach(([app, amount]) => {
        if (runningTotal < totalAmount * 0.95) {
          top95Apps.add(app);
          runningTotal += amount;
        }
      });

      return purchases
        .filter((p) => {
          const app = p.appName || "Other";
          return !top95Apps.has(app) && p.amount > 0 && p.currency === currency;
        })
        .reduce((acc, purchase) => {
          const app = purchase.appName || "Other";
          if (!acc[app]) {
            acc[app] = 0;
          }
          acc[app] += purchase.amount;
          return acc;
        }, {} as Record<string, number>);
    } else {
      // Show individual purchase titles for this app
      return purchases
        .filter(
          (p) =>
            p.appName === appName && p.amount > 0 && p.currency === currency
        )
        .reduce((acc, purchase) => {
          const title = purchase.title || "Unknown";
          if (!acc[title]) {
            acc[title] = 0;
          }
          acc[title] += purchase.amount;
          return acc;
        }, {} as Record<string, number>);
    }
  };

  // Process data with 95% grouping logic
  const processData = (data: Record<string, number>) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);
    const totalAmount = sortedData.reduce((sum, [, amount]) => sum + amount, 0);

    let runningTotal = 0;
    const top95: [string, number][] = [];
    let othersTotal = 0;

    sortedData.forEach(([key, amount]) => {
      if (runningTotal < totalAmount * 0.95) {
        top95.push([key, amount]);
        runningTotal += amount;
      } else {
        othersTotal += amount;
      }
    });

    const labels = top95.map(([key]) => key);
    const series = top95.map(([, amount]) => amount);

    if (othersTotal > 0) {
      labels.push("Others");
      series.push(othersTotal);
    }

    return { labels, series, top95 };
  };

  // Get the current chart data
  const getCurrentChartData = () => {
    if (selectedApp) {
      const titleData = getTitleDataForApp(selectedApp);
      return processData(titleData);
    } else {
      const appData = getAppData();
      return processData(appData);
    }
  };

  const chartData = getCurrentChartData();

  // Create chart options
  const chartOptions: ApexOptions = {
    chart: {
      type: "pie",
      background: "transparent",
      events: !selectedApp
        ? {
            dataPointSelection: (_event, _chartContext, config) => {
              const label = chartData.labels[config.dataPointIndex];
              if (label) {
                setSelectedApp(label);
              }
            },
          }
        : {},
    },
    labels: chartData.labels,
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
        return `${label}\n${formatCurrency(value, currency)}`;
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
        formatter: (val: number) => formatCurrency(val, currency),
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      {showTitle && <h3 className="text-xl font-semibold mb-4">{currency}</h3>}
      {selectedApp && (
        <>
          <button
            onClick={() => setSelectedApp(null)}
            className="btn btn-sm btn-outline mb-4 w-fit"
          >
            ← Back to Apps
          </button>
          <h4 className="text-lg font-semibold mb-2">
            {selectedApp} ({currency})
          </h4>
        </>
      )}
      <Chart
        options={chartOptions}
        series={chartData.series}
        type="pie"
        width={showTitle ? "100%" : "600"}
        height={showTitle ? "400" : undefined}
      />
    </div>
  );
}
