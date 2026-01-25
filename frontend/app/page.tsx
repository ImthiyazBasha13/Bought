'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HamburgTarget, FilterState } from '@/lib/types';
import { getHighestSuccessionRisk } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import CompanyMap from '@/components/CompanyMap';
import SearchFilters from '@/components/SearchFilters';

const initialFilters: FilterState = {
  searchQuery: '',
  minEmployees: 0,
  maxEmployees: 1000,
  minEquity: 0,
  maxEquity: 50000000,
  minIncome: -1000000,
  maxIncome: 10000000,
  highSuccessionRiskOnly: false,
};

export default function Home() {
  const router = useRouter();
  const [companies, setCompanies] = useState<HamburgTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<number | null>(null);

  // Fetch companies from Supabase
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Hamburg Targets')
          .select('*')
          .order('company_name', { ascending: true });

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = company.company_name?.toLowerCase().includes(query);
        const cityMatch = company.address_city?.toLowerCase().includes(query);
        if (!nameMatch && !cityMatch) return false;
      }

      // Employee count
      const employees = company.employee_count || 0;
      if (employees < filters.minEmployees || employees > filters.maxEmployees) {
        return false;
      }

      // Equity
      const equity = company.equity_eur || 0;
      if (equity < filters.minEquity || equity > filters.maxEquity) {
        return false;
      }

      // Net income
      const income = company.net_income_eur || 0;
      if (income < filters.minIncome || income > filters.maxIncome) {
        return false;
      }

      // High succession risk only
      if (filters.highSuccessionRiskOnly) {
        const risk = getHighestSuccessionRisk(company);
        if (risk !== 'high') return false;
      }

      return true;
    });
  }, [companies, filters]);

  const handleMarkerClick = (company: HamburgTarget) => {
    router.push(`/company/${company.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={companies.length}
        filteredCount={filteredCompanies.length}
      />

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Company List */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No companies found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={() => setFilters(initialFilters)}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  isHovered={hoveredCompanyId === company.id}
                  onHover={setHoveredCompanyId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="hidden lg:block lg:w-1/2 sticky top-0">
          <CompanyMap
            companies={filteredCompanies}
            hoveredCompanyId={hoveredCompanyId}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={setHoveredCompanyId}
          />
        </div>
      </div>
    </div>
  );
}
