import { useState, useEffect } from "react";
import { VictoryPie } from "victory";
import type { VictorySliceTTargetType } from "victory";
import { ParsedPurchase } from "../types";

interface PieChartViewProps {
  purchases: ParsedPurchase[];
}

export default function PieChartView({ purchases }: PieChartViewProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDarkMode(theme === "dark");
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Filter out N/A amounts and group by app
  const appData = purchases
    .filter((p) => p.amount !== "N/A")
    .reduce((acc, purchase) => {
      const app = purchase.appName || "Other";
      const amount = parseFloat(purchase.amount);
      if (!acc[app]) {
        acc[app] = 0;
      }
      acc[app] += amount;
      return acc;
    }, {} as Record<string, number>);

  // Sort by total and group bottom 5% as "Others"
  const sortedAppData = Object.entries(appData).sort(([, a], [, b]) => b - a);
  const totalAmount = sortedAppData.reduce(
    (sum, [, amount]) => sum + amount,
    0
  );
  const threshold = totalAmount * 0.05;

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

  const appChartData = top95Apps.map(([app, total]) => ({
    x: app,
    y: total,
    label: `${app}\n$${total.toFixed(2)}`,
  }));

  if (othersTotal > 0) {
    appChartData.push({
      x: "Others",
      y: othersTotal,
      label: `Others\n$${othersTotal.toFixed(2)}`,
    });
  }

  // When an app is selected, group by title
  // If "Others" is selected, show all apps that were grouped into Others
  const titleData = selectedApp
    ? selectedApp === "Others"
      ? purchases
          .filter((p) => {
            const app = p.appName || "Other";
            // Check if this app was in the Others group
            return (
              !top95Apps.some(([topApp]) => topApp === app) &&
              p.amount !== "N/A"
            );
          })
          .reduce((acc, purchase) => {
            const app = purchase.appName || "Other";
            const amount = parseFloat(purchase.amount);
            if (!acc[app]) {
              acc[app] = 0;
            }
            acc[app] += amount;
            return acc;
          }, {} as Record<string, number>)
      : purchases
          .filter((p) => p.appName === selectedApp && p.amount !== "N/A")
          .reduce((acc, purchase) => {
            const title = purchase.title || "Unknown";
            const amount = parseFloat(purchase.amount);
            if (!acc[title]) {
              acc[title] = 0;
            }
            acc[title] += amount;
            return acc;
          }, {} as Record<string, number>)
    : null;

  // Apply same 95% logic to title data
  let titleChartData: { x: string; y: number; label: string }[] = [];
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

    titleChartData = top95Titles.map(([title, total]) => ({
      x: title,
      y: total,
      label: `${title}\n$${total.toFixed(2)}`,
    }));

    if (titleOthersTotal > 0) {
      titleChartData.push({
        x: "Others",
        y: titleOthersTotal,
        label: `Others\n$${titleOthersTotal.toFixed(2)}`,
      });
    }
  }

  const totalSpent = appChartData.reduce((sum, item) => sum + item.y, 0);
  const targets: VictorySliceTTargetType[] = ["data", "labels"];

  return (
    <div className="mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            Spending Breakdown by App
          </h2>
          <p className="text-lg mb-4">
            Total Spent:{" "}
            <span className="font-bold">${totalSpent.toFixed(2)}</span>
          </p>

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
              <VictoryPie
                data={appChartData}
                colorScale="qualitative"
                width={600}
                height={400}
                labelRadius={({ innerRadius }) =>
                  ((innerRadius as number) || 100) + 60
                }
                events={targets.map((target) => ({
                  target,
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target,
                          mutation: (props) => {
                            setSelectedApp(props.datum.x);
                          },
                        },
                      ];
                    },
                    onMouseOver: () => {
                      return [
                        {
                          target,
                          mutation: (props) => ({
                            style: {
                              ...props.style,
                              fillOpacity: 0.5,
                            },
                          }),
                        },
                      ];
                    },
                    onMouseOut: () => {
                      return [
                        {
                          target,
                          mutation: () => {},
                        },
                      ];
                    },
                  },
                }))}
                style={{
                  data: {
                    cursor: "pointer",
                  },
                  labels: {
                    cursor: "pointer",
                    fill: isDarkMode ? "white" : "black",
                  },
                }}
              />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">{selectedApp}</h3>
              <div className="flex justify-center">
                <VictoryPie
                  data={titleChartData}
                  colorScale="qualitative"
                  width={600}
                  height={400}
                  labelRadius={({ innerRadius }) =>
                    ((innerRadius as number) || 100) + 60
                  }
                  events={targets.map((target) => ({
                    target,
                    eventHandlers: {
                      onClick: () => {
                        return [
                          {
                            target,
                            mutation: (props) => {
                              setSelectedApp(props.datum.x);
                            },
                          },
                        ];
                      },
                      onMouseOver: () => {
                        return [
                          {
                            target,
                            mutation: (props) => ({
                              style: {
                                ...props.style,
                                fillOpacity: 0.5,
                              },
                            }),
                          },
                        ];
                      },
                      onMouseOut: () => {
                        return [
                          {
                            target,
                            mutation: () => {},
                          },
                        ];
                      },
                    },
                  }))}
                  style={{
                    data: {
                      cursor: "pointer",
                    },
                    labels: {
                      cursor: "pointer",
                      fill: isDarkMode ? "white" : "black",
                    },
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
