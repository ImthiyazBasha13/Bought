'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { HamburgTarget, ParsedShareholder } from '@/lib/types';
import { parseShareholders } from '@/lib/utils';
import Badge from './ui/Badge';

interface ShareholderInfoProps {
  company: HamburgTarget;
}

const COLORS = ['#FF385C', '#00A699', '#484848', '#767676', '#FFAA00', '#7B68EE', '#20B2AA'];

export default function ShareholderInfo({ company }: ShareholderInfoProps) {
  const shareholders = parseShareholders(company);

  if (shareholders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Shareholders
        </h3>
        <p className="text-gray-500 text-sm">
          No shareholder information available.
        </p>
      </div>
    );
  }

  const highRiskCount = shareholders.filter(s => s.successionRisk === 'high').length;
  const mediumRiskCount = shareholders.filter(s => s.successionRisk === 'medium').length;

  // Prepare pie chart data for ownership
  const ownershipData = shareholders
    .filter(s => s.percentage !== null && s.percentage > 0)
    .map((s, index) => ({
      name: s.name,
      value: s.percentage!,
      color: COLORS[index % COLORS.length],
    }));

  const hasOwnershipData = ownershipData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-primary font-semibold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Shareholders
        </h3>
        <div className="flex gap-2">
          {highRiskCount > 0 && (
            <Badge variant="high">
              {highRiskCount} High Risk
            </Badge>
          )}
          {mediumRiskCount > 0 && (
            <Badge variant="medium">
              {mediumRiskCount} Medium Risk
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Alert */}
      {highRiskCount > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-red-800">
                High Succession Opportunity
              </p>
              <p className="text-sm text-red-700 mt-1">
                {highRiskCount === 1
                  ? 'One shareholder is 65+ years old, indicating potential succession planning needs.'
                  : `${highRiskCount} shareholders are 65+ years old, indicating strong succession planning needs.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ownership Pie Chart */}
      {hasOwnershipData && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ownership Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {ownershipData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  formatter={(value: string, entry: any) => (
                    <span className="text-sm text-gray-700">
                      {value} ({entry.payload.value}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Shareholder Table */}
      <div className="overflow-hidden">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shareholder Details</h4>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {hasOwnershipData && (
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ownership
                </th>
              )}
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Succession Risk
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shareholders.map((shareholder, index) => (
              <ShareholderRow
                key={index}
                shareholder={shareholder}
                color={COLORS[index % COLORS.length]}
                showOwnership={hasOwnershipData}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Explanation */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-2">
          Succession Risk Indicators
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">High: Age 65+</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-600">Medium: Age 55-64</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Low: Age &lt;55</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareholderRow({
  shareholder,
  color,
  showOwnership,
}: {
  shareholder: ParsedShareholder;
  color: string;
  showOwnership: boolean;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: color }}
          >
            {shareholder.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{shareholder.name}</span>
        </div>
      </td>
      {showOwnership && (
        <td className="py-4 px-4 text-center">
          <span className="font-semibold text-gray-900">
            {shareholder.percentage !== null ? `${shareholder.percentage}%` : 'N/A'}
          </span>
        </td>
      )}
      <td className="py-4 px-4 text-gray-600">
        {shareholder.dob || 'Unknown'}
      </td>
      <td className="py-4 px-4 text-center">
        <span
          className={`font-semibold ${
            shareholder.successionRisk === 'high'
              ? 'text-red-600'
              : shareholder.successionRisk === 'medium'
              ? 'text-amber-600'
              : 'text-gray-900'
          }`}
        >
          {shareholder.age !== null ? `${shareholder.age} years` : 'Unknown'}
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <Badge variant={shareholder.successionRisk}>
          {shareholder.successionRisk === 'high' && '🔴 High'}
          {shareholder.successionRisk === 'medium' && '🟡 Medium'}
          {shareholder.successionRisk === 'low' && '🟢 Low'}
        </Badge>
      </td>
    </tr>
  );
}
