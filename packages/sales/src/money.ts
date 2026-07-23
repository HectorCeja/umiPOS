export type DecimalString = string;
export type RoundingMode = 'HALF_UP' | 'HALF_EVEN' | 'DOWN';

const syntax = /^-?(0|[1-9]\d*)(\.\d+)?$/;

export function parseDecimal(value: string, scale: number): bigint {
  if (!Number.isInteger(scale) || scale < 0 || scale > 12 || !syntax.test(value))
    throw new Error('INVALID_DECIMAL');
  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [integer = '0', fraction = ''] = unsigned.split('.');
  if (fraction.length > scale) throw new Error('DECIMAL_SCALE_EXCEEDED');
  const result = BigInt(integer) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, '0'));
  return negative ? -result : result;
}

export function formatDecimal(value: bigint, scale: number): DecimalString {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  if (scale === 0) return `${negative ? '-' : ''}${String(absolute)}`;
  const base = 10n ** BigInt(scale);
  const fraction = (absolute % base).toString().padStart(scale, '0');
  return `${negative ? '-' : ''}${String(absolute / base)}.${fraction}`;
}

export function divideRounded(
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode = 'HALF_UP',
): bigint {
  if (denominator === 0n) throw new Error('DIVISION_BY_ZERO');
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const quotient = n / d;
  const remainder = n % d;
  let increment = false;
  if (mode === 'HALF_UP') increment = remainder * 2n >= d;
  if (mode === 'HALF_EVEN')
    increment = remainder * 2n > d || (remainder * 2n === d && quotient % 2n !== 0n);
  const rounded = quotient + (increment ? 1n : 0n);
  return negative ? -rounded : rounded;
}

export function multiplyMoney(
  amountMinor: bigint,
  quantity: string,
  quantityScale = 6,
  mode: RoundingMode = 'HALF_UP',
): bigint {
  return divideRounded(
    amountMinor * parseDecimal(quantity, quantityScale),
    10n ** BigInt(quantityScale),
    mode,
  );
}

export function percentage(amountMinor: bigint, basisPoints: number, mode: RoundingMode): bigint {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000)
    throw new Error('INVALID_PERCENTAGE');
  return divideRounded(amountMinor * BigInt(basisPoints), 10000n, mode);
}
