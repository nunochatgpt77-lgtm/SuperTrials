import React from 'react';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  ArrowRight,
  BellRing,
} from 'lucide-react';
import { BillingCycle, ServiceItem, SubscriptionStatus } from '../types';
import {
  formatDatePT,
  formatEuro,
  getContrastTextColor,
  getDaysRemaining,
  parseEuroAmount,
} from '../utils/dateUtils';

interface CalendarViewProps {
  services: ServiceItem[];
  onManageSubscription: (service: ServiceItem) => void;
  onScheduleAlert: (service: ServiceItem) => void;
  onGoHome: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  services,
  onManageSubscription,
  onScheduleAlert,
  onGoHome,
}) => {
  const activeServices = services
    .filter((s) => s.subscription !== null)
    .sort((a, b) => {
      const endA = a.subscription?.endDate ?? '9999-12-31';
      const endB = b.subscription?.endDate ?? '9999-12-31';
      return endA.localeCompare(endB);
    });

  const paidMonthlyTotal = activeServices.reduce((acc, s) => {
    const sub = s.subscription;
    if (!sub || sub.status !== SubscriptionStatus.Paid) return acc;
    const amount = parseEuroAmount(sub.price);
    if (amount === null) return acc;
    return acc + (sub.cycle === BillingCycle.Anual ? amount / 12 : amount);
  }, 0);

  const potentialMonthlyIfConverted = activeServices.reduce((acc, s) => {
    const sub = s.subscription;
    if (!sub) return acc;
    const amount = parseEuroAmount(sub.price);
    if (amount === null) return acc;
    return acc + (sub.cycle === BillingCycle.Anual ? amount / 12 : amount);
  }, 0);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#141821] border border-[#232936] rounded-2xl p-4">
          <p className="text-xs text-slate-400">Subscrições ativas</p>
          <p className="mt-1 text-2xl font-bold text-white font-mono-num">
            {activeServices.length}
          </p>
        </div>
        <div className="bg-[#141821] border border-[#232936] rounded-2xl p-4">
          <p className="text-xs text-slate-400">Custo mensal atual (pagas)</p>
          <p className="mt-1 text-2xl font-bold text-[#4C8DF6] font-mono-num">
            {formatEuro(paidMonthlyTotal)}
          </p>
        </div>
        <div className="bg-[#141821] border border-[#232936] rounded-2xl p-4">
          <p className="text-xs text-slate-400">Se tudo renovar após trials</p>
          <p className="mt-1 text-2xl font-bold text-[#4ADE80] font-mono-num">
            {formatEuro(potentialMonthlyIfConverted)}
          </p>
        </div>
      </div>

      {activeServices.length === 0 ? (
        <div className="bg-[#141821] border border-[#232936] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B202C] border border-[#232936] flex items-center justify-center mx-auto text-slate-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-white">
            Sem datas registadas no calendário
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Subscreve ou adiciona datas a qualquer serviço no catálogo para acompanhar os prazos de expiração dos períodos gratuitos e renovações.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Próximas expirações e renovações
          </h2>
          <div className="space-y-2.5">
            {activeServices.map((service) => {
              const sub = service.subscription!;
              const daysLeft = getDaysRemaining(sub.endDate);
              const isTrial = sub.status === SubscriptionStatus.Trial;

              return (
                <div
                  key={service.id}
                  className="relative overflow-hidden bg-[#141821] border border-[#232936] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: service.color }}
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-3 pl-1.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                      style={{
                        backgroundColor: service.color,
                        color: getContrastTextColor(service.color),
                      }}
                    >
                      {service.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {service.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            isTrial ? 'text-[#4ADE80]' : 'text-[#4C8DF6]'
                          }`}
                        >
                          {isTrial ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {isTrial ? 'Trial' : 'Paga'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono-num">
                        {formatDatePT(sub.startDate)} → {formatDatePT(sub.endDate)} ·{' '}
                        {sub.method} · {sub.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pl-1.5">
                    <span
                      className={`text-xs font-semibold font-mono-num ${
                        daysLeft <= 3
                          ? 'text-amber-300'
                          : isTrial
                          ? 'text-[#4ADE80]'
                          : 'text-slate-200'
                      }`}
                    >
                      {daysLeft < 0
                        ? `Expirado há ${Math.abs(daysLeft)}d`
                        : daysLeft === 0
                        ? 'Termina hoje'
                        : `${daysLeft} dias`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onScheduleAlert(service)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/30 text-xs font-semibold text-[#4ADE80] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <BellRing className="w-3.5 h-3.5 shrink-0" />
                        <span>Agendar Alerta no Telemóvel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onManageSubscription(service)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#1B202C] hover:bg-[#252C3B] border border-[#232936] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Gerir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
