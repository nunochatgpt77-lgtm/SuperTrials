import React from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Settings2,
} from 'lucide-react';
import { ServiceItem, SubscriptionStatus } from '../types';
import {
  formatDatePT,
  getContrastTextColor,
  getDaysRemaining,
} from '../utils/dateUtils';

interface ServiceCardProps {
  service: ServiceItem;
  onQuickSubscribe: (service: ServiceItem) => void;
  onManageSubscription: (service: ServiceItem) => void;
  onScheduleAlert: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onQuickSubscribe,
  onManageSubscription,
  onScheduleAlert,
}) => {
  const sub = service.subscription;
  const isTrial = sub?.status === SubscriptionStatus.Trial;
  const isPaid = sub?.status === SubscriptionStatus.Paid;
  const daysLeft = sub ? getDaysRemaining(sub.endDate) : null;

  const formatCountdown = (days: number): string => {
    if (days < 0) return `Expirado há ${Math.abs(days)}d`;
    if (days === 0) return 'Termina hoje';
    if (days === 1) return '1 dia restante';
    return `${days} dias restantes`;
  };

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition-colors duration-150 ${
        sub
          ? 'bg-[#161B26] border-[#2E3648] hover:border-[#3E4961]'
          : 'bg-[#141821] border-[#232936] hover:border-[#323A4C]'
      }`}
    >
      {sub && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: service.color }}
          aria-hidden="true"
        />
      )}

      <div className={sub ? 'pl-1.5 space-y-3' : 'space-y-3'}>
        {/* Top Row: Monogram + Title/Price + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs tracking-tight shrink-0 shadow-sm"
              style={{
                backgroundColor: service.color,
                color: getContrastTextColor(service.color),
              }}
            >
              {service.initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white leading-tight truncate">
                {service.name}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono-num">
                <span className="text-xs font-medium text-slate-200">
                  {service.priceDisplay}
                </span>
                {service.annualPriceDisplay && (
                  <span className="text-[11px] text-slate-400">
                    ({service.annualPriceDisplay})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {!sub && (
              <span className="text-xs font-medium text-[#8B95A5] whitespace-nowrap">
                Sem subscrição
              </span>
            )}
            {isTrial && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4ADE80] whitespace-nowrap font-mono-num">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Em trial</span>
              </span>
            )}
            {isPaid && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C8DF6] whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Paga</span>
              </span>
            )}
          </div>
        </div>

        {/* Middle Info: Trial, Portugal Badge, Activation Note & Active Timeline */}
        <div className="space-y-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-relaxed">
            <span
              className={
                service.trialDays > 0
                  ? 'text-slate-200 font-medium'
                  : 'text-[#8B95A5]'
              }
            >
              {service.trialText}
            </span>
            {service.badgeText && (
              <>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#4ADE80] font-medium">
                  {service.badgeText}
                </span>
              </>
            )}
          </div>

          {service.detailNote && (
            <p className="text-[11px] leading-relaxed text-slate-300 bg-[#0B0D12]/60 border border-[#232936] rounded-lg px-2.5 py-1.5">
              {service.detailNote}
            </p>
          )}

          {sub && (
            <div className="pt-1.5 mt-1.5 border-t border-[#232936]/90 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-num text-[11px]">
                <span className="text-slate-300">
                  {formatDatePT(sub.startDate)} → {formatDatePT(sub.endDate)}
                </span>
                {daysLeft !== null && (
                  <span
                    className={
                      daysLeft <= 3
                        ? 'text-amber-300 font-semibold'
                        : isTrial
                        ? 'text-[#4ADE80] font-semibold'
                        : 'text-slate-300'
                    }
                  >
                    {formatCountdown(daysLeft)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                <span>{sub.cycle}</span>
                <span aria-hidden="true">·</span>
                <span>{sub.method}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num text-slate-300">{sub.price}</span>
              </div>
              {sub.notes && sub.notes !== service.detailNote && (
                <p className="text-[11px] text-slate-400 italic truncate">
                  {sub.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`space-y-2 pt-1 ${sub ? 'pl-1.5' : ''}`}>
        <div className="flex items-center gap-2">
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (!sub) {
                onQuickSubscribe(service);
              }
            }}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              sub
                ? 'bg-[#1B202C] hover:bg-[#232936] text-slate-200 border border-[#232936]'
                : 'bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] font-bold flex-1'
            }`}
          >
            <span>{sub ? 'Abrir site' : 'Subscrever'}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>

          <button
            type="button"
            onClick={() => onManageSubscription(service)}
            className="flex-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold bg-[#1B202C] hover:bg-[#252C3B] text-white border border-[#232936] hover:border-[#394357] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            {sub ? (
              <>
                <Settings2 className="w-3.5 h-3.5 shrink-0 text-[#4ADE80]" />
                <span>Gerir subscrição</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Adicionar subscrição</span>
              </>
            )}
          </button>
        </div>

        {sub && (
          <button
            type="button"
            onClick={() => onScheduleAlert(service)}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 hover:border-[#4ADE80]/60 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 shrink-0" />
            <span>Agendar Alerta no Telemóvel</span>
          </button>
        )}
      </div>
    </article>
  );
};
