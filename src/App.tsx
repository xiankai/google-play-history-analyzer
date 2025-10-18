import { useState, useEffect } from "react";
import { PurchaseData, ParsedPurchase } from "./types";
import TableView from "./components/TableView";
import PieChartView from "./components/PieChartView";
import TimelineChartView from "./components/TimelineChartView";
import sampleData from "../public/sample-purchase-history.json";

type ViewMode = "table" | "pie-chart" | "timeline";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [purchases, setPurchases] = useState<ParsedPurchase[]>([]);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [conversionRates, setConversionRates] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const parseInvoicePrice = (
    invoicePrice?: string
  ): { amount: number; currency: string } => {
    if (!invoicePrice) {
      return { amount: 0, currency: "" };
    }

    // Match any string before a number
    const match = invoicePrice.match(/^([^\d]*)([\d.,]+)/);

    if (!match) {
      return { amount: 0, currency: "" };
    }

    const [, currencyStr, numStr] = match;
    const amount = parseFloat(numStr.replace(/,/g, ""));

    return {
      amount,
      currency: amount > 0 ? currencyStr.trim() : "",
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError("");

      const text = await uploadedFile.text();
      const data: PurchaseData[] = JSON.parse(text);
      analyzeData(data);
    }
  };

  const analyzeData = async (data: PurchaseData[]) => {
    try {
      const parsed: ParsedPurchase[] = data.map((item) => {
        const { amount, currency } = parseInvoicePrice(
          item.purchaseHistory.invoicePrice
        );

        const fullTitle = item.purchaseHistory.doc.title;
        // Extract app name from brackets for in-app purchases
        const appNameMatch = fullTitle.match(/\(([^)]+)\)$/);
        const appName = appNameMatch ? appNameMatch[1] : "";
        const title = fullTitle.replace(/\s*\([^)]+\)$/, "").trim();

        return {
          title,
          amount,
          currency,
          date: new Date(
            item.purchaseHistory.purchaseTime
          ).toLocaleDateString(),
          documentType: item.purchaseHistory.doc.documentType,
          appName,
        };
      });

      setPurchases(parsed);
      setSelectedCurrency(parsed.length > 0 ? parsed[0].currency : "");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(
        "Failed to parse JSON file. Please ensure it's a valid Google Play purchase history file."
      );
      console.error(err);
    }
  };

  const loadSampleData = () => {
    analyzeData(sampleData as PurchaseData[]);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {showSuccess && (
        <div className="toast toast-top toast-end z-10">
          <div className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {file && <span>File uploaded: {file.name}</span>}
          </div>
        </div>
      )}

      {error && (
        <div className="toast toast-top toast-end z-10">
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="btn btn-sm btn-circle btn-ghost"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <span className="font-bold text-xl">
            Google Play History Analyzer
          </span>
          {purchases.length > 0 && (
            <span
              className="btn btn-ghost text-sm ml-4"
              onClick={() => setPurchases([])}
            >
              Reset selection
            </span>
          )}
        </div>
        <div className="flex-none gap-2">
          <a
            href="https://github.com/xiankai/google-play-history-analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-circle"
            aria-label="GitHub Repository"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <label className="btn btn-ghost btn-circle swap swap-rotate">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <svg
              className="swap-off fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-on fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {purchases.length === 0 && (
          <div className="hero bg-base-100 rounded-lg shadow-xl">
            <div className="hero-content text-center">
              <div className="">
                <h1 className="text-5xl font-bold">
                  Google Play History Analyzer
                </h1>
                <p className="py-4">
                  Upload your Google Play purchase history JSON file to get
                  insights into your app purchases and spending.
                </p>

                <div className="text-left max-w-2xl mx-auto mt-4 mb-4">
                  <p className="mb-2">
                    To use this tool, you'll need to export your Google Play
                    purchase history first:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://takeout.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary"
                      >
                        Google Takeout
                      </a>
                    </li>
                    <li>Deselect all and select only "Play Store"</li>
                    <li>Choose JSON format for the export</li>
                    <li>Download and extract your data</li>
                    <li>
                      Look for the purchase history JSON file (typically named{" "}
                      <code className="bg-base-200 px-1 rounded">
                        Purchase History.json
                      </code>
                      )
                    </li>
                    <li>Upload this file to the analyzer</li>
                  </ol>
                </div>

                <div className="form-control max-w-xs mx-auto">
                  <label className="label">
                    <span className="label-text">
                      Pick your Purchase History.json file
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="file-input file-input-bordered file-input-primary w-full"
                  />
                </div>

                <div className="mt-6">
                  <p className="text-sm text-base-content/70">
                    Don't have a file exported yet?{" "}
                    <button
                      onClick={loadSampleData}
                      className="link link-primary font-semibold"
                    >
                      Click here to see what it looks like with sample data
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {purchases.length > 0 && (
          <>
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setViewMode("table")}
                className={`btn ${
                  viewMode === "table" ? "btn-primary" : "btn-outline"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode("pie-chart")}
                className={`btn ${
                  viewMode === "pie-chart" ? "btn-primary" : "btn-outline"
                }`}
              >
                App Breakdown
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`btn ${
                  viewMode === "timeline" ? "btn-primary" : "btn-outline"
                }`}
              >
                Timeline
              </button>
            </div>

            {viewMode === "table" && <TableView purchases={purchases} />}
            {viewMode === "pie-chart" && (
              <PieChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                conversionRates={conversionRates}
                setConversionRates={setConversionRates}
                darkMode={darkMode}
              />
            )}
            {viewMode === "timeline" && (
              <TimelineChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                conversionRates={conversionRates}
                setConversionRates={setConversionRates}
                darkMode={darkMode}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
