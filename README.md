# Bought - SME Succession Marketplace

An Airbnb-style platform for discovering SME succession opportunities in Hamburg, Germany.

## Overview

Bought helps identify and visualize SME succession opportunities by displaying companies with aging shareholders who may be looking for successors. The platform features:

- Interactive map with color-coded succession risk markers
- Company cards with key financial metrics
- Detailed company profiles with financial charts
- Shareholder age analysis and succession risk indicators
- Search and filter functionality

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (Airbnb-inspired design)
- **Supabase** (Database)
- **Mapbox GL** (Interactive maps & geocoding)
- **Recharts** (Data visualization)

## Project Structure

```
Bought/
└── frontend/
    ├── app/
    │   ├── company/[id]/   # Company detail page
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx        # Home - split view
    ├── components/
    │   ├── ui/             # Badge, MetricCard
    │   ├── CompanyCard.tsx
    │   ├── CompanyMap.tsx
    │   ├── FinancialCharts.tsx
    │   ├── SearchFilters.tsx
    │   └── ShareholderInfo.tsx
    ├── lib/
    │   ├── supabase.ts     # Supabase client
    │   ├── types.ts        # TypeScript interfaces
    │   └── utils.ts        # Utility functions
    └── package.json
```

## Setup

### Prerequisites

- Node.js 18+
- Supabase account with `Hamburg Targets` table
- Mapbox account (free tier)

### Environment Variables

Create `.env.local` in the frontend folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Installation

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup

Ensure your `Hamburg Targets` table has a SELECT policy for anonymous access:

```sql
CREATE POLICY "Allow anonymous read access"
ON "Hamburg Targets"
FOR SELECT
TO anon
USING (true);
```

## Features

### Home Page (Split View)
- Left: Scrollable grid of company cards
- Right: Interactive Mapbox map with markers
- Hover sync between cards and map

### Filters
- Text search (company name, city)
- Employee count range
- Equity range
- Net income range
- High succession risk toggle

### Company Detail Page
- Key metrics (Equity, Assets, Income, Employees)
- Balance sheet chart
- Asset breakdown pie chart
- Profitability metrics
- Shareholder table with age calculation
- Succession risk indicators

### Succession Risk Indicators
- 🔴 High: Shareholder age 65+
- 🟡 Medium: Shareholder age 55-64
- 🟢 Low: Shareholder age <55

## Database Schema

The `Hamburg Targets` table should have:

| Column | Type |
|--------|------|
| id | bigint |
| company_name | text |
| year | numeric |
| equity_eur | numeric |
| total_assets_eur | numeric |
| net_income_eur | numeric |
| retained_earnings_eur | numeric |
| liabilities_eur | numeric |
| receivables_eur | numeric |
| cash_assets_eur | numeric |
| employee_count | numeric |
| shareholder_names | text |
| shareholder_dobs | text |
| shareholder_details | jsonb |
| last_ownership_change_year | integer |
| address_street | text |
| address_zip | text |
| address_city | text |
| address_country | text |

## License

Private project.
