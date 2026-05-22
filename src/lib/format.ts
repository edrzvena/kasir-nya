export function fmtIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Math.round(n));
}

export function fmtCompactIDR(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs < 1_000) return `${sign}Rp ${Math.round(abs)}`;

  const stripZero = (s: string) => s.replace(/[,.]0$/, '');

  if (abs < 1_000_000) {
    const v = abs / 1_000;
    return `${sign}Rp ${stripZero(v.toFixed(v < 10 ? 1 : 0))}rb`;
  }
  if (abs < 1_000_000_000) {
    const v = abs / 1_000_000;
    return `${sign}Rp ${stripZero(v.toFixed(v < 10 ? 1 : 0))}jt`;
  }
  if (abs < 1_000_000_000_000) {
    const v = abs / 1_000_000_000;
    return `${sign}Rp ${stripZero(v.toFixed(v < 10 ? 1 : 0))}M`;
  }
  const v = abs / 1_000_000_000_000;
  return `${sign}Rp ${stripZero(v.toFixed(v < 10 ? 1 : 0))}T`;
}
