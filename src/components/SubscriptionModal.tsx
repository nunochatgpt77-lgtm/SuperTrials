import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, StopCircle, Check } from 'lucide-react';
import {
  BillingCycle,
  ServiceItem,
  SubscriptionMethod,
  SubscriptionRecord,
  SubscriptionStatus,
} from '../types';
import {
  addDaysISO,
  addMonthsISO,
  getContrastTextColor,
  getTodayISO,
} from '../utils/dateUtils';

interface SubscriptionModalProps {
  service: ServiceItem;
  onClose: () => void;
  onSaveSubscription: (serviceId: string, subscription: SubscriptionRecord | null) => void;
  onDeleteService: (serviceId: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  service,
  onClose,
  onSaveSubscription,
  onDeleteService,
}) => {
  const existing = service.subscription;
  const today = getTodayISO();

  const defaultStatus =
    existing?.status ??
    (service.trialDays > 0 ? SubscriptionStatus.Trial : SubscriptionStatus.Paid);

  const defaultStart = existing?.startDate ?? today;
  const defaultEnd =
    existing?.endDate ??
    (defaultStatus === SubscriptionStatus.Trial && service.trialDays > 0
      ? addDaysISO(defaultStart, service.trialDays)
      : addMonthsISO(defaultStart, 1));

  const [status, setStatus] = useState<SubscriptionStatus>(defaultStatus);
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [price, setPrice] = useState<string>(existing?.price ?? service.priceDisplay);
  const [cycle, setCycle] = useState<BillingCycle>(existing?.cycle ?? BillingCycle.Mensal);
  const [method, setMethod] = useState<SubscriptionMethod>(
    existing?.method ??
      (service.id === 'hbo-max'
        ? SubscriptionMethod.Vodafone
        : SubscriptionMethod.Diretamente)
  );
  const [notes, setNotes] = useState<string>(existing?.notes ?? service.detailNote ?? '');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCycleChange = (nextCycle: BillingCycle) => {
    setCycle(nextCycle);
    if (nextCycle === BillingCycle.Anual && service.annualPriceDisplay) {
      setPrice(service.annualPriceDisplay);
    } else if (nextCycle === BillingCycle.Mensal) {
      setPrice(service.priceDisplay);
    }
    if (status === SubscriptionStatus.Paid) {
      setEndDate(
        nextCycle === BillingCycle.Anual
          ? addMonthsISO(startDate, 12)
          : addMonthsISO(startDate, 1)
      );
    }
  };

  const handleStatusChange = (nextStatus: SubscriptionStatus) => {
    setStatus(nextStatus);
    if (nextStatus === SubscriptionStatus.Trial) {
      const days = service.trialDays > 0 ? service.trialDays : 7;
      setEndDate(addDaysISO(startDate, days));
    } else {
      setEndDate(
        cycle === BillingCycle.Anual
          ? addMonthsISO(startDate, 12)
          : addMonthsISO(startDate, 1)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSubscription(service.id, {
      status,
      startDate,
      endDate,
      price: price.trim() || service.priceDisplay,
      cycle,
      method,
      notes: notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#141821] border border-[#232936] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232936]">
          <div className="flex items-center gap-3 min-w-0">
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
              <h2 id="sub-modal-title" className="text-base font-bold text-white truncate">
                {existing ? `Gerir ${service.name}` : `Adicionar ${service.name}`}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {service.trialText} · {service.priceDisplay}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1B202C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {service.detailNote && (
            <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#4ADE80]">
              <p className="font-semibold mb-0.5">Informação de ativação em Portugal</p>
              <p className="text-slate-200 leading-relaxed">{service.detailNote}</p>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-slate-300 mb-2">
              Estado da subscrição
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange(SubscriptionStatus.Trial)}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  status === SubscriptionStatus.Trial
                    ? 'bg-[#4ADE80]/15 border-[#4ADE80] text-[#4ADE80]'
                    : 'bg-[#0B0D12] border-[#232936] text-slate-300 hover:border-slate-500'
                }`}
              >
                {status === SubscriptionStatus.Trial && <Check className="w-3.5 h-3.5" />}
                Período gratuito
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(SubscriptionStatus.Paid)}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  status === SubscriptionStatus.Paid
                    ? 'bg-[#4C8DF6]/15 border-[#4C8DF6] text-[#4C8DF6]'
                    : 'bg-[#0B0D12] border-[#232936] text-slate-300 hover:border-slate-500'
                }`}
              >
                {status === SubscriptionStatus.Paid && <Check className="w-3.5 h-3.5" />}
                Subscrição paga
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sub-start-date"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Data de início
              </label>
              <input
                id="sub-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="sub-end-date"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                {status === SubscriptionStatus.Trial
                  ? 'Fim do período gratuito'
                  : 'Próxima renovação'}
              </label>
              <input
                id="sub-end-date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sub-price"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Preço após período / atual
              </label>
              <input
                id="sub-price"
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ex: 7,99 €/mês"
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sub-cycle"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Ciclo de faturação
              </label>
              <select
                id="sub-cycle"
                value={cycle}
                onChange={(e) => handleCycleChange(e.target.value as BillingCycle)}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value={BillingCycle.Mensal}>Mensal</option>
                <option value={BillingCycle.Anual}>Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="sub-method"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Método de subscrição
            </label>
            <select
              id="sub-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as SubscriptionMethod)}
              className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white outline-none"
            >
              <option value={SubscriptionMethod.Diretamente}>Diretamente</option>
              <option value={SubscriptionMethod.GooglePlay}>Google Play</option>
              <option value={SubscriptionMethod.Vodafone}>Vodafone</option>
              <option value={SubscriptionMethod.Outro}>Outro</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sub-notes"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Notas pessoais
            </label>
            <textarea
              id="sub-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: cancelar 2 dias antes na Google Play, conta partilhada..."
              className="w-full bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full min-h-[44px] bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Guardar subscrição
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-[#1B202C] hover:bg-[#232936] border border-[#232936] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Site oficial
              </a>

              {existing && (
                <button
                  type="button"
                  onClick={() => onSaveSubscription(service.id, null)}
                  className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  Terminar subscrição
                </button>
              )}

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onDeleteService(service.id)}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Confirmar eliminação
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
