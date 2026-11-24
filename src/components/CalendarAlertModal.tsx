import React, { useEffect, useState } from 'react';
import { BellRing, CalendarPlus, Download, ExternalLink, X, Check } from 'lucide-react';
import { ServiceItem } from '../types';
import {
  buildCalendarAlertPayload,
  downloadCalendarAlertICS,
} from '../utils/calendarAlert';

interface CalendarAlertModalProps {
  service: ServiceItem;
  isAfterNewSave?: boolean;
  onClose: () => void;
}

export const CalendarAlertModal: React.FC<CalendarAlertModalProps> = ({
  service,
  isAfterNewSave = false,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const payload = buildCalendarAlertPayload(service);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!payload) return null;

  const handleDownloadICS = () => {
    const ok = downloadCalendarAlertICS(service);
    if (ok) {
      setDownloaded(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#141821] border border-[#232936] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232936]">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center text-[#4ADE80]">
              <BellRing className="w-4 h-4" />
            </span>
            <div>
              <h2 id="alert-modal-title" className="text-sm font-bold text-white">
                Agendar Alerta no Telemóvel
              </h2>
              {isAfterNewSave && (
                <p className="text-[11px] text-[#4ADE80]">
                  Subscrição guardada · define já o teu lembrete
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1B202C] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#0B0D12] border border-[#232936] rounded-xl p-3.5 space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Título do evento</span>
              <p className="font-semibold text-white mt-0.5">{payload.title}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#232936]">
              <div>
                <span className="text-slate-400 block text-[11px]">Data do término</span>
                <p className="font-mono-num text-slate-200 font-semibold">
                  {payload.endDatePT} · 09:00
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Lembretes automáticos</span>
                <p className="text-[#4ADE80] font-semibold">
                  2 dias antes · 1 dia antes
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleDownloadICS}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Evento (.ics) descarregado com 2 alertas</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Adicionar ao Telemóvel (.ics com 2 alertas)</span>
                </>
              )}
            </button>

            <a
              href={payload.googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1B202C] hover:bg-[#252C3B] border border-[#232936] hover:border-[#4C8DF6]/60 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <CalendarPlus className="w-4 h-4 text-[#4C8DF6] shrink-0" />
              <span>Abrir no Google Calendário</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[38px] px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
