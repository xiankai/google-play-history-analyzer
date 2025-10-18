import { useState } from "react";
import { ParsedPurchase } from "../types";

interface CurrencyDropdownProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
}

export default function CurrencyDropdown({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
}: CurrencyDropdownProps) {
  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  // Map structure: { fromCurrency: { toCurrency: "rate" } }
  // Both directions stored as strings with 2 decimal places
  const [conversionRates, setConversionRates] = useState<
    Record<string, Record<string, string>>
  >({});

  const otherCurrencies = currencies.filter((c) => c !== selectedCurrency);

  const handleValueInSelectedChange = (currency: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) {
      return;
    }

    const directRate = numValue.toPrecision(2);
    const inverseRate = (1 / numValue).toPrecision(2);

    setConversionRates((prev) => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        [selectedCurrency]: directRate,
      },
      [selectedCurrency]: {
        ...prev[selectedCurrency],
        [currency]: inverseRate,
      },
    }));
  };

  const handleValueOfSelectedChange = (currency: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) {
      return;
    }

    const inverseRate = (1 / numValue).toPrecision(2);
    const directRate = numValue.toPrecision(2);

    setConversionRates((prev) => ({
      ...prev,
      [currency]: {
        ...prev[currency],
        [selectedCurrency]: inverseRate,
      },
      [selectedCurrency]: {
        ...prev[selectedCurrency],
        [currency]: directRate,
      },
    }));
  };

  return (
    <div className="form-control">
      <p className="text-lg mb-4">
        Currency:{" "}
        <select
          className="select select-bordered select-sm"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </p>

      {otherCurrencies.length > 0 && (
        <div className="mt-4">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Value in {selectedCurrency}</th>
                <th>Value of {selectedCurrency} in nth currency</th>
              </tr>
            </thead>
            <tbody>
              {otherCurrencies.map((currency) => (
                <tr key={currency}>
                  <td>{currency}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered input-sm w-full"
                      defaultValue={conversionRates[currency]?.[selectedCurrency] || ""}
                      onBlur={(e) =>
                        handleValueInSelectedChange(currency, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleValueInSelectedChange(currency, e.currentTarget.value);
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          e.currentTarget.value = conversionRates[currency]?.[selectedCurrency] || "";
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="Enter rate"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="input input-bordered input-sm w-full"
                      defaultValue={conversionRates[selectedCurrency]?.[currency] || ""}
                      onBlur={(e) =>
                        handleValueOfSelectedChange(currency, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleValueOfSelectedChange(currency, e.currentTarget.value);
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          e.currentTarget.value = conversionRates[selectedCurrency]?.[currency] || "";
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="Enter inverse rate"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
