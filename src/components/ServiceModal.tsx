import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ServiceCategory, ServiceItem } from '../types';
import { getContrastTextColor } from '../utils/dateUtils';

interface ServiceModalProps {
  onClose: () => void;
  onAddService: (service: ServiceItem) => void;
}

const PRESET_COLORS = [
  '#4ADE80',
  '#4C8DF6',
  '#6B3BFF',
  '#F47521',
  '#E50914',
  '#00A8E1',
  '#FFCA05',
  '#E8E8E8',
];

export const ServiceModal: React.FC<ServiceModalProps> = ({ onClose, onAddService }) => {
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [color, setColor] = useState('#4C8DF6');
  const [priceDisplay, setPriceDisplay] = useState('9,99 €/mês');
  const [annualPriceDisplay, setAnnualPriceDisplay] = useState('');
  const [trialDays, setTrialDays] = useState<number>(7);
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.Gratuitos);
  const [badgeText, setBadgeText] = useState('Oferta confirmada em Portugal');
  const [detailNote, setDetailNote] = useState('');
  const [url, setUrl] = useState('https://');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const previewInitials = (
    initials.trim() ||
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3) ||
    'SV'
  ).toUpperCase();

  const handleTrialDaysChange = (val: number) => {
    const clean = Math.max(0, Number.isFinite(val) ? val : 0);
    setTrialDays(clean);
    if (clean > 0) {
      setCategory(ServiceCategory.Gratuitos);
      if (!badgeText) setBadgeText('Oferta confirmada em Portugal');
    } else {
      setCategory(ServiceCategory.Pagos);
      if (badgeText === 'Oferta confirmada em Portugal') setBadgeText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanUrl = url.trim().startsWith('http')
      ? url.trim()
      : `https://${url.trim()}`;

    const newService: ServiceItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      initials: previewInitials,
      color,
      priceDisplay: priceDisplay.trim() || 'Preço por confirmar',
      annualPriceDisplay: annualPriceDisplay.trim() || undefined,
      trialDays,
      trialText: trialDays > 0 ? `${trialDays} dias grátis` : 'Sem período gratuito',
      badgeText: badgeText.trim() || undefined,
      detailNote: detailNote.trim() || undefined,
      category,
      url: cleanUrl,
      isCustom: true,
      subscription: null,
    };

    onAddService(newService);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-service-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#141821] border border-[#232936] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232936]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors"
              style={{
                backgroundColor: color,
                color: getContrastTextColor(color),
              }}
            >
              {previewInitials}
            </div>
            <div>
              <h2 id="new-service-title" className="text-base font-bold text-white">
                Adicionar novo serviço
              </h2>
              <p className="text-xs text-slate-400">
                Guardado localmente no teu catálogo
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="svc-name"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Nome do serviço *
              </label>
              <input
                id="svc-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Apple Music, Tidal, Adobe..."
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="svc-initials"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Sigla (máx. 4)
              </label>
              <input
                id="svc-initials"
                type="text"
                maxLength={4}
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                placeholder={previewInitials}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white uppercase placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-300 mb-2">
              Cor do ícone
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  aria-label={`Cor ${preset}`}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform cursor-pointer ${
                    color.toLowerCase() === preset.toLowerCase()
                      ? 'border-white scale-105'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <label className="flex items-center gap-1.5 text-xs text-slate-400 ml-1 cursor-pointer">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-[#0B0D12] border border-[#232936] p-0.5 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="svc-price"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Preço mensal
              </label>
              <input
                id="svc-price"
                type="text"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
                placeholder="ex: 9,99 €/mês"
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="svc-annual"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Preço anual (opcional)
              </label>
              <input
                id="svc-annual"
                type="text"
                value={annualPriceDisplay}
                onChange={(e) => setAnnualPriceDisplay(e.target.value)}
                placeholder="ex: 99,00 €/ano"
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="svc-trial"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Período experimental (dias)
              </label>
              <input
                id="svc-trial"
                type="number"
                min={0}
                max={365}
                value={trialDays}
                onChange={(e) => handleTrialDaysChange(Number(e.target.value))}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white font-mono-num outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="svc-category"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Categoria na lista
              </label>
              <select
                id="svc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value={ServiceCategory.Gratuitos}>Gratuitos</option>
                <option value={ServiceCategory.Pagos}>Pagos</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="svc-badge"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Etiqueta de oferta (opcional)
            </label>
            <input
              id="svc-badge"
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Ex.: Oferta confirmada em Portugal"
              className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="svc-note"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Nota de detalhes (opcional)
            </label>
            <input
              id="svc-note"
              type="text"
              value={detailNote}
              onChange={(e) => setDetailNote(e.target.value)}
              placeholder="Ex.: Incluído em tarifário ou instruções de ativação"
              className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="svc-url"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Link oficial
            </label>
            <input
              id="svc-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full min-h-[42px] bg-[#0B0D12] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Adicionar serviço ao catálogo
          </button>
        </form>
      </div>
    </div>
  );
};
