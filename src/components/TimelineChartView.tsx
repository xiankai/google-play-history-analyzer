import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { ParsedPurchase } from "../types";
import CurrencyDropdown from "./CurrencyDropdown";
import { formatCurrency } from "../utils";

type TimeGrouping = "daily" | "monthly" | "yearly";

interface TimelineChartViewProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  conversionRates: Record<string, Record<string, string>>;
  setConversionRates: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  darkMode: boolean;
}

export default function TimelineChartView({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
  darkMode,
}: TimelineChartViewProps) {
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("daily");

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

  // Group data based on selected time grouping
  const groupedData = purchases
    .filter((p) => p.amount > 0)
    .reduce((acc, purchase) => {
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

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += convertAmount(purchase.amount, purchase.currency);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(groupedData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
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
        y: total,
      };
    });

  const series = [
    {
      name:
        timeGrouping === "daily"
          ? "Daily Spending"
          : timeGrouping === "monthly"
          ? "Monthly Spending"
          : "Yearly Spending",
      data: chartData,
    },
  ];

  // Main chart options (detail view)
  const mainChartOptions: ApexOptions = {
    chart: {
      id: "main-chart",
      type: "area",
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
    colors: ["#4f46e5"],
    stroke: {
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: timeGrouping === "yearly" ? "yyyy" : "MMM yyyy",
          day: timeGrouping === "daily" ? "dd MMM yyyy" : "MMM yyyy",
        },
        style: {
          colors: darkMode ? "#ffffff" : "#000000",
        },
      },
      min: undefined,
      max: undefined,
    },
    yaxis: {
      labels: {
        formatter: (val: number) => formatCurrency(val, selectedCurrency),
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
        formatter: (val: number) => formatCurrency(val, selectedCurrency),
      },
    },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
    },
  };

  // Brush chart options (overview/navigator)
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
            chartData.length > 0
              ? Math.max(
                  chartData[0].x,
                  chartData[chartData.length - 1].x -
                    (timeGrouping === "daily"
                      ? 90 * 24 * 60 * 60 * 1000 // 90 days
                      : timeGrouping === "monthly"
                      ? 365 * 24 * 60 * 60 * 1000 // 1 year
                      : 3 * 365 * 24 * 60 * 60 * 1000) // 3 years
                )
              : undefined,
          max:
            chartData.length > 0
              ? chartData[chartData.length - 1].x
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
    colors: ["#4f46e5"],
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.91,
        opacityTo: 0.1,
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
      },
    },
    yaxis: {
      tickAmount: 2,
      labels: {
        show: false,
      },
    },
    grid: {
      borderColor: darkMode ? "#374151" : "#e5e7eb",
    },
  };

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <select
                  value={timeGrouping}
                  onChange={(e) =>
                    setTimeGrouping(e.target.value as TimeGrouping)
                  }
                  className="select select-bordered select-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <h2 className="card-title text-2xl">
                  Spending History over time
                </h2>
              </div>
              <p className="text-sm text-base-content/70 mb-4">
                Use the brush chart below to zoom and pan through your spending
                history
              </p>
            </div>
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

          <div className="flex flex-col gap-4">
            {/* Main detail chart */}
            <div>
              <Chart
                options={mainChartOptions}
                series={series}
                type="area"
                width="100%"
                height="400"
              />
            </div>

            {/* Brush/navigator chart */}
            <div>
              <Chart
                options={brushChartOptions}
                series={series}
                type="area"
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
