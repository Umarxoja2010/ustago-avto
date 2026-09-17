import type { MechanicProfile, QuickService } from "@/lib/customer-data";

/**
 * Checks if a candidate service name matches the target service across languages.
 */
export function isMatchingService(
  candidate: string,
  targetName: string,
  targetId: string,
): boolean {
  const c = candidate.toLowerCase().trim();
  const t = targetName.toLowerCase().trim();
  const id = targetId.toLowerCase().trim();

  if (c === t || c.includes(t) || t.includes(c)) return true;

  if (
    id === "engine" &&
    (c.includes("engine") ||
      c.includes("dvigatel") ||
      c.includes("motor") ||
      c.includes("мотор") ||
      c.includes("двигател"))
  )
    return true;

  if (
    id === "oil" &&
    (c.includes("oil") || c.includes("moy") || c.includes("масло") || c.includes("maslo"))
  )
    return true;

  if (id === "battery" && (c.includes("battery") || c.includes("akkum") || c.includes("аккум")))
    return true;

  if (
    id === "electrical" &&
    (c.includes("electric") || c.includes("elektr") || c.includes("электр") || c.includes("provod"))
  )
    return true;

  if (
    id === "diagnostics" &&
    (c.includes("diagnos") || c.includes("diagnostik") || c.includes("диагност"))
  )
    return true;

  if (
    id === "tire" &&
    (c.includes("tire") ||
      c.includes("tyre") ||
      c.includes("shina") ||
      c.includes("koles") ||
      c.includes("колес") ||
      c.includes("шино"))
  )
    return true;

  if (
    id === "wash" &&
    (c.includes("wash") || c.includes("yuv") || c.includes("moyka") || c.includes("мойка"))
  )
    return true;

  if (
    id === "ac" &&
    (c.includes("ac") ||
      c.includes("air") ||
      c.includes("konditsioner") ||
      c.includes("кондиционер") ||
      c.includes("климат"))
  )
    return true;

  if (id === "brake" && (c.includes("brake") || c.includes("tormoz") || c.includes("тормоз")))
    return true;

  if (
    id === "suspension" &&
    (c.includes("suspension") ||
      c.includes("podveska") ||
      c.includes("xodovoy") ||
      c.includes("ходовая"))
  )
    return true;

  return false;
}

/**
 * Calculates the dynamic average price across all mechanics for a given service.
 * Prioritizes mechanic's priceList items, falls back to mechanic's startingPrice.
 * If no mechanics provide this service, falls back to service.from baseline.
 * Rounds to nearest 5,000 so'm.
 */
export function calculateServiceAveragePrice(
  service: QuickService,
  mechanics: MechanicProfile[],
): number {
  const prices: number[] = [];

  for (const m of mechanics) {
    const priceItem = m.priceList?.find((item) =>
      isMatchingService(item.label, service.name, service.id),
    );

    if (priceItem && priceItem.price > 0) {
      prices.push(priceItem.price);
      continue;
    }

    const offers = m.services?.some((s) => isMatchingService(s, service.name, service.id));

    if (offers && m.startingPrice > 0) {
      prices.push(m.startingPrice);
    }
  }

  if (prices.length === 0) {
    return service.from;
  }

  const sum = prices.reduce((acc, p) => acc + p, 0);
  const avg = sum / prices.length;
  return Math.max(10000, Math.round(avg / 5000) * 5000);
}
