export enum ServiceCategory {
  Gratuitos = 'Gratuitos',
  Pagos = 'Pagos',
}

export enum FilterTab {
  Todos = 'Todos',
  Gratuitos = 'Gratuitos',
  Pagos = 'Pagos',
}

export enum BillingCycle {
  Mensal = 'Mensal',
  Anual = 'Anual',
}

export enum SubscriptionMethod {
  Diretamente = 'Diretamente',
  GooglePlay = 'Google Play',
  Vodafone = 'Vodafone',
  Outro = 'Outro',
}

export enum SubscriptionStatus {
  Trial = 'trial',
  Paid = 'paid',
}

export enum AppView {
  Inicio = 'inicio',
  Calendario = 'calendario',
  Definicoes = 'definicoes',
}

export interface SubscriptionRecord {
  status: SubscriptionStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  price: string;
  cycle: BillingCycle;
  method: SubscriptionMethod;
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  initials: string;
  color: string;
  priceDisplay: string;
  annualPriceDisplay?: string;
  trialDays: number;
  trialText: string;
  badgeText?: string;
  detailNote?: string;
  category: ServiceCategory;
  url: string;
  isCustom?: boolean;
  subscription: SubscriptionRecord | null;
}

