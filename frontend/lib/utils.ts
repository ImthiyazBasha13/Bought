import { differenceInYears, parse } from 'date-fns';
import type { HamburgTarget, ParsedShareholder } from './types';

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('de-DE').format(num);
}

export function calculateAge(dob: string | null): number | null {
  if (!dob) return null;

  try {
    // Try different date formats
    const formats = ['yyyy-MM-dd', 'dd.MM.yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy'];
    let date: Date | null = null;

    for (const format of formats) {
      try {
        date = parse(dob, format, new Date());
        if (!isNaN(date.getTime())) break;
      } catch {
        continue;
      }
    }

    if (!date || isNaN(date.getTime())) {
      // Try direct Date parsing
      date = new Date(dob);
    }

    if (isNaN(date.getTime())) return null;

    return differenceInYears(new Date(), date);
  } catch {
    return null;
  }
}

export function getSuccessionRisk(age: number | null): 'high' | 'medium' | 'low' {
  if (age === null) return 'low';
  if (age >= 65) return 'high';
  if (age >= 55) return 'medium';
  return 'low';
}

export function parseShareholders(company: HamburgTarget): ParsedShareholder[] {
  const shareholders: ParsedShareholder[] = [];

  // First, try to use shareholder_details JSON if available
  if (company.shareholder_details && Array.isArray(company.shareholder_details)) {
    for (const detail of company.shareholder_details) {
      if (detail.name) {
        const dob = detail.dob || null;
        const age = calculateAge(dob);
        shareholders.push({
          name: detail.name,
          dob,
          age,
          successionRisk: getSuccessionRisk(age),
          percentage: detail.percentage ?? detail.ownership_percentage ?? null,
        });
      }
    }
    if (shareholders.length > 0) return shareholders;
  }

  // Fallback to parsing comma-separated strings
  const names = company.shareholder_names?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const dobs = company.shareholder_dobs?.split(',').map(d => d.trim()).filter(Boolean) || [];

  for (let i = 0; i < names.length; i++) {
    const dob = dobs[i] || null;
    const age = calculateAge(dob);
    shareholders.push({
      name: names[i],
      dob,
      age,
      successionRisk: getSuccessionRisk(age),
      percentage: null,
    });
  }

  return shareholders;
}

export function getHighestSuccessionRisk(company: HamburgTarget): 'high' | 'medium' | 'low' {
  const shareholders = parseShareholders(company);
  if (shareholders.length === 0) return 'low';

  if (shareholders.some(s => s.successionRisk === 'high')) return 'high';
  if (shareholders.some(s => s.successionRisk === 'medium')) return 'medium';
  return 'low';
}

export function getFullAddress(company: HamburgTarget): string {
  const parts = [
    company.address_street,
    company.address_zip,
    company.address_city,
    company.address_country,
  ].filter(Boolean);

  return parts.join(', ') || 'Address not available';
}

export function getShortAddress(company: HamburgTarget): string {
  const parts = [company.address_zip, company.address_city].filter(Boolean);
  return parts.join(' ') || 'Hamburg';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
