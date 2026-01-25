'use client';

import Link from 'next/link';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, getShortAddress, getHighestSuccessionRisk, formatNumber } from '@/lib/utils';
import Badge from './ui/Badge';

interface CompanyCardProps {
  company: HamburgTarget;
  isHovered?: boolean;
  onHover?: (id: number | null) => void;
}

export default function CompanyCard({ company, isHovered, onHover }: CompanyCardProps) {
  const successionRisk = getHighestSuccessionRisk(company);
  const yearsSinceChange = company.last_ownership_change_year
    ? new Date().getFullYear() - company.last_ownership_change_year
    : null;

  return (
    <Link href={`/company/${company.id}`}>
      <div
        className={`group bg-white rounded-xl border transition-all duration-200 cursor-pointer ${
          isHovered
            ? 'border-primary shadow-lg scale-[1.02]'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onMouseEnter={() => onHover?.(company.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {company.company_name || 'Unnamed Company'}
            </h3>
            <p className="text-gray-300 text-sm truncate">
              {getShortAddress(company)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={successionRisk}>
              {successionRisk === 'high' && '🔴 High Succession Risk'}
              {successionRisk === 'medium' && '🟡 Medium Risk'}
              {successionRisk === 'low' && '🟢 Low Risk'}
            </Badge>
            {yearsSinceChange && yearsSinceChange > 10 && (
              <Badge variant="neutral">
                {yearsSinceChange}y since change
              </Badge>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricItem
              label="Equity"
              value={formatCurrency(company.equity_eur)}
            />
            <MetricItem
              label="Net Income"
              value={formatCurrency(company.net_income_eur)}
              isPositive={company.net_income_eur ? company.net_income_eur > 0 : undefined}
            />
            <MetricItem
              label="Total Assets"
              value={formatCurrency(company.total_assets_eur)}
            />
            <MetricItem
              label="Employees"
              value={company.employee_count ? formatNumber(company.employee_count) : 'N/A'}
            />
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Data from {company.year || 'N/A'}
            </span>
            <span className="text-primary text-sm font-medium group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MetricItem({
  label,
  value,
  isPositive,
}: {
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-sm font-semibold ${
          isPositive === true
            ? 'text-emerald-600'
            : isPositive === false
            ? 'text-red-600'
            : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
