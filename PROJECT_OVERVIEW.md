📌 Prompt: Lightship Fund Analysis App – Context + Files for Strategy Planning
You're about to help me improve and expand a React-based internal web application called Lightship Fund Analysis. This tool is used monthly by a wealth management team to evaluate the performance of funds on our recommended list and make investment committee decisions.

Please read this prompt carefully and internalize all the context before suggesting next steps. Your job is to go above and beyond and help me build a thoughtful, sustainable, and powerful version of this app. I want you to come up with a structured plan, help me refine it, and then we’ll work through building it together.

🔍 Background – What This App Is For
Each month, I download a spreadsheet of performance data from Raymond James, showing key metrics for 100–150 mutual funds and ETFs. This includes:

Symbol (Ticker)

Product Name

YTD, 1Y, 3Y, 5Y, 10Y performance (%)

Alpha

Sharpe Ratio

Standard Deviation

Net Expense Ratio

Manager Tenure

I then analyze how our firm’s recommended funds performed — both on an absolute basis and relative to their asset class benchmark — to decide which funds to keep, flag, or replace.

🎯 Primary Goals
Analyze and rank all recommended funds using a custom score model (details provided below)

Compare each fund against peer funds in the same asset class and its benchmark ETF

Tag funds automatically based on rules (e.g. low Sharpe, high expense, underperformance)

View funds by asset class to make side-by-side peer comparison easier

Build an admin interface so we can update our internal fund list and benchmarks without uploading config files

Eventually: track monthly history and analyze trends

📊 Key Concepts You Must Understand
1. 🔢 Ranking Score Formula
Each fund is scored from 0–100 using Z-scores of various metrics compared to the average of its asset class. These metrics include:

Metric	Weight
YTD Return	5%
1Y Return	10%
3Y Return	20%
5Y Return	15%
Sharpe Ratio	25%
Std Dev	-10%
Net Expense Ratio	-10%
Manager Tenure	+5%

Each Z-score is multiplied by its weight, summed, and scaled into a 0–100 range.

We need to calculate these scores per asset class every month. This helps us rank each fund within its peer group.

2. 🧭 Benchmarking
Each asset class is assigned a benchmark ETF. For example:

Large Cap Growth → IWF

Intermediate Muni → ITM

Real Estate → RWO

We use these benchmarks to compare the performance of funds in that class. The benchmark rows are included in the monthly fund data, so we can match by ticker and pull their values.

3. 🗂️ Static Config (Built-in)
We maintain a list of:

Recommended funds → each has a symbol, full name, and assigned asset class

Benchmark mappings → asset class → ETF ticker + index name

These are now stored in-app, not uploaded each time. I want to eventually manage them via an admin tab.

🔧 Technical Architecture (Current State)
Frontend built with React and XLSX.js for Excel parsing

Data is loaded by uploading one file per month: FundPerformance.xlsx

Recommended fund list and benchmark mappings are stored in **IndexedDB** (via `dataStore`)

The app has 3 main tabs:

Fund View → Shows all loaded funds with Asset Class, 1Y, Sharpe, etc.

Class View → Choose an Asset Class, see benchmark + peer fund comparison

Admin View → Add/edit recommended funds and benchmark mappings

📦 Files I’m Uploading Along with This Prompt
You’ll have access to all of these files, which are critical context:

## 📊 Project Data Files

The `/data` folder contains sample versions of the real files that power this app. These are provided to help the Codex AI understand how data flows into the app, how funds are categorized, and how scoring works.

| File Name                                | Description                                                                 |
|------------------------------------------|-----------------------------------------------------------------------------|
| `Fund_Performance_Data.csv`              | Monthly Raymond James export of fund performance metrics                   |
| `FundListAssetClasses.csv`               | Maps each fund/ticker to its associated asset class                        |
| `Asset_Class_Benchmarks.csv`             | Maps each asset class to its benchmark ETF and associated index name       |
| `Rank Score Information - Current.docx`  | Internal explanation of the scoring model using weighted Z-scores          |

Please use these files to infer the expected data structure, headers, and use cases throughout the app.


🚨 What I Need From You
Please begin by doing the following:

Carefully review all the files and the prompt.

Propose a clear 8–10 step development plan to enhance this tool from where it is now.

Be realistic, but ambitious.

Prioritize usability, performance insights, and long-term maintainability.

Help me make decisions like:

Should I eventually store monthly history somewhere? (e.g. Supabase, Google Sheets, JSON snapshots?)

What’s the best UX for tagging poor performers?

How can I eventually share or export these results for discussion?

You are my coding partner, not just an assistant. Ask questions if something is unclear. Suggest improvements even if I didn’t ask. Help me refine this vision so we can build something amazing.

Let’s get to work. 💪

---------------------------------

Project Steps and Overview Below:


Lightship Fund Analysis - Comprehensive Development Plan
Project Overview
Building a sophisticated fund analysis tool for monthly investment committee decisions. Starting with a powerful local React application (Phase 1) that will later integrate with Office 365 infrastructure (Phase 2).
Core Business Logic
Z-Score Ranking Algorithm (CRITICAL - This is the heart of the system)
Each fund gets a 0-100 score calculated within its asset class peer group:
Metrics and Weights:
- YTD Return: 2.5%
- 1-Year Return: 5%
- 3-Year Return: 10%
- 5-Year Return: 20%
- 10-Year Return: 10%
- 3Y Sharpe Ratio: 15%
- 3Y Standard Deviation: -10% (negative = penalizes volatility)
- 5Y Standard Deviation: -15%
- Up Capture Ratio 3Y: 7.5%
- Down Capture Ratio 3Y: -10% (negative = penalizes downside capture)
- Alpha 5Y: 5%
- Net Expense Ratio: -2.5%
- Manager Tenure: 2.5%

Process:
1. Group funds by asset class
2. Calculate mean and std dev for each metric within the group
3. Calculate Z-score: (value - mean) / stddev
4. Multiply each Z-score by its weight
5. Sum weighted Z-scores
6. Transform to 0-100 scale where 50 = peer average
Data Architecture
javascript// Core data structures to maintain throughout project

// Monthly snapshot structure
{
  id: 'snapshot_2024_01',
  date: '2024-01-31',
  funds: [
    {
      symbol: 'PRWCX',
      fundName: 'T. Rowe Price Capital Appreciation',
      assetClass: 'Asset Allocation',
      metrics: {
        ytd: 5.2,
        oneYear: 12.3,
        threeYear: 8.7,
        fiveYear: 10.2,
        tenYear: 9.8,
        sharpeRatio3Y: 0.85,
        stdDev3Y: 12.4,
        stdDev5Y: 13.1,
        upCapture3Y: 95,
        downCapture3Y: 85,
        alpha5Y: 1.2,
        expenseRatio: 0.75,
        managerTenure: 15
      },
      scores: {
        raw: 2.45,  // Sum of weighted Z-scores
        final: 72,  // 0-100 scaled score
        percentile: 85  // Percentile within asset class
      },
      tags: ['outperformer', 'consistent'],
      isBenchmark: false,
      isRecommended: true
    }
  ],
  metadata: {
    uploadDate: '2024-02-05',
    uploadedBy: 'user',
    totalFunds: 150,
    recommendedFunds: 32
  }
}

// Configuration structure (persisted)
{
  recommendedFunds: [
    { symbol: 'PRWCX', name: '...', assetClass: '...' }
  ],
  assetClassBenchmarks: {
    'Asset Allocation': { ticker: 'AOM', name: '...' }
  },
  tagRules: [
    { 
      id: 'low_sharpe',
      condition: 'sharpeRatio3Y < benchmarkSharpe * 0.8',
      tag: 'underperforming',
      severity: 'warning'
    }
  ]
}
Phase 1: Local Enhanced Application
Step 1: Core Scoring Engine
Files to modify: Create new src/services/scoring.js
Implement:

Z-score calculation function
Score scaling algorithm (raw score → 0-100)
Percentile ranking within asset class
Handle missing data gracefully (some funds may not have 10Y data)
Store calculated scores with the fund data

Key considerations:

Not all funds have all metrics (e.g., new funds lack 5Y/10Y data)
Use only available metrics and adjust weights proportionally
Benchmark ETFs should get scores but may be excluded from some calculations

Step 2: Enhanced Data Model & Storage
Files to modify: Create src/services/dataStore.js
Implement:

IndexedDB setup for historical snapshots
 Migration from legacy localStorage config (🗸 completed Jun 2025)
Snapshot comparison functions
Data validation layer

Schema design:
javascript// IndexedDB stores
- snapshots: { id, date, funds[], metadata }
- config: { recommendedFunds, benchmarks, tagRules }
- userPreferences: { defaultView, colorScheme, exportSettings }
Step 3: Visual Dashboard Components
Files to create:

src/components/Dashboard/PerformanceHeatmap.jsx
src/components/Dashboard/TopBottomPerformers.jsx
src/components/Dashboard/AssetClassOverview.jsx

Implement:

Color-coded heatmap (red → yellow → green based on percentiles)
Sortable/filterable fund grid with score badges
Asset class summary cards with averages
Visual indicators for benchmarks vs funds

Design system:

Use consistent color scale: Red (#dc2626) → Yellow (#eab308) → Green (#16a34a)
Score badges: 70+ (green), 50-70 (yellow), <50 (red)
Interactive tooltips showing score breakdown

Step 4: Historical Tracking & Trends
Files to create:

src/components/Trends/FundTimeline.jsx
src/services/trendAnalysis.js

Implement:

Line charts showing score trends over time
Fund vs benchmark performance comparison
Identify consistent winners/losers
Month-over-month score changes

Step 5: Smart Tagging System
Files to create:

src/components/Tags/TagManager.jsx
src/services/tagEngine.js

Implement:

Rule-based auto-tagging
Manual tag override capability
Tag history tracking
Bulk tag operations

Default tag rules:
javascript- 'outperformer': score > 70
- 'underperformer': score < 40
- 'expensive': expenseRatio > assetClassAverage * 1.5
- 'high-risk': stdDev5Y > assetClassAverage * 1.2
- 'review-needed': sharpeRatio3Y < benchmarkSharpe * 0.8
Step 6: Export Engine
Files to create:

src/services/exportService.js
src/templates/ (folder for export templates)

Implement:

Excel export with multiple sheets (Overview, By Asset Class, Recommendations)
PDF report generation with charts
PowerPoint deck for investment committee
Email-ready HTML summary

Export formats:

Excel: Full data with conditional formatting
PDF: Executive summary with key insights
PowerPoint: Visual presentation with talking points

Step 7: Advanced Analytics
Files to create:

src/components/Analytics/CorrelationMatrix.jsx
src/services/analytics.js

Implement:

Risk/return scatter plots
Correlation analysis within asset classes
Performance attribution analysis
Monte Carlo simulations for portfolio impact

Step 8: Polish & Performance

Add loading states and progress indicators
Implement data caching strategies
Add keyboard shortcuts
Create comprehensive help documentation
Performance optimization for large datasets

Phase 2: Office 365 Integration (Future)
Architecture for Migration

Abstract data layer to support multiple backends
SharePoint Lists schema matching IndexedDB structure
Graph API integration for authentication
Power Automate flows for scheduled tasks

Key Migration Points

Data access layer uses interfaces (easy to swap backends)
Authentication wrapper (null for local, MSAL for Office 365)
Configuration to toggle between local/cloud mode
Batch upload tool for historical data migration

Technical Standards Throughout Project
Code Organization
src/
  components/
    Dashboard/
    Trends/
    Analytics/
    Tags/
    common/
  services/
    scoring.js
    dataStore.js
    exportService.js
    analytics.js
  utils/
    calculations.js
    formatters.js
    validators.js
  templates/
    excel/
    pdf/
    powerpoint/
State Management

Use React Context for global state (current snapshot, user preferences)
Local component state for UI-specific needs
IndexedDB for persistent storage

Error Handling

Graceful fallbacks for missing data
User-friendly error messages
Validation before calculations
Export error recovery

Performance Targets

Handle 500+ funds without lag
Sub-second score calculations
Smooth animations/transitions
Progressive data loading

Critical Implementation Notes

Always preserve original uploaded data - Never modify the source, create computed fields
Handle Excel quirks - Percentages might be 0.15 or 15, standardize on input
Case-insensitive matching - Symbols like 'voo' vs 'VOO' should match
Benchmark dual role - ETFs are both benchmarks AND funds to be scored
Missing data strategy - New funds won't have 5Y/10Y data, adjust calculations accordingly

Success Metrics

Can process monthly data in <30 seconds
Generates actionable insights automatically
Exports professional-grade reports
Scales to 2+ years of historical data
Zero data loss or corruption