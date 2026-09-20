/**
 * Time Value of Money (TVM) and Financial Math Utilities
 * Based on standard financial Excel functions with Type = 1 (Annuity Due / beginning of period)
 */

export function excelPV(
  rate: number,
  nper: number,
  pmt: number,
  fv: number = 0,
  type: number = 1
): number {
  if (nper <= 0) return -fv;
  if (rate === 0) return -(fv + pmt * nper);
  const pvif = Math.pow(1 + rate, nper);
  return (-fv - (pmt * (1 + rate * type) * (pvif - 1)) / rate) / pvif;
}

export function excelFV(
  rate: number,
  nper: number,
  pmt: number,
  pv: number = 0,
  type: number = 1
): number {
  if (nper <= 0) return -pv;
  if (rate === 0) return -(pv + pmt * nper);
  const pvif = Math.pow(1 + rate, nper);
  return -pv * pvif - (pmt * (1 + rate * type) * (pvif - 1)) / rate;
}

export function excelPMT(
  rate: number,
  nper: number,
  pv: number,
  fv: number = 0,
  type: number = 1
): number {
  if (nper <= 0) return 0;
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  const factor = ((1 + rate * type) * (pvif - 1)) / rate;
  if (factor === 0) return 0;
  return (-fv - pv * pvif) / factor;
}

/**
 * Formats a number to Indonesian Rupiah currency string (e.g. Rp 20.000.000)
 */
export function formatIDR(val: number): string {
  if (isNaN(val) || !isFinite(val)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
}

/**
 * Formats a number to thousands-separated string (e.g. 20.000.000)
 */
export function formatThousands(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

/**
 * Parses user input string into a pure number (ignoring dots, spaces, etc.)
 */
export function parseRawNumber(str: string | number): number {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  return parseFloat(cleaned) || 0;
}
