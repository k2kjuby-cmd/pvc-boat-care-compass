export const PRICE_GRID = [100, 300, 500, 1000, 5000] as const;
export type PriceRule = { auto_pricing?: boolean; reference_volume_ml?: number | null; reference_price?: number | null; pricing_step_percent?: number };
export type WholesaleRule = { base_price?: number | null; minimum_quantity?: number; ozon_price?: number | null; max_discount_percent?: number | null; cost_price?: number | null; minimum_margin_percent?: number };
export type Level = { id: string; name: string; discount_percent: number; quantity_multiplier: number | null; manual_only: boolean; sort: number };
export function retailPrice(rule: PriceRule, volume: number | null | undefined, manual: boolean | undefined, price: number | null | undefined) {
  if (!rule.auto_pricing || manual !== false) return price ?? null;
  const a = PRICE_GRID.findIndex(v => v === rule.reference_volume_ml);
  const b = PRICE_GRID.findIndex(v => v === volume);
  if (a < 0 || b < 0 || !rule.reference_price || !rule.reference_volume_ml) return null;
  return Math.round(Number(volume) * rule.reference_price / rule.reference_volume_ml * (1 + (a - b) * (rule.pricing_step_percent ?? 10) / 100));
}
export function wholesalePrice(retail: number, rule: WholesaleRule, discount: number, tax = 6) {
  const applied = Math.min(discount, rule.max_discount_percent ?? 100);
  const denominator = (100 - (rule.minimum_margin_percent ?? 30) - tax) / 100;
  if (denominator <= 0) throw new Error("Маржа и налог/комиссия должны в сумме быть меньше 100%");
  const minimum = rule.cost_price == null ? null : Math.ceil(rule.cost_price / denominator);
  const discounted = Math.round(retail * (1 - applied / 100));
  const price = Math.max(discounted, minimum ?? 0);
  const margin = rule.cost_price == null || price <= 0 ? null : (price - price * tax / 100 - rule.cost_price) / price * 100;
  return { price, margin, minimum, limited: applied < discount || (minimum != null && discounted <= minimum) };
}
export function bestLevel(levels: Level[], quantity: number, minimum: number, manualId: string | null = null) {
  return levels.filter(l => (!l.manual_only && (l.quantity_multiplier == null || quantity >= minimum * l.quantity_multiplier)) || l.id === manualId).sort((a,b) => b.discount_percent - a.discount_percent)[0] ?? null;
}