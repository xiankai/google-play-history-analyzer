import { useState } from "react";
import { ParsedPurchase } from "../types";

interface CurrencyDropdownProps {
  purchases: ParsedPurchase[];
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  conversionRates: Record<string, Record<string, string>>;
  setConversionRates: (rates: Record<string, Record<string, string>>) => void;
}

export default function CurrencyDropdown({
  purchases,
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
}: CurrencyDropdownProps) {
  const currencies = Array.from(
    new Set(purchases.map((p) => p.currency))
  ).filter(Boolean);

  const otherCurrencies = currencies.filter((c) => c !== selectedCurrency);

  const formatRate = (num: number): string => {
    const fixed2dp = num.toFixed(2);
    const sigFig2 = String(Number(num.toPrecision(2)));

    // Use whichever gives more meaningful digits (not "0.00")
    if (fixed2dp === "0.00") {
      return sigFig2;
    }

    // Count non-zero digits after decimal point
    const dpDigits = fixed2dp.split(".")[1]?.replace(/0+$/, "").length || 0;
    const sfDigits = sigFig2.split(".")[1]?.replace(/0+$/, "").length || 0;

    return sfDigits > dpDigits ? sigFig2 : fixed2dp;
  };

  const handleValueInSelectedChange = (currency: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) {
      return;
    }

    const directRate = formatRate(numValue);
    const inverseRate = formatRate(1 / numValue);

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

    const inverseRate = formatRate(1 / numValue);
    const directRate = formatRate(numValue);

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
      <p className="text-lg mb-4 text-right">
        <span className="font-bold">Currency to calculate values in: </span>
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
        <div className="text-xs">
          Filling in the currency conversion rates will give a more accurate
          estimate of the combined value of purchases in different currencies
        </div>
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
                      key={`${currency}-${selectedCurrency}-${conversionRates[currency]?.[selectedCurrency]}`}
                      defaultValue={
                        conversionRates[currency]?.[selectedCurrency] || ""
                      }
                      onBlur={(e) =>
                        handleValueInSelectedChange(currency, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleValueInSelectedChange(
                            currency,
                            e.currentTarget.value
                          );
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          e.currentTarget.value =
                            conversionRates[currency]?.[selectedCurrency] || "";
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
                      key={`${selectedCurrency}-${currency}-${conversionRates[selectedCurrency]?.[currency]}`}
                      defaultValue={
                        conversionRates[selectedCurrency]?.[currency] || ""
                      }
                      onBlur={(e) =>
                        handleValueOfSelectedChange(currency, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleValueOfSelectedChange(
                            currency,
                            e.currentTarget.value
                          );
                          e.currentTarget.blur();
                        } else if (e.key === "Escape") {
                          e.currentTarget.value =
                            conversionRates[selectedCurrency]?.[currency] || "";
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
