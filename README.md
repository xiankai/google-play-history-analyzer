# Google Play History Analyzer

A simple web application for visualizing and analyzing your Google Play Store purchase history. Gain insights into your spending patterns across apps, time periods, and multiple currencies.

## Features

### 1. Pie Chart View with Drilldown

Visualize your spending breakdown by application with interactive pie charts with drill-down functionality.

- **App-Level Overview**: See your total spending distributed across all apps with automatic grouping of small purchases into an "Others" category (bottom 5%)
- **Drilldown to Purchases**: Click on any app slice to drill down into specific purchases and in-app items
- **Smart Aggregation**: Automatically consolidates minor purchases to keep charts readable while maintaining accuracy

### 2. Timeline View with Brush Navigation

Track your spending over time with a dual-chart timeline interface featuring vertical bar charts and multiple time granularities.

- **Multiple Time Groupings**: Switch between daily, monthly, and yearly views to analyze spending patterns at different scales
- **Brush Chart Navigation**: Use the bottom overview chart to pan and zoom through your entire purchase history

### 3. Multi-Currency Display

View and analyze purchases across multiple currencies.

- **Currency Selector**: Choose between "All currencies" to see separate breakdowns per currency, or select a specific currency to filter

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
