export interface HamburgTarget {
  id: number;
  created_at: string;
  company_name: string | null;
  year: number | null;
  equity_eur: number | null;
  total_assets_eur: number | null;
  net_income_eur: number | null;
  retained_earnings_eur: number | null;
  liabilities_eur: number | null;
  receivables_eur: number | null;
  cash_assets_eur: number | null;
  employee_count: number | null;
  shareholder_names: string | null;
  shareholder_dobs: string | null;
  shareholder_details: ShareholderDetail[] | null;
  last_ownership_change_year: number | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string | null;
}

export interface ShareholderDetail {
  name?: string;
  dob?: string;
  percentage?: number;
  ownership_percentage?: number;
  role?: string;
}

export interface ParsedShareholder {
  name: string;
  dob: string | null;
  age: number | null;
  successionRisk: 'high' | 'medium' | 'low';
  percentage: number | null;
}

export interface CompanyWithCoordinates extends HamburgTarget {
  latitude?: number;
  longitude?: number;
}

export interface FilterState {
  searchQuery: string;
  minEmployees: number;
  maxEmployees: number;
  minEquity: number;
  maxEquity: number;
  minIncome: number;
  maxIncome: number;
  highSuccessionRiskOnly: boolean;
}

// Supabase Database types
export interface Database {
  public: {
    Tables: {
      'Hamburg Targets': {
        Row: HamburgTarget;
        Insert: Omit<HamburgTarget, 'id' | 'created_at'>;
        Update: Partial<Omit<HamburgTarget, 'id' | 'created_at'>>;
      };
    };
  };
}
