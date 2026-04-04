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
git clone https://github.com/xiankai/google-play-history-analyzer.git
cd google-play-history-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Google API credentials:
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID
- `VITE_GOOGLE_API_KEY`: Your Google API Key (for Picker API)

See [Getting Google API Credentials](#getting-google-api-credentials) for instructions.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Obtaining Your Google Play Purchase History

To use this analyzer, you'll need to export your Google Play purchase history:

1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all and select only "Google Play Store"
3. Ensure that the export is in JSON format
4. Set the destination as "Send download link via email" or "Add to Drive"
5. Wait for the export to complete.
6. If "Send download link via email" was selected,

    a. Download the file and unzip it.
    b. Look for the purchase history JSON file (typically named `Purchase History.json`)
    c. Upload this file to the analyzer
7. If "Add to Drive" was selected,

    a. On this page, select "Import from Google Drive" and login.
    b. Locate the Google Takeout files (typically a `Takeout` folder and `takeout-xxx.zip` files)
    c. Select the latest exported file.

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

## Getting Google API Credentials

To enable the Google Drive integration feature, you need to set up Google Cloud credentials:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Enable Required APIs

1. Go to **APIs & Services** > **Library**
2. Search for and enable:
   - **Google Picker API**
   - **Google Drive API**

### 3. Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (for local development)
   - `https://yourusername.github.io` (for production)
5. Copy the **Client ID** (starts with `...apps.googleusercontent.com`)

### 4. Create API Key

1. In **Credentials**, click **Create Credentials** > **API key**
2. Click **Edit API key** to restrict it:
   - Under **API restrictions**, select **Restrict key**
   - Select **Google Picker API**
   - Under **Website restrictions**, add your domains
3. Copy the **API key**

## Deployment

### Option 1: Manual Deployment (Local)

1. Create a `.env` file with your credentials (see [Installation](#installation))
2. Run the deployment script:

```bash
npm run deploy
```

### Option 2: Automatic Deployment (GitHub Actions)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

**Setup:**

1. Enable GitHub Pages in your repository:
   - Go to **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**

2. Add environment variables:
   - Go to **Settings** > **Environments** > **gh-pages**
   - Under **Environment variables**, add:
     - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
     - `GOOGLE_API_KEY`: Your Google API Key

3. Push to `main` branch - the workflow will build and deploy automatically

The workflow uses the official GitHub Pages deployment actions with commit hash pinning for security. It runs on every push to the main branch and prevents concurrent deployments.

## Privacy

All data processing happens entirely in your browser. Your purchase history is never uploaded to any server, ensuring complete privacy and security of your financial data.
