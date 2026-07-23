export const movementTypes = [
  'PURCHASE',
  'SALE',
  'ADJUSTMENT',
  'TRANSFER',
  'RESERVATION',
  'RESERVATION_RELEASE',
  'WASTE',
  'CONSUMPTION',
  'RETURN',
  'CORRECTION',
  'COUNT',
  'IMPORT',
] as const;
export type MovementType = (typeof movementTypes)[number];
export const manualMovementTypes = [
  'PURCHASE',
  'ADJUSTMENT',
  'WASTE',
  'CONSUMPTION',
  'RETURN',
  'CORRECTION',
  'IMPORT',
] as const;
export const stockStates = [
  'ON_HAND',
  'RESERVED',
  'COMMITTED',
  'IN_TRANSIT',
  'DAMAGED',
  'QUARANTINE',
] as const;
export type StockState = (typeof stockStates)[number];
export const costMethods = ['FIFO', 'WEIGHTED_AVERAGE', 'STANDARD', 'LIFO'] as const;
export type CostMethod = (typeof costMethods)[number];
export type Availability = Readonly<{
  onHand: string;
  reserved: string;
  committed: string;
  inTransit: string;
  damaged: string;
  quarantine: string;
  available: string;
}>;
type DecimalLike = string | number;
const quantityPattern = /^-?(0|[1-9]\d{0,13})(\.\d{1,6})?$/;
const decimal = (value: DecimalLike) => {
  const text = String(value);
  if (!quantityPattern.test(text)) throw new Error('Invalid decimal');
  const negative = text.startsWith('-');
  const unsigned = negative ? text.slice(1) : text;
  const [whole = '0', fraction = ''] = unsigned.split('.');
  const scaled = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0'));
  return negative ? -scaled : scaled;
};
const fixed = (value: bigint) => {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / 1_000_000n;
  const fraction = String(absolute % 1_000_000n)
    .padStart(6, '0')
    .replace(/0+$/, '');
  return `${negative ? '-' : ''}${String(whole)}${fraction ? `.${fraction}` : ''}`;
};
const divideRounded = (numerator: bigint, denominator: bigint) => {
  const negative = numerator < 0n !== denominator < 0n;
  const absoluteNumerator = numerator < 0n ? -numerator : numerator;
  const absoluteDenominator = denominator < 0n ? -denominator : denominator;
  const rounded = (absoluteNumerator + absoluteDenominator / 2n) / absoluteDenominator;
  return negative ? -rounded : rounded;
};
export const addQuantity = (left: string, right: string) => fixed(decimal(left) + decimal(right));
export const subtractQuantity = (left: string, right: string) =>
  fixed(decimal(left) - decimal(right));
export const compareQuantity = (left: string, right: string) =>
  decimal(left) < decimal(right) ? -1 : decimal(left) > decimal(right) ? 1 : 0;
export function availability(input: Omit<Availability, 'available'>): Availability {
  const available =
    decimal(input.onHand) -
    decimal(input.reserved) -
    decimal(input.committed) -
    decimal(input.damaged) -
    decimal(input.quarantine);
  return { ...input, available: fixed(available) };
}
export function assertQuantity(value: string, allowZero = false): void {
  if (!quantityPattern.test(value) || (!allowZero && decimal(value) === 0n))
    throw new Error('Invalid quantity');
}
export function assertVariantReference(
  input: Readonly<{ variantId?: string; productId?: string }>,
): string {
  if (!input.variantId || input.productId)
    throw new Error('Inventory requires ProductVariant.id only');
  return input.variantId;
}
export function assertMovement(
  input: Readonly<{
    quantity: string;
    fromLocationId?: string;
    toLocationId?: string;
    type: MovementType;
  }>,
): void {
  assertQuantity(input.quantity);
  if (
    input.type === 'TRANSFER' &&
    (!input.fromLocationId || !input.toLocationId || input.fromLocationId === input.toLocationId)
  )
    throw new Error('Invalid transfer');
}
export function assertManualMovement(
  input: Readonly<{ type: MovementType; state: StockState; quantity: string }>,
) {
  if (!manualMovementTypes.includes(input.type as (typeof manualMovementTypes)[number]))
    throw new Error('Movement type is internal');
  if (input.state !== 'ON_HAND') throw new Error('Manual movements affect ON_HAND only');
  const sign = compareQuantity(input.quantity, '0');
  if (['PURCHASE', 'RETURN', 'IMPORT'].includes(input.type) && sign <= 0)
    throw new Error('Receipt movement requires a positive quantity');
  if (['WASTE', 'CONSUMPTION'].includes(input.type) && sign >= 0)
    throw new Error('Issue movement requires a negative quantity');
}
export function assertCanIssue(
  currentAvailable: string,
  quantity: string,
  allowNegative: boolean,
): void {
  const absolute = decimal(quantity) < 0n ? -decimal(quantity) : decimal(quantity);
  if (!allowNegative && decimal(currentAvailable) < absolute)
    throw new Error('Insufficient availability');
}
export type CostLayer = Readonly<{ id: string; remainingQuantity: string; unitCost: string }>;
export function consumeFifo(
  layers: readonly CostLayer[],
  quantity: string,
): Readonly<{
  totalCost: string;
  allocations: readonly Readonly<{ layerId: string; quantity: string; unitCost: string }>[];
}> {
  let remaining = decimal(quantity);
  if (remaining <= 0n) throw new Error('FIFO issue must be positive');
  let totalAtTwelveDecimals = 0n;
  const allocations: { layerId: string; quantity: string; unitCost: string }[] = [];
  for (const layer of layers) {
    const layerRemaining = decimal(layer.remainingQuantity);
    const unitCost = decimal(layer.unitCost);
    if (layerRemaining < 0n || unitCost < 0n) throw new Error('Invalid FIFO layer');
    const take = remaining < layerRemaining ? remaining : layerRemaining;
    if (take > 0n) {
      allocations.push({
        layerId: layer.id,
        quantity: fixed(take),
        unitCost: layer.unitCost,
      });
      totalAtTwelveDecimals += take * unitCost;
      remaining -= take;
    }
    if (remaining === 0n) break;
  }
  if (remaining > 0n) throw new Error('Insufficient cost layers');
  return {
    totalCost: fixed(divideRounded(totalAtTwelveDecimals, 1_000_000n)),
    allocations,
  };
}
export function weightedAverage(
  currentQuantity: string,
  currentValue: string,
  receiptQuantity: string,
  receiptUnitCost: string,
): string {
  const quantity = decimal(currentQuantity) + decimal(receiptQuantity);
  if (quantity <= 0n) throw new Error('Weighted average requires positive balance');
  const currentValueAtTwelveDecimals = decimal(currentValue) * 1_000_000n;
  const receiptValueAtTwelveDecimals = decimal(receiptQuantity) * decimal(receiptUnitCost);
  return fixed(
    divideRounded(currentValueAtTwelveDecimals + receiptValueAtTwelveDecimals, quantity),
  );
}
export function assertCostMethodEnabled(method: CostMethod): void {
  if (method !== 'FIFO') throw new Error('Cost method is not operational');
}
