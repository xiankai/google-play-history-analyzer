import { useState, useEffect } from "react";
import { PurchaseData, ParsedPurchase } from "./types";
import TableView from "./components/TableView";
import PieChartView from "./components/PieChartView";
import TimelineChartView from "./components/TimelineChartView";
import TotalSpent from "./components/TotalSpent";
import CurrencyDisplay from "./components/CurrencyDisplay";
import GithubIcon from "./components/icons/GithubIcon";
import SunIcon from "./components/icons/SunIcon";
import MoonIcon from "./components/icons/MoonIcon";
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
    setFile({ name: "sample-purchase-history.json" } as File);
    analyzeData(sampleData as PurchaseData[]);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {showSuccess && (
        <div className="toast toast-top toast-center z-10">
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
        <div className="toast toast-top toast-center z-10">
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
        <div className="flex-none gap-4">
          {purchases.length > 0 && (
            <>
              <CurrencyDisplay
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
              />
              <TotalSpent
                purchases={purchases}
                selectedCurrency={selectedCurrency}
              />
            </>
          )}
          <div className="flex gap-2">
            <a
              href="https://github.com/xiankai/google-play-history-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-circle"
              aria-label="GitHub Repository"
            >
              <GithubIcon />
            </a>
            <label className="btn btn-ghost btn-circle swap swap-rotate">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <SunIcon />
              <MoonIcon />
            </label>
          </div>
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
                      Upload your Purchase History.json file
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
            <div className="flex justify-center gap-2">
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
                Spending Breakdown by App
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`btn ${
                  viewMode === "timeline" ? "btn-primary" : "btn-outline"
                }`}
              >
                Spending History over time
              </button>
            </div>

            {viewMode === "table" && <TableView purchases={purchases} />}
            {viewMode === "pie-chart" && (
              <PieChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                darkMode={darkMode}
              />
            )}
            {viewMode === "timeline" && (
              <TimelineChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
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
