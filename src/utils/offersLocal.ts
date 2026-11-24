import { INITIAL_CATALOG } from '../data/initialCatalog';
import { ServiceCategory, ServiceItem } from '../types';

const CATALOG_BY_ID = new Map<string, ServiceItem>(
  INITIAL_CATALOG.map((item) => [item.id, item])
);

function isFreeOffer(service: ServiceItem): boolean {
  return (
    service.category === ServiceCategory.Gratuitos ||
    service.trialDays > 0 ||
    Boolean(service.badgeText && service.badgeText.trim())
  );
}

/**
 * Revalidates local Portugal offers against the built-in catalog (preserving
 * user subscriptions and custom services) and sorts them cleanly with free
 * trials/offers first (by trial length descending) followed by paid services.
 */
export function revalidateAndSortOffers(
  currentServices: ServiceItem[]
): ServiceItem[] {
  const revalidated = currentServices.map((svc) => {
    const reference = CATALOG_BY_ID.get(svc.id);
    if (reference) {
      return {
        ...reference,
        subscription: svc.subscription,
      };
    }

    const normalizedDays =
      typeof svc.trialDays === 'number' && Number.isFinite(svc.trialDays)
        ? Math.max(0, Math.round(svc.trialDays))
        : 0;
    const hasFree =
      normalizedDays > 0 || Boolean(svc.badgeText && svc.badgeText.trim());

    return {
      ...svc,
      trialDays: normalizedDays,
      trialText:
        svc.trialText?.trim() ||
        (normalizedDays > 0
          ? `${normalizedDays} dias grátis`
          : 'Sem período gratuito'),
      category: hasFree ? ServiceCategory.Gratuitos : ServiceCategory.Pagos,
    };
  });

  return [...revalidated].sort((a, b) => {
    const aFree = isFreeOffer(a);
    const bFree = isFreeOffer(b);
    if (aFree !== bFree) return aFree ? -1 : 1;

    if (aFree && bFree) {
      if (b.trialDays !== a.trialDays) {
        return b.trialDays - a.trialDays;
      }
    }

    return a.name.localeCompare(b.name, 'pt-PT', { sensitivity: 'base' });
  });
}
