import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ParsedPurchase } from "../types";
import { formatCurrency } from "../utils";

type TimeGrouping = "daily" | "monthly" | "yearly";

interface TimelineChartViewProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  darkMode: boolean;
}

export default function TimelineChartView({
  purchases,
  selectedCurrency,
  darkMode,
}: TimelineChartViewProps) {
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("daily");

  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  // Group data based on selected time grouping and currency
  const groupedData = purchases
    .filter((p) => p.amount > 0)
    .reduce((acc, purchase) => {
      // Only process purchases matching the selected currency, or all if ""
      if (selectedCurrency !== "" && purchase.currency !== selectedCurrency) {
        return acc;
      }

      const date = new Date(purchase.date);
      let key: string;

      if (timeGrouping === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (timeGrouping === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`; // YYYY-MM
      } else {
        key = `${date.getFullYear()}`; // YYYY
      }

      const currency = purchase.currency;
      const dataKey = selectedCurrency === "" ? `${key}|${currency}` : key;

      if (!acc[dataKey]) {
        acc[dataKey] = { amount: 0, currency };
      }
      acc[dataKey].amount += purchase.amount;
      return acc;
    }, {} as Record<string, { amount: number; currency: string }>);

  // When selectedCurrency is "", create multiple series (one per currency)
  // Otherwise, create a single series
  const series =
    selectedCurrency === ""
      ? currencies.map((currency) => {
          const currencyData = Object.entries(groupedData)
            .filter(([, data]) => data.currency === currency)
            .map(([key, data]) => {
              const timeKey = key.split("|")[0];
              let timestamp: number;
              if (timeGrouping === "daily") {
                timestamp = new Date(timeKey).getTime();
              } else if (timeGrouping === "monthly") {
                timestamp = new Date(timeKey + "-01").getTime();
              } else {
                timestamp = new Date(timeKey + "-01-01").getTime();
              }
              return {
                x: timestamp,
                y: data.amount,
              };
            })
            .sort((a, b) => a.x - b.x);

          return {
            name: `${currency} - ${
              timeGrouping === "daily"
                ? "Daily Spending"
                : timeGrouping === "monthly"
                ? "Monthly Spending"
                : "Yearly Spending"
            }`,
            data: currencyData,
          };
        })
      : [
          {
            name:
              timeGrouping === "daily"
                ? "Daily Spending"
                : timeGrouping === "monthly"
                ? "Monthly Spending"
                : "Yearly Spending",
            data: Object.entries(groupedData)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([key, data]) => {
                let timestamp: number;
                if (timeGrouping === "daily") {
                  timestamp = new Date(key).getTime();
                } else if (timeGrouping === "monthly") {
                  timestamp = new Date(key + "-01").getTime();
                } else {
                  timestamp = new Date(key + "-01-01").getTime();
                }
                return {
                  x: timestamp,
                  y: data.amount,
                };
              }),
          },
        ];

  // Main chart options (detail view)
  const mainChartOptions: ApexOptions = {
    chart: {
      id: "main-chart",
      type: "bar",
      background: "transparent",
      toolbar: {
        autoSelected: "pan",
        show: true,
      },
      zoom: {
        autoScaleYaxis: true,
      },
    },
    theme: {
      mode: darkMode ? "dark" : "light",
    },
    colors:
      selectedCurrency === ""
        ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        : ["#4f46e5"],
    plotOptions: {
      bar: {
        columnWidth:
          timeGrouping === "daily"
            ? "50%"
            : timeGrouping === "monthly"
            ? "70%"
            : "80%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: darkMode ? "#ffffff" : "#000000",
        },
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
          if (selectedCurrency === "") {
            return val.toFixed(0);
          }
          return formatCurrency(val, selectedCurrency);
        },
        style: {
          colors: darkMode ? "#ffffff" : "#000000",
        },
      },
    },
    tooltip: {
      x: {
        format:
          timeGrouping === "daily"
            ? "dd MMM yyyy"
            : timeGrouping === "monthly"
            ? "MMM yyyy"
            : "yyyy",
      },
      y: {
        formatter: (val: number, opts) => {
          if (selectedCurrency === "") {
            // Extract currency from series name (e.g., "USD - Daily Spending")
            const seriesName = opts.w.globals.seriesNames[opts.seriesIndex];
            const currency = seriesName.split(" - ")[0];
            return formatCurrency(val, currency);
          }
          return formatCurrency(val, selectedCurrency);
        },
      },
    },
    legend: {
      show: selectedCurrency === "",
      position: "top",
      labels: {
        colors: darkMode ? "#ffffff" : "#000000",
      },
    },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
    },
  };

  // Brush chart options (overview/navigator)
  const allDataPoints = series.flatMap((s) => s.data);
  const brushChartOptions: ApexOptions = {
    chart: {
      id: "brush-chart",
      brush: {
        target: "main-chart",
        enabled: true,
      },
      selection: {
        enabled: true,
        // Adjust default selection based on time grouping
        xaxis: {
          min:
            allDataPoints.length > 0
              ? Math.max(
                  Math.min(...allDataPoints.map((d) => d.x)),
                  Math.max(...allDataPoints.map((d) => d.x)) -
                    (timeGrouping === "daily"
                      ? 90 * 24 * 60 * 60 * 1000 // 90 days
                      : timeGrouping === "monthly"
                      ? 365 * 24 * 60 * 60 * 1000 // 1 year
                      : 3 * 365 * 24 * 60 * 60 * 1000) // 3 years
                )
              : undefined,
          max:
            allDataPoints.length > 0
              ? Math.max(...allDataPoints.map((d) => d.x))
              : undefined,
        },
        fill: {
          color: darkMode ? "#4f46e5" : "#4f46e5",
          opacity: darkMode ? 0.3 : 0.24,
        },
        stroke: {
          width: 1,
          color: darkMode ? "#6366f1" : "#4f46e5",
          opacity: darkMode ? 0.8 : 0.4,
        },
      },
      background: "transparent",
    },
    theme: {
      mode: darkMode ? "dark" : "light",
    },
    colors:
      selectedCurrency === ""
        ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
        : ["#4f46e5"],
    plotOptions: {
      bar: {
        columnWidth:
          timeGrouping === "daily"
            ? "50%"
            : timeGrouping === "monthly"
            ? "70%"
            : "80%",
      },
    },
    xaxis: {
      type: "datetime",
      tooltip: {
        enabled: false,
      },
      labels: {
        style: {
          colors: darkMode ? "#ffffff" : "#000000",
        },
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      tickAmount: 2,
      labels: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
    },
  };

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <select
              value={timeGrouping}
              onChange={(e) => setTimeGrouping(e.target.value as TimeGrouping)}
              className="select select-bordered select-sm"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <h2 className="card-title text-2xl">Spending History over time</h2>
          </div>
          <p className="text-sm text-base-content/70 mb-4">
            Use the brush chart below to zoom and pan through your spending
            history
          </p>

          <div className="flex flex-col gap-4">
            {/* Main detail chart */}
            <div>
              <Chart
                options={mainChartOptions}
                series={series}
                type="bar"
                width="100%"
                height="400"
              />
            </div>

            {/* Brush/navigator chart */}
            <div>
              <Chart
                options={brushChartOptions}
                series={series}
                type="bar"
                width="100%"
                height="130"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
