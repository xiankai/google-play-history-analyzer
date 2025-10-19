import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ParsedPurchase } from "../types";
import { formatCurrency } from "../utils";

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
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedAppCurrency, setSelectedAppCurrency] = useState<string | null>(null);

  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  // When selectedCurrency is "", we'll create separate data for each currency
  // When selectedCurrency is set, group by app only (in that currency)
  const getAppDataForCurrency = (currency: string) => {
    return purchases
      .filter((p) => p.amount > 0 && p.currency === currency)
      .reduce((acc, purchase) => {
        const app = purchase.appName || "Other";
        if (!acc[app]) {
          acc[app] = { amount: 0, currency };
        }
        acc[app].amount += purchase.amount;
        return acc;
      }, {} as Record<string, { amount: number; currency: string }>);
  };

  // Function to process data for a single currency and create chart data
  const getChartDataForCurrency = (currency: string) => {
    const appData = getAppDataForCurrency(currency);

    // Sort by total and group bottom 5% as "Others"
    const sortedAppData = Object.entries(appData).sort(
      ([, a], [, b]) => b.amount - a.amount
    );
    const totalAmount = sortedAppData.reduce(
      (sum, [, { amount }]) => sum + amount,
      0
    );

    let runningTotal = 0;
    const top95Apps: [string, { amount: number; currency: string }][] = [];
    let othersTotal = 0;

    sortedAppData.forEach(([app, data]) => {
      if (runningTotal < totalAmount * 0.95) {
        top95Apps.push([app, data]);
        runningTotal += data.amount;
      } else {
        othersTotal += data.amount;
      }
    });

    const labels = top95Apps.map(([app]) => app);
    const series = top95Apps.map(([, { amount }]) => amount);

    if (othersTotal > 0) {
      labels.push("Others");
      series.push(othersTotal);
    }

    return { labels, series, currency, top95Apps };
  };

  // Function to get title breakdown for a specific app and currency
  const getTitleDataForApp = (appName: string, currency: string) => {
    const chartData = getChartDataForCurrency(currency);

    if (appName === "Others") {
      // Show apps that were grouped into "Others"
      return purchases
        .filter((p) => {
          const app = p.appName || "Other";
          return (
            !chartData.top95Apps.some(([topApp]) => topApp === app) &&
            p.amount > 0 &&
            p.currency === currency
          );
        })
        .reduce((acc, purchase) => {
          const app = purchase.appName || "Other";
          if (!acc[app]) {
            acc[app] = { amount: 0, currency: purchase.currency };
          }
          acc[app].amount += purchase.amount;
          return acc;
        }, {} as Record<string, { amount: number; currency: string }>);
    } else {
      // Show individual purchase titles for this app
      return purchases
        .filter((p) => p.appName === appName && p.amount > 0 && p.currency === currency)
        .reduce((acc, purchase) => {
          const title = purchase.title || "Unknown";
          if (!acc[title]) {
            acc[title] = { amount: 0, currency: purchase.currency };
          }
          acc[title].amount += purchase.amount;
          return acc;
        }, {} as Record<string, { amount: number; currency: string }>);
    }
  };

  const appData = selectedCurrency === ""
    ? {} // Not used when showing multiple charts
    : getAppDataForCurrency(selectedCurrency);

  // For single currency view
  const sortedAppData = Object.entries(appData).sort(
    ([, a], [, b]) => b.amount - a.amount
  );
  const totalAmount = sortedAppData.reduce(
    (sum, [, { amount }]) => sum + amount,
    0
  );

  let runningTotal = 0;
  const top95Apps: [string, { amount: number; currency: string }][] = [];
  let othersTotal = 0;

  sortedAppData.forEach(([app, data]) => {
    if (runningTotal < totalAmount * 0.95) {
      top95Apps.push([app, data]);
      runningTotal += data.amount;
    } else {
      othersTotal += data.amount;
    }
  });

  const appChartLabels = top95Apps.map(([app]) => app);
  const appChartSeries = top95Apps.map(([, { amount }]) => amount);
  const appChartCurrencies = top95Apps.map(([, { currency }]) => currency);

  if (othersTotal > 0) {
    appChartLabels.push("Others");
    appChartSeries.push(othersTotal);
    appChartCurrencies.push(selectedCurrency);
  }

  // When an app is selected, group by title (only works in single currency mode)
  const titleData = selectedApp && selectedCurrency !== ""
    ? selectedApp === "Others"
      ? purchases
          .filter((p) => {
            const app = p.appName || "Other";
            return (
              !top95Apps.some(([topApp]) => topApp === app) &&
              p.amount > 0 &&
              p.currency === selectedCurrency
            );
          })
          .reduce((acc, purchase) => {
            const app = purchase.appName || "Other";
            if (!acc[app]) {
              acc[app] = { amount: 0, currency: purchase.currency };
            }
            acc[app].amount += purchase.amount;
            return acc;
          }, {} as Record<string, { amount: number; currency: string }>)
      : purchases
          .filter((p) => p.appName === selectedApp && p.amount > 0 && p.currency === selectedCurrency)
          .reduce((acc, purchase) => {
            const title = purchase.title || "Unknown";
            if (!acc[title]) {
              acc[title] = { amount: 0, currency: purchase.currency };
            }
            acc[title].amount += purchase.amount;
            return acc;
          }, {} as Record<string, { amount: number; currency: string }>)
    : null;

  // Apply same 95% logic to title data
  let titleChartLabels: string[] = [];
  let titleChartSeries: number[] = [];
  let titleChartCurrencies: string[] = [];
  if (titleData) {
    const sortedTitleData = Object.entries(titleData).sort(
      ([, a], [, b]) => b.amount - a.amount
    );
    const titleTotalAmount = sortedTitleData.reduce(
      (sum, [, { amount }]) => sum + amount,
      0
    );

    let titleRunningTotal = 0;
    const top95Titles: [string, { amount: number; currency: string }][] = [];
    const titleOthersData: Record<string, number> = {};

    sortedTitleData.forEach(([title, data]) => {
      if (titleRunningTotal < titleTotalAmount * 0.95) {
        top95Titles.push([title, data]);
        titleRunningTotal += data.amount;
      } else {
        const currency = data.currency;
        const othersKey = selectedCurrency === "" ? `Others (${currency})` : "Others";
        titleOthersData[othersKey] = (titleOthersData[othersKey] || 0) + data.amount;
      }
    });

    titleChartLabels = top95Titles.map(([title]) => title);
    titleChartSeries = top95Titles.map(([, { amount }]) => amount);
    titleChartCurrencies = top95Titles.map(([, { currency }]) => currency);

    Object.entries(titleOthersData).forEach(([key, amount]) => {
      titleChartLabels.push(key);
      titleChartSeries.push(amount);
      const currencyMatch = key.match(/\(([^)]+)\)$/);
      titleChartCurrencies.push(currencyMatch ? currencyMatch[1] : selectedCurrency);
    });
  }

  // Function to create chart options for a specific currency
  const createChartOptions = (
    labels: string[],
    currency: string,
    onAppClick?: (appName: string, currency: string) => void
  ): ApexOptions => ({
    chart: {
      type: "pie",
      background: "transparent",
      events: onAppClick
        ? {
            dataPointSelection: (_event, _chartContext, config) => {
              const label = labels[config.dataPointIndex];
              if (label) {
                onAppClick(label, currency);
              }
            },
          }
        : {},
    },
    labels,
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
  });

  const chartOptions: ApexOptions = createChartOptions(
    !selectedApp ? appChartLabels : titleChartLabels,
    selectedCurrency,
    !selectedApp ? (appName, currency) => {
      setSelectedApp(appName);
      setSelectedAppCurrency(currency);
    } : undefined
  );

  // When "All currencies" is selected, show multiple pie charts or drill-down
  if (selectedCurrency === "") {
    if (selectedApp && selectedAppCurrency) {
      // Show drill-down for the selected app
      const titleData = getTitleDataForApp(selectedApp, selectedAppCurrency);
      const sortedTitleData = Object.entries(titleData).sort(
        ([, a], [, b]) => b.amount - a.amount
      );
      const titleTotalAmount = sortedTitleData.reduce(
        (sum, [, { amount }]) => sum + amount,
        0
      );

      let titleRunningTotal = 0;
      const top95Titles: [string, { amount: number; currency: string }][] = [];
      let titleOthersTotal = 0;

      sortedTitleData.forEach(([title, data]) => {
        if (titleRunningTotal < titleTotalAmount * 0.95) {
          top95Titles.push([title, data]);
          titleRunningTotal += data.amount;
        } else {
          titleOthersTotal += data.amount;
        }
      });

      const titleLabels = top95Titles.map(([title]) => title);
      const titleSeries = top95Titles.map(([, { amount }]) => amount);

      if (titleOthersTotal > 0) {
        titleLabels.push("Others");
        titleSeries.push(titleOthersTotal);
      }

      const titleChartOptions = createChartOptions(titleLabels, selectedAppCurrency);

      return (
        <div className="mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-4">
                <h2 className="card-title text-2xl">Spending Breakdown by App</h2>
                <p className="text-sm text-base-content/70 mt-1">
                  Click on a pie chart slice to see the purchases breakdown for that app
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setSelectedAppCurrency(null);
                }}
                className="btn btn-sm btn-outline mb-4 w-fit"
              >
                ← Back to Apps
              </button>
              <h3 className="text-xl font-semibold mb-2">
                {selectedApp} ({selectedAppCurrency})
              </h3>
              <div className="flex justify-center">
                <Chart
                  options={titleChartOptions}
                  series={titleSeries}
                  type="pie"
                  width="600"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="mb-4">
              <h2 className="card-title text-2xl">Spending Breakdown by App</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Click on a pie chart slice to see the purchases breakdown for that app
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currencies.map((currency) => {
                const chartData = getChartDataForCurrency(currency);
                const options = createChartOptions(
                  chartData.labels,
                  currency,
                  (appName, curr) => {
                    setSelectedApp(appName);
                    setSelectedAppCurrency(curr);
                  }
                );

                return (
                  <div key={currency} className="flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4">{currency}</h3>
                    <Chart
                      options={options}
                      series={chartData.series}
                      type="pie"
                      width="100%"
                      height="400"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="card-title text-2xl">Spending Breakdown by App</h2>
            {!selectedApp && (
              <p className="text-sm text-base-content/70 mt-1">
                Click on a pie chart slice to see the purchases breakdown for that app
              </p>
            )}
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
