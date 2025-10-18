# Google Play History Analyzer

A simple web application for visualizing and analyzing your Google Play Store purchase history. Gain insights into your spending patterns across apps, time periods, and multiple currencies.

## Features

### 1. Pie Chart View with Drilldown

Visualize your spending breakdown by application with an interactive pie chart that supports drill-down functionality.

- **App-Level Overview**: See your total spending distributed across all apps with automatic grouping of small purchases into an "Others" category (bottom 5%)
- **Drilldown to Purchases**: Click on any app to drill down into specific purchases and in-app items
- **Smart Aggregation**: Automatically consolidates minor purchases to keep charts readable while maintaining accuracy
- **Interactive Labels**: Each slice displays the app name and total amount spent for quick reference

### 2. Timeline View with Brush Navigation

Track your spending over time with a dual-chart timeline interface featuring multiple time granularities.

- **Multiple Time Groupings**: Switch between daily, monthly, and yearly views to analyze spending patterns at different scales
- **Brush Chart Navigation**: Use the bottom overview chart to pan and zoom through your entire purchase history
- **Detail Chart**: The main chart displays your selected time range with full interactivity
- **Smart Defaults**:
  - Daily view: Shows last 90 days by default
  - Monthly view: Shows last year by default
  - Yearly view: Shows last 3 years by default
- **Visual Insights**: Area chart with gradient fill makes it easy to identify spending trends and spikes

### 3. Currency Conversion Support

Convert your purchase history to any currency for unified reporting and comparison.

- **Multi-Currency Support**: Works with all currencies found in your purchase history
- **Real-Time Conversion**: Select your preferred currency from a dropdown and see all values update instantly
- **Automatic Rate Fetching**: Exchange rates are fetched automatically from currency.js.org
- **Persistent Rates**: Conversion rates are cached to improve performance

**Important Disclaimer**: Currency conversions use current exchange rates, not historical rates from the time of purchase. The converted values are for reference purposes only and may not reflect the actual amounts charged at the time of transaction.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/google-play-history-analyzer.git
cd google-play-history-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Obtaining Your Google Play Purchase History

To use this analyzer, you'll need to export your Google Play purchase history:

1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all and select only "Play Store"
3. Choose JSON format for the export
4. Download and extract your data
5. Look for the purchase history JSON file (typically named `Purchase History.json`)
6. Upload this file to the analyzer

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **ApexCharts** - Interactive charting library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project includes a deployment script for GitHub Pages:

```bash
npm run deploy
```

## Privacy

All data processing happens entirely in your browser. Your purchase history is never uploaded to any server, ensuring complete privacy and security of your financial data.
