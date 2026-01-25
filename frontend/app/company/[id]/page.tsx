'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, formatNumber, getFullAddress, getHighestSuccessionRisk } from '@/lib/utils';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';
import FinancialCharts from '@/components/FinancialCharts';
import ShareholderInfo from '@/components/ShareholderInfo';

export default function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [company, setCompany] = useState<HamburgTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Hamburg Targets')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Company Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error || 'This company does not exist.'}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const successionRisk = getHighestSuccessionRisk(company);
  const yearsSinceChange = company.last_ownership_change_year
    ? new Date().getFullYear() - company.last_ownership_change_year
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to listings
            </Link>
          </div>

          {/* Company Header */}
          <div className="pb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {company.company_name || 'Unnamed Company'}
                </h1>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{getFullAddress(company)}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={successionRisk}>
                  {successionRisk === 'high' && '🔴 High Succession Risk'}
                  {successionRisk === 'medium' && '🟡 Medium Risk'}
                  {successionRisk === 'low' && '🟢 Low Risk'}
                </Badge>
                {yearsSinceChange && yearsSinceChange > 10 && (
                  <Badge variant="neutral">
                    {yearsSinceChange} years since ownership change
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12">
          <MetricCard
            label="Equity"
            value={formatCurrency(company.equity_eur)}
            subtext={`Year ${company.year || 'N/A'}`}
            className="shadow-lg"
          />
          <MetricCard
            label="Total Assets"
            value={formatCurrency(company.total_assets_eur)}
            className="shadow-lg"
          />
          <MetricCard
            label="Net Income"
            value={formatCurrency(company.net_income_eur)}
            trend={company.net_income_eur ? (company.net_income_eur > 0 ? 'positive' : 'negative') : undefined}
            className="shadow-lg"
          />
          <MetricCard
            label="Employees"
            value={company.employee_count ? formatNumber(company.employee_count) : 'N/A'}
            className="shadow-lg"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Financial Charts */}
            <FinancialCharts company={company} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Company Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Details
              </h3>
              <dl className="space-y-4">
                <DetailItem label="Data Year" value={company.year?.toString() || 'N/A'} />
                <DetailItem
                  label="Last Ownership Change"
                  value={
                    company.last_ownership_change_year
                      ? `${company.last_ownership_change_year} (${yearsSinceChange} years ago)`
                      : 'N/A'
                  }
                />
                <DetailItem label="Receivables" value={formatCurrency(company.receivables_eur)} />
                <DetailItem label="Cash Assets" value={formatCurrency(company.cash_assets_eur)} />
                <DetailItem label="Liabilities" value={formatCurrency(company.liabilities_eur)} />
                <DetailItem label="Retained Earnings" value={formatCurrency(company.retained_earnings_eur)} />
              </dl>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location
              </h3>
              <div className="space-y-2 text-sm">
                {company.address_street && (
                  <p className="text-gray-700">{company.address_street}</p>
                )}
                <p className="text-gray-700">
                  {[company.address_zip, company.address_city].filter(Boolean).join(' ')}
                </p>
                {company.address_country && (
                  <p className="text-gray-500">{company.address_country}</p>
                )}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(company))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Google Maps
              </a>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                Interested in this opportunity?
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Contact us to learn more about this succession opportunity.
              </p>
              <button className="w-full bg-white text-primary font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                Request Information
              </button>
            </div>
          </div>
        </div>

        {/* Full Width - Shareholders */}
        <div className="mt-8">
          <ShareholderInfo company={company} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
