import { useState, useEffect } from "react";
import { PurchaseData, ParsedPurchase } from "./types";
import TableView from "./components/TableView";
import PieChartView from "./components/PieChartView";
import BarChartView from "./components/BarChartView";

type ViewMode = "table" | "pie" | "bar";

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

  return (
    <div className="min-h-screen bg-base-200">
      {showSuccess && (
        <div className="toast toast-top toast-end">
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
        <div className="toast toast-top toast-end">
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
          <a className="btn btn-ghost text-xl">Google Play History Analyzer</a>
        </div>
        <div className="flex-none">
          <label className="swap swap-rotate">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <svg
              className="swap-off fill-current w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-on fill-current w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="hero bg-base-100 rounded-lg shadow-xl">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Analyze Your History</h1>
              <p className="py-6">
                Upload your Google Play purchase history JSON file to get
                insights into your app purchases and spending.
              </p>

              <div className="form-control w-full">
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
            </div>
          </div>
        </div>

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
                onClick={() => setViewMode("pie")}
                className={`btn ${
                  viewMode === "pie" ? "btn-primary" : "btn-outline"
                }`}
              >
                App Breakdown
              </button>
              <button
                onClick={() => setViewMode("bar")}
                className={`btn ${
                  viewMode === "bar" ? "btn-primary" : "btn-outline"
                }`}
              >
                Monthly Spending
              </button>
            </div>

            {viewMode === "table" && <TableView purchases={purchases} />}
            {viewMode === "pie" && (
              <PieChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                conversionRates={conversionRates}
                setConversionRates={setConversionRates}
              />
            )}
            {viewMode === "bar" && (
              <BarChartView
                purchases={purchases}
                selectedCurrency={selectedCurrency}
                setSelectedCurrency={setSelectedCurrency}
                conversionRates={conversionRates}
                setConversionRates={setConversionRates}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
