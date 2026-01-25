'use client';

import { useState } from 'react';
import { FilterState } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterState, value: string | number | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      minEmployees: 0,
      maxEmployees: 1000,
      minEquity: 0,
      maxEquity: 50000000,
      minIncome: -1000000,
      maxIncome: 10000000,
      highSuccessionRiskOnly: false,
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.minEmployees > 0 ||
    filters.maxEmployees < 1000 ||
    filters.minEquity > 0 ||
    filters.maxEquity < 50000000 ||
    filters.minIncome > -1000000 ||
    filters.maxIncome < 10000000 ||
    filters.highSuccessionRiskOnly;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="px-4 py-3">
        {/* Search and Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder="Search companies..."
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Quick Filter Chips */}
          <button
            onClick={() => handleChange('highSuccessionRiskOnly', !filters.highSuccessionRiskOnly)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              filters.highSuccessionRiskOnly
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            🔴 High Succession Risk
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${
              isExpanded || hasActiveFilters
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded-full">
                {[
                  filters.searchQuery,
                  filters.minEmployees > 0 || filters.maxEmployees < 1000,
                  filters.minEquity > 0 || filters.maxEquity < 50000000,
                  filters.minIncome > -1000000 || filters.maxIncome < 10000000,
                  filters.highSuccessionRiskOnly,
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Results Count */}
          <span className="text-sm text-gray-500 ml-auto">
            {filteredCount === totalCount
              ? `${totalCount} companies`
              : `${filteredCount} of ${totalCount} companies`}
          </span>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employees Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employees: {filters.minEmployees} - {filters.maxEmployees}+
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filters.minEmployees}
                    onChange={(e) => handleChange('minEmployees', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.maxEmployees}
                    onChange={(e) => handleChange('maxEmployees', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Equity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equity: {formatCurrency(filters.minEquity)} - {formatCurrency(filters.maxEquity)}
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.minEquity}
                    onChange={(e) => handleChange('minEquity', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="500000"
                    value={filters.maxEquity}
                    onChange={(e) => handleChange('maxEquity', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Net Income Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Net Income: {formatCurrency(filters.minIncome)} - {formatCurrency(filters.maxIncome)}
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="-1000000"
                    max="5000000"
                    step="50000"
                    value={filters.minIncome}
                    onChange={(e) => handleChange('minIncome', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.maxIncome}
                    onChange={(e) => handleChange('maxIncome', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
