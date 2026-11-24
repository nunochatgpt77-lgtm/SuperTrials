import { INITIAL_CATALOG } from '../data/initialCatalog';
import { ServiceItem } from '../types';

/**
 * Generates a complete, self-contained single-file HTML version of SUPER TRIALS
 * using React 18 + Tailwind CSS CDN + Babel Standalone + localStorage,
 * functioning 100% offline with local offer revalidation and sorting.
 */
export function generateStandaloneHTML(catalog: ServiceItem[]): string {
  const serializedCatalog = JSON.stringify(catalog).replace(/</g, '\\u003c');
  const serializedReference = JSON.stringify(
    INITIAL_CATALOG.map(({ subscription: _sub, ...rest }) => rest)
  ).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="pt-PT" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SUPER TRIALS — Offline Edition</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #0B0D12; color: #F1F5F9; }
    .font-mono-num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
  </style>
</head>
<body class="bg-[#0B0D12] text-slate-100 min-h-screen">
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo } = React;
    const STORAGE_KEY = 'super_trials_catalog_v1';
    const DEFAULT_CATALOG = ${serializedCatalog};
    const PORTUGAL_REFERENCE = ${serializedReference};
    const REFERENCE_BY_ID = new Map(PORTUGAL_REFERENCE.map(item => [item.id, item]));

    const isFreeOffer = (s) =>
      s.category === 'Gratuitos' ||
      (typeof s.trialDays === 'number' && s.trialDays > 0) ||
      Boolean(s.badgeText && String(s.badgeText).trim());

    const revalidateAndSortOffers = (list) => {
      const revalidated = (list || []).map((svc) => {
        const ref = REFERENCE_BY_ID.get(svc.id);
        if (ref) {
          return { ...ref, subscription: svc.subscription || null };
        }
        const days = typeof svc.trialDays === 'number' && Number.isFinite(svc.trialDays)
          ? Math.max(0, Math.round(svc.trialDays))
          : 0;
        const hasFree = days > 0 || Boolean(svc.badgeText && String(svc.badgeText).trim());
        return {
          ...svc,
          trialDays: days,
          trialText: (svc.trialText && svc.trialText.trim()) || (days > 0 ? days + ' dias grátis' : 'Sem período gratuito'),
          category: hasFree ? 'Gratuitos' : 'Pagos'
        };
      });

      return [...revalidated].sort((a, b) => {
        const aFree = isFreeOffer(a);
        const bFree = isFreeOffer(b);
        if (aFree !== bFree) return aFree ? -1 : 1;
        if (aFree && bFree && b.trialDays !== a.trialDays) {
          return b.trialDays - a.trialDays;
        }
        return String(a.name || '').localeCompare(String(b.name || ''), 'pt-PT', { sensitivity: 'base' });
      });
    };

    const todayISO = () => {
      const n = new Date();
      return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    };
    const addDaysISO = (base, days) => {
      const [y, m, d] = base.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + days);
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    };
    const addMonthsISO = (base, months) => {
      const [y, m, d] = base.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setMonth(dt.getMonth() + months);
      return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    };
    const fmtPT = (iso) => iso ? iso.split('-').reverse().join('/') : '—';
    const contrastText = (hex) => {
      const h = (hex || '#000000').replace('#', '');
      if (h.length !== 6) return '#FFFFFF';
      const r = parseInt(h.slice(0,2), 16), g = parseInt(h.slice(2,4), 16), b = parseInt(h.slice(4,6), 16);
      return (0.299*r + 0.587*g + 0.114*b)/255 > 0.65 ? '#0B0D12' : '#FFFFFF';
    };

    const escapeICS = (text) => String(text || '')
      .replace(/\\\\/g, '\\\\\\\\')
      .replace(/\\n/g, '\\\\n')
      .replace(/,/g, '\\\\,')
      .replace(/;/g, '\\\\;');

    const buildCalendarAlert = (service) => {
      const sub = service && service.subscription;
      if (!sub || !sub.endDate) return null;
      const title = 'Cancelar período gratuito: ' + service.name;
      const compactDate = sub.endDate.replace(/-/g, '');
      const startStamp = compactDate + 'T090000';
      const endStamp = compactDate + 'T093000';
      const endDatePT = fmtPT(sub.endDate);
      const details = [
        'Serviço: ' + service.name,
        'Data de término: ' + endDatePT,
        'Preço: ' + sub.price + ' (' + sub.cycle + ')',
        'Método: ' + sub.method,
        'Lembretes recomendados: 2 dias antes e 1 dia antes',
        'Link oficial: ' + service.url
      ].join('\\n');
      const googleCalendarUrl =
        'https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(title) +
        '&dates=' + startStamp + '/' + endStamp +
        '&details=' + encodeURIComponent(details) +
        '&ctz=Europe/Lisbon';
      const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SUPER TRIALS//Portugal//PT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:supertrials-' + service.id + '-' + compactDate + '@supertrials.app',
        'DTSTAMP:' + nowUtc,
        'DTSTART;TZID=Europe/Lisbon:' + startStamp,
        'DTEND;TZID=Europe/Lisbon:' + endStamp,
        'SUMMARY:' + escapeICS(title),
        'DESCRIPTION:' + escapeICS(details),
        'URL:' + service.url,
        'BEGIN:VALARM',
        'TRIGGER:-P2D',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + escapeICS('Faltam 2 dias — ' + title),
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + escapeICS('Falta 1 dia — ' + title),
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\\r\\n');
      const slug = service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        title,
        endDatePT,
        googleCalendarUrl,
        icsContent,
        filename: 'alerta-' + (slug || 'subscricao') + '-' + compactDate + '.ics'
      };
    };

    const downloadCalendarICS = (service) => {
      const payload = buildCalendarAlert(service);
      if (!payload) return false;
      const blob = new Blob([payload.icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = payload.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    };

    function App() {
      const [services, setServices] = useState(() => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          return saved ? JSON.parse(saved) : DEFAULT_CATALOG;
        } catch { return DEFAULT_CATALOG; }
      });
      const [view, setView] = useState('inicio');
      const [query, setQuery] = useState('');
      const [tab, setTab] = useState('Todos');
      const [editingSub, setEditingSub] = useState(null);
      const [addingService, setAddingService] = useState(false);
      const [isRefreshing, setIsRefreshing] = useState(false);
      const [statusMessage, setStatusMessage] = useState('');
      const [alertState, setAlertState] = useState(null);

      useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(services)); } catch {}
      }, [services]);

      const showStatus = (msg) => {
        setStatusMessage(msg);
        setTimeout(() => setStatusMessage(prev => prev === msg ? '' : prev), 3500);
      };

      const alertService = useMemo(
        () => alertState ? services.find(s => s.id === alertState.serviceId) || null : null,
        [services, alertState]
      );

      const activeTrials = services.filter(s => s.subscription && s.subscription.status === 'trial').length;
      const activePaid = services.filter(s => s.subscription && s.subscription.status === 'paid').length;
      const gratuitosList = useMemo(
        () => services.filter(s => s.category === 'Gratuitos' || s.trialDays > 0 || Boolean(s.badgeText)),
        [services]
      );
      const pagosList = useMemo(
        () => services.filter(s => s.category === 'Pagos' && s.trialDays === 0 && !s.badgeText),
        [services]
      );

      const filtered = useMemo(() => {
        let base = services;
        if (tab === 'Gratuitos') base = gratuitosList;
        else if (tab === 'Pagos') base = pagosList;
        const q = query.trim().toLowerCase();
        return q ? base.filter(s => s.name.toLowerCase().includes(q)) : base;
      }, [services, gratuitosList, pagosList, tab, query]);

      const quickSubscribe = (s) => {
        if (s.subscription) return;
        const start = todayISO();
        const isTrial = s.trialDays > 0;
        const end = isTrial ? addDaysISO(start, s.trialDays) : addMonthsISO(start, 1);
        setServices(prev => prev.map(item => item.id === s.id ? {
          ...item,
          subscription: {
            status: isTrial ? 'trial' : 'paid',
            startDate: start,
            endDate: end,
            price: s.priceDisplay,
            cycle: 'Mensal',
            method: s.id === 'hbo-max' ? 'Vodafone' : 'Diretamente',
            notes: s.detailNote || ''
          }
        } : item));
        setAlertState({ serviceId: s.id, isAfterNewSave: true });
      };

      const handleRefreshOffers = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        setTimeout(() => {
          setServices(prev => {
            const updated = revalidateAndSortOffers(prev);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
            return updated;
          });
          setIsRefreshing(false);
          showStatus('Ofertas atualizadas com sucesso');
        }, 450);
      };

      return (
        <div className="max-w-[520px] mx-auto px-4 py-6 pb-24">
          <header className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('inicio')}>
              <span className="w-8 h-8 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center text-[#4ADE80] font-bold">⏱</span>
              <h1 className="text-lg font-bold tracking-tight"><span className="text-[#4ADE80]">SUPER</span> TRIALS</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefreshOffers}
                disabled={isRefreshing}
                className="px-2.5 py-1.5 rounded-xl bg-[#141821] border border-[#4ADE80]/40 hover:border-[#4ADE80] text-xs font-semibold text-[#4ADE80] inline-flex items-center gap-1.5 disabled:opacity-70"
              >
                <span className={isRefreshing ? 'inline-block animate-spin' : ''}>↻</span>
                <span>{isRefreshing ? 'A atualizar...' : 'Atualizar Ofertas'}</span>
              </button>
              <button onClick={() => setAddingService(true)} className="w-9 h-9 rounded-full bg-[#1B202C] border border-[#232936] hover:border-[#4ADE80] text-white text-xl flex items-center justify-center">+</button>
            </div>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-sm text-slate-400 font-mono-num">
              <strong className="text-[#4ADE80]">{gratuitosList.length}</strong> em período gratuito <span className="mx-1.5 text-slate-600">|</span> <strong className="text-slate-200">{pagosList.length}</strong> pagas
              {(activeTrials > 0 || activePaid > 0) && (
                <span className="ml-2 text-xs text-slate-400">· Ativas: {activeTrials}/{activePaid}</span>
              )}
            </p>
          </div>

          {statusMessage && (
            <div className="bg-[#4ADE80]/15 border border-[#4ADE80]/35 text-[#4ADE80] rounded-xl px-3.5 py-2.5 text-xs font-semibold mb-3 flex items-center justify-between gap-2">
              <span>✓ {statusMessage}</span>
              <button onClick={() => setStatusMessage('')} className="text-[#4ADE80]/80 hover:text-[#4ADE80]">✕</button>
            </div>
          )}

          {view === 'inicio' && (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar"
                className="w-full bg-[#141821] border border-[#232936] focus:border-[#4ADE80] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none mb-3.5"
              />

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { id: 'Todos', label: 'Todos (' + services.length + ')' },
                  { id: 'Gratuitos', label: 'Gratuitos (' + gratuitosList.length + ')' },
                  { id: 'Pagos', label: 'Pagos (' + pagosList.length + ')' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={
                      'px-4 py-1.5 rounded-full text-xs font-semibold transition ' +
                      (tab === t.id ? 'bg-white text-[#0B0D12]' : 'bg-[#141821] text-slate-300 border border-[#232936] hover:border-slate-500')
                    }
                  >{t.label}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {filtered.map(s => {
                  const sub = s.subscription;
                  return (
                    <div key={s.id} className="relative overflow-hidden bg-[#141821] border border-[#232936] rounded-2xl p-4 flex flex-col justify-between gap-3">
                      {sub && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: s.color }} />}
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: s.color, color: contrastText(s.color) }}>{s.initials}</div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white truncate">{s.name}</h3>
                              <p className="text-xs text-slate-300 font-mono-num">{s.priceDisplay}{s.annualPriceDisplay ? ' · ' + s.annualPriceDisplay : ''}</p>
                            </div>
                          </div>
                          <span className={'text-[11px] font-medium shrink-0 ' + (sub ? (sub.status === 'trial' ? 'text-[#4ADE80]' : 'text-sky-400') : 'text-slate-500')}>
                            {sub ? (sub.status === 'trial' ? 'Em trial' : 'Paga') : 'Sem subscrição'}
                          </span>
                        </div>

                        <div className="mt-3 text-xs space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400">{s.trialText}</span>
                            {s.badgeText && <span className="text-[#4ADE80] font-medium">· {s.badgeText}</span>}
                          </div>
                          {s.detailNote && <p className="text-[11px] text-slate-400 bg-[#0B0D12]/60 border border-[#232936] rounded-lg px-2.5 py-1.5">{s.detailNote}</p>}
                          {sub && (
                            <p className="text-[11px] text-slate-300 font-mono-num pt-1">
                              {fmtPT(sub.startDate)} → {fmtPT(sub.endDate)} · {sub.cycle} · {sub.method}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => quickSubscribe(s)}
                            className={'flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold transition ' + (sub ? 'bg-[#1B202C] text-slate-200 border border-[#232936]' : 'bg-[#4ADE80] text-[#0B0D12] font-bold')}
                          >{sub ? 'Abrir site' : 'Subscrever'}</a>
                          <button
                            onClick={() => setEditingSub(s)}
                            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#1B202C] text-white border border-[#232936] hover:border-slate-500"
                          >{sub ? 'Gerir subscrição' : '+ Adicionar subscrição'}</button>
                        </div>
                        {sub && (
                          <button
                            onClick={() => setAlertState({ serviceId: s.id, isAfterNewSave: false })}
                            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 hover:border-[#4ADE80]/60"
                          >🔔 Agendar Alerta no Telemóvel</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === 'definicoes' && (
            <div className="space-y-4">
              <div className="bg-[#141821] border border-[#232936] rounded-2xl p-4 space-y-2">
                <h2 className="text-sm font-bold text-white">Modo 100% Offline</h2>
                <p className="text-xs text-slate-400">Todas as ofertas de Portugal e subscrições ficam guardadas localmente no navegador (localStorage).</p>
                <button
                  onClick={() => {
                    setServices(DEFAULT_CATALOG);
                    showStatus('Catálogo inicial reposto com sucesso.');
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
                >Repor catálogo de origem</button>
              </div>
            </div>
          )}

          <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#0B0D12]/95 border-t border-[#232936]">
            <div className="max-w-[520px] mx-auto h-full grid grid-cols-2 items-center text-xs font-semibold">
              <button onClick={() => setView('inicio')} className={'h-full ' + (view === 'inicio' ? 'text-[#4ADE80]' : 'text-slate-400')}>Início</button>
              <button onClick={() => setView('definicoes')} className={'h-full ' + (view === 'definicoes' ? 'text-[#4ADE80]' : 'text-slate-400')}>Definições</button>
            </div>
          </nav>

          {editingSub && <SubModal service={editingSub} onClose={() => setEditingSub(null)} onSave={(sub) => {
            const wasNew = Boolean(sub) && !editingSub.subscription;
            const targetId = editingSub.id;
            setServices(prev => prev.map(x => x.id === targetId ? { ...x, subscription: sub } : x));
            setEditingSub(null);
            if (wasNew) {
              setAlertState({ serviceId: targetId, isAfterNewSave: true });
            }
          }} onDeleteService={() => {
            setServices(prev => prev.filter(x => x.id !== editingSub.id));
            setEditingSub(null);
          }} />}

          {addingService && <NewServiceModal onClose={() => setAddingService(false)} onAdd={(ns) => {
            setServices(prev => [ns, ...prev]);
            setAddingService(false);
          }} />}

          {alertService && alertService.subscription && (
            <AlertModal
              service={alertService}
              isAfterNewSave={Boolean(alertState && alertState.isAfterNewSave)}
              onClose={() => setAlertState(null)}
            />
          )}
        </div>
      );
    }

    function AlertModal({ service, isAfterNewSave, onClose }) {
      const [downloaded, setDownloaded] = useState(false);
      const payload = buildCalendarAlert(service);
      if (!payload) return null;
      return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick={onClose}>
          <div className="bg-[#141821] border border-[#232936] rounded-2xl w-full max-w-md p-5 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-2">
              <div>
                <h2 className="font-bold text-sm text-white">Agendar Alerta no Telemóvel</h2>
                {isAfterNewSave && <p className="text-[11px] text-[#4ADE80] mt-0.5">Subscrição guardada · define já o teu lembrete</p>}
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="bg-[#0B0D12] border border-[#232936] rounded-xl p-3 space-y-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Título do evento</span>
                <p className="text-white font-semibold mt-0.5">{payload.title}</p>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-[#232936]">
                <div>
                  <span className="text-slate-400 text-[11px] block">Data do término</span>
                  <p className="text-slate-200 font-mono-num font-semibold">{payload.endDatePT} · 09:00</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Lembretes automáticos</span>
                  <p className="text-[#4ADE80] font-semibold">2 dias antes · 1 dia antes</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { if (downloadCalendarICS(service)) setDownloaded(true); }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#4ADE80] text-[#0B0D12] font-bold"
              >{downloaded ? '✓ Evento (.ics) descarregado com 2 alertas' : 'Adicionar ao Telemóvel (.ics com 2 alertas)'}</button>
              <a
                href={payload.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2.5 px-4 rounded-xl bg-[#1B202C] border border-[#232936] text-white font-semibold"
              >Abrir no Google Calendário</a>
              <button onClick={onClose} className="w-full py-2 text-slate-400 hover:text-white">Fechar</button>
            </div>
          </div>
        </div>
      );
    }

    function SubModal({ service, onClose, onSave, onDeleteService }) {
      const existing = service.subscription;
      const [status, setStatus] = useState(existing?.status || (service.trialDays > 0 ? 'trial' : 'paid'));
      const [startDate, setStartDate] = useState(existing?.startDate || todayISO());
      const [endDate, setEndDate] = useState(existing?.endDate || (service.trialDays > 0 ? addDaysISO(todayISO(), service.trialDays) : addMonthsISO(todayISO(), 1)));
      const [price, setPrice] = useState(existing?.price || service.priceDisplay);
      const [cycle, setCycle] = useState(existing?.cycle || 'Mensal');
      const [method, setMethod] = useState(existing?.method || (service.id === 'hbo-max' ? 'Vodafone' : 'Diretamente'));
      const [notes, setNotes] = useState(existing?.notes ?? service.detailNote ?? '');

      return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141821] border border-[#232936] rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-white">{service.name} — Subscrição</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><label className="text-slate-400 block mb-1">Início</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="text-slate-400 block mb-1">Fim / Renovação</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="text-slate-400 block mb-1">Preço</label><input type="text" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="text-slate-400 block mb-1">Ciclo</label><select value={cycle} onChange={e => setCycle(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white"><option>Mensal</option><option>Anual</option></select></div>
              <div><label className="text-slate-400 block mb-1">Método</label><select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white"><option>Diretamente</option><option>Google Play</option><option>Vodafone</option><option>Outro</option></select></div>
              <div><label className="text-slate-400 block mb-1">Estado</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white"><option value="trial">Período gratuito</option><option value="paid">Paga</option></select></div>
            </div>
            <div><label className="text-slate-400 text-xs block mb-1">Notas</label><textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-xs text-white" /></div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => onSave({ status, startDate, endDate, price, cycle, method, notes })} className="flex-1 bg-[#4ADE80] text-[#0B0D12] font-semibold text-xs py-2.5 rounded-xl">Guardar</button>
              {existing && <button onClick={() => onSave(null)} className="px-3 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">Terminar</button>}
              <button onClick={onDeleteService} className="px-3 py-2.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">Eliminar</button>
            </div>
          </div>
        </div>
      );
    }

    function NewServiceModal({ onClose, onAdd }) {
      const [name, setName] = useState('');
      const [initials, setInitials] = useState('');
      const [color, setColor] = useState('#4ADE80');
      const [priceDisplay, setPriceDisplay] = useState('9,99 €/mês');
      const [trialDays, setTrialDays] = useState(7);
      const [category, setCategory] = useState('Gratuitos');
      const [url, setUrl] = useState('https://');
      const submit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({
          id: 'custom-' + Date.now(),
          name: name.trim(),
          initials: (initials || name.slice(0, 3)).toUpperCase(),
          color,
          priceDisplay,
          trialDays: Number(trialDays) || 0,
          trialText: Number(trialDays) > 0 ? trialDays + ' dias grátis' : 'Sem período gratuito',
          badgeText: Number(trialDays) > 0 ? 'Oferta confirmada em Portugal' : undefined,
          category,
          url: url.trim() || 'https://',
          isCustom: true,
          subscription: null,
        });
      };
      return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <form onSubmit={submit} className="bg-[#141821] border border-[#232936] rounded-2xl w-full max-w-md p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center"><h2 className="font-bold text-sm text-white">Adicionar novo serviço</h2><button type="button" onClick={onClose} className="text-slate-400">✕</button></div>
            <input required placeholder="Nome (ex: Apple Music)" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Sigla (ex: AM)" maxLength={4} value={initials} onChange={e => setInitials(e.target.value)} className="bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-9 bg-[#0B0D12] border border-[#232936] rounded-lg p-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Preço" value={priceDisplay} onChange={e => setPriceDisplay(e.target.value)} className="bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" />
              <input type="number" min="0" placeholder="Dias grátis" value={trialDays} onChange={e => { const v = Number(e.target.value); setTrialDays(v); setCategory(v > 0 ? 'Gratuitos' : 'Pagos'); }} className="bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white"><option value="Gratuitos">Gratuitos</option><option value="Pagos">Pagos</option></select>
            <input type="url" placeholder="Link oficial" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-[#0B0D12] border border-[#232936] rounded-lg px-3 py-2 text-white" />
            <button type="submit" className="w-full bg-[#4ADE80] text-[#0B0D12] font-semibold py-2.5 rounded-xl">Adicionar ao catálogo</button>
          </form>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
}
