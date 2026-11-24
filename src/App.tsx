import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  APPS_PADRAO,
  CACHE_KEY,
  GIST_URL,
  MainSection,
  SERVICO_OPTIONS,
  SUBS_INICIAIS,
  SUBS_STORAGE_KEY,
  TrialApp,
  TrialCategory,
  UserSubscription,
  addDaysISO,
  diasRestantes,
  formatarDataPT,
  getTodayISO,
} from './data/superTrialsData';

const MENU_TABS: { id: TrialCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'musica', label: 'Música' },
  { id: 'ia', label: 'IA & Apps' },
];

const BORDER_COLOR_CLASS: Record<Exclude<TrialCategory, 'todos'>, string> = {
  streaming: 'border-l-[#3b82f6]',
  musica: 'border-l-[#a855f7]',
  ia: 'border-l-[#22c55e]',
};

function loadCachedApps(): TrialApp[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return APPS_PADRAO;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as TrialApp[];
    }
    return APPS_PADRAO;
  } catch {
    return APPS_PADRAO;
  }
}

function loadSavedSubscriptions(): UserSubscription[] {
  try {
    const raw = localStorage.getItem(SUBS_STORAGE_KEY);
    if (raw === null) return SUBS_INICIAIS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as UserSubscription[];
    }
    return SUBS_INICIAIS;
  } catch {
    return SUBS_INICIAIS;
  }
}

interface LogoBoxProps {
  nome: string;
  dominio: string;
}

const LogoBox: React.FC<LogoBoxProps> = ({ nome, dominio }) => {
  const [failed, setFailed] = useState(false);
  const src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    dominio
  )}&sz=128`;

  useEffect(() => {
    setFailed(false);
  }, [dominio]);

  return (
    <div className="w-10 h-10 bg-white rounded-[6px] p-1 flex items-center justify-center shrink-0 overflow-hidden">
      {!failed ? (
        <img
          src={src}
          alt={nome}
          onError={() => setFailed(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-[#121212] font-bold text-base">
          {nome.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default function App() {
  const [dadosAtuais, setDadosAtuais] = useState<TrialApp[]>(loadCachedApps);
  const [minhasSubs, setMinhasSubs] = useState<UserSubscription[]>(
    loadSavedSubscriptions
  );
  const [secaoAtiva, setSecaoAtiva] = useState<MainSection>('ofertas');
  const [filtroAtual, setFiltroAtual] = useState<TrialCategory>('todos');
  const [estadoLista, setEstadoLista] = useState<string>('A carregar...');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form state for Nova Adesão / Alerta
  const todayISO = useMemo(() => getTodayISO(), []);
  const [subServico, setSubServico] = useState<string>(SERVICO_OPTIONS[0].value);
  const [subNomeCustom, setSubNomeCustom] = useState<string>('');
  const [subDomCustom, setSubDomCustom] = useState<string>('');
  const [subInicio, setSubInicio] = useState<string>(todayISO);
  const [subDias, setSubDias] = useState<number>(30);
  const [subFim, setSubFim] = useState<string>(() => addDaysISO(todayISO, 30));
  const [subAviso, setSubAviso] = useState<number>(2);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const lastSaveTimeRef = useRef<number>(0);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(minhasSubs));
    } catch {
      // Ignore storage quota errors
    }
  }, [minhasSubs]);

  const carregarTrials = useCallback(async (manual = false) => {
    setIsLoading(true);
    if (manual) {
      setEstadoLista('A atualizar...');
    }

    try {
      const res = await fetch(`${GIST_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error('Erro');
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const list = json as TrialApp[];
        setDadosAtuais(list);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {
          // Ignore storage quota errors
        }
        setEstadoLista(`${list.length} trials disponíveis • Online`);
        return;
      }
      throw new Error('Inválido');
    } catch {
      const cached = loadCachedApps();
      setDadosAtuais(cached);
      setEstadoLista(`${cached.length} trials disponíveis • Modo Local`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregarTrials(false);
  }, [carregarTrials]);

  const handleInicioChange = (nextInicio: string) => {
    setSubInicio(nextInicio);
    setFormError(null);
    if (nextInicio && subDias > 0) {
      setSubFim(addDaysISO(nextInicio, subDias));
    }
  };

  const handleDiasChange = (nextDias: number) => {
    setSubDias(nextDias);
    setFormError(null);
    if (subInicio && nextDias > 0) {
      setSubFim(addDaysISO(subInicio, nextDias));
    }
  };

  const adicionarSubscricao = () => {
    const now = Date.now();
    if (isSavingRef.current || now - lastSaveTimeRef.current < 350) {
      return;
    }

    isSavingRef.current = true;
    lastSaveTimeRef.current = now;
    setFormError(null);
    setFormSuccess(null);

    try {
      let nome = '';
      let dominio = '';

      if (subServico.startsWith('outro|')) {
        nome = subNomeCustom.trim();
        dominio = subDomCustom.trim() || 'google.com';
        if (!nome) {
          setFormError('Preenche o nome do serviço antes de guardar.');
          return;
        }
      } else {
        const [n, d] = subServico.split('|');
        nome = (n || '').trim();
        dominio = (d || '').trim() || 'google.com';
        if (!nome) {
          setFormError('Seleciona um serviço válido.');
          return;
        }
      }

      if (!subInicio) {
        setFormError('Seleciona a data de adesão.');
        return;
      }

      if (!subFim) {
        setFormError('Seleciona a data de fim / cancelar até.');
        return;
      }

      const novaSub: UserSubscription = {
        id: now,
        nome,
        dominio,
        inicio: subInicio,
        duracao: subDias,
        fim: subFim,
        aviso: Number(subAviso) || 2,
      };

      const nextList = [...minhasSubs, novaSub];
      let storageError: string | null = null;
      try {
        localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(nextList));
      } catch (err: unknown) {
        storageError =
          err instanceof Error
            ? err.message
            : 'Não foi possível gravar no localStorage.';
      }

      setMinhasSubs(nextList);
      setSubNomeCustom('');
      setSubDomCustom('');

      if (storageError) {
        setFormError(
          `Adicionada à lista, mas erro ao guardar no localStorage: ${storageError}`
        );
        return;
      }

      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }

      const okMsg = 'Subscrição guardada com sucesso!';
      setFormSuccess(okMsg);
      successTimerRef.current = window.setTimeout(() => {
        setFormSuccess((prev) => (prev === okMsg ? null : prev));
      }, 5000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao guardar a subscrição.';
      setFormError(`Erro ao guardar subscrição: ${msg}`);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removerSub = (id: number) => {
    setMinhasSubs((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const urgentes = useMemo(
    () =>
      minhasSubs.filter((s) => {
        const falta = diasRestantes(s.fim);
        return falta <= (s.aviso || 2);
      }),
    [minhasSubs]
  );

  const subsOrdenadas = useMemo(
    () => [...minhasSubs].sort((a, b) => a.fim.localeCompare(b.fim)),
    [minhasSubs]
  );

  const itensFiltrados = useMemo(
    () =>
      filtroAtual === 'todos'
        ? dadosAtuais
        : dadosAtuais.filter((a) => a.categoria === filtroAtual),
    [dadosAtuais, filtroAtual]
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white px-3 pt-3 pb-10 font-sans">
      <div className="max-w-[560px] mx-auto">
        {/* Topbar */}
        <header className="bg-[#1e1e1e] border border-[#2c2c2c] rounded-[8px] p-3 mb-3 flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <h1 className="text-[1.2rem] font-bold text-white leading-tight">
              Super Trials
            </h1>
            <div className="text-[0.78rem] text-[#b0b0b0] mt-[3px]">
              {estadoLista}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void carregarTrials(true)}
            disabled={isLoading}
            className="bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#3a3a3a] text-white border border-[#444] rounded-[6px] px-[11px] py-2 text-[0.8rem] font-bold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            {isLoading ? 'A atualizar...' : 'Atualizar'}
          </button>
        </header>

        {/* Alertas urgentes no topo */}
        {urgentes.length > 0 && (
          <div
            role="alert"
            className="bg-[#3f1515] border border-[#ef4444] text-[#fecaca] rounded-[8px] px-3 py-2.5 mb-3 text-[0.82rem]"
          >
            ⚠️ <strong className="text-white">Alerta de Expiração:</strong>{' '}
            {urgentes
              .map((u) => {
                const d = diasRestantes(u.fim);
                if (d < 0) return `${u.nome} (expirou)`;
                if (d === 0) return `${u.nome} (acaba HOJE!)`;
                return `${u.nome} (faltam ${d}d)`;
              })
              .join(' • ')}
          </div>
        )}

        {/* Navegação principal */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setSecaoAtiva('ofertas')}
            className={`flex-1 rounded-[8px] p-2.5 text-[0.86rem] font-bold cursor-pointer text-center border transition-colors ${
              secaoAtiva === 'ofertas'
                ? 'bg-[#2563eb] text-white border-[#2563eb]'
                : 'bg-[#1e1e1e] text-[#cccccc] border-[#333] hover:text-white'
            }`}
          >
            🎯 Ofertas ({dadosAtuais.length})
          </button>
          <button
            type="button"
            onClick={() => setSecaoAtiva('subs')}
            className={`flex-1 rounded-[8px] p-2.5 text-[0.86rem] font-bold cursor-pointer text-center border transition-colors ${
              secaoAtiva === 'subs'
                ? 'bg-[#2563eb] text-white border-[#2563eb]'
                : 'bg-[#1e1e1e] text-[#cccccc] border-[#333] hover:text-white'
            }`}
          >
            ⏰ Subscrições ({minhasSubs.length})
          </button>
        </div>

        {/* SECÇÃO 1: OFERTAS */}
        {secaoAtiva === 'ofertas' && (
          <div>
            <div className="flex gap-1.5 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MENU_TABS.map((t) => {
                const active = filtroAtual === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFiltroAtual(t.id)}
                    className={`rounded-[6px] px-[11px] py-[7px] text-[0.8rem] font-bold cursor-pointer whitespace-nowrap border transition-colors ${
                      active
                        ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                        : 'bg-[#1e1e1e] text-[#cccccc] border-[#333] hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2">
              {itensFiltrados.map((app) => (
                <div
                  key={`${app.categoria}-${app.nome}`}
                  className={`bg-[#1e1e1e] border border-[#2c2c2c] border-l-4 ${
                    BORDER_COLOR_CLASS[app.categoria] || 'border-l-[#22c55e]'
                  } rounded-[6px] px-3 py-2.5 flex items-center justify-between gap-2.5`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <LogoBox nome={app.nome} dominio={app.dominio} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[0.95rem] font-bold text-white">
                          {app.nome}
                        </span>
                        {app.novo && (
                          <span className="bg-[#f59e0b] text-[#111111] text-[0.65rem] font-bold px-[5px] py-[1px] rounded-[4px]">
                            NOVO
                          </span>
                        )}
                      </div>

                      <div className="text-[0.78rem] text-[#4ade80] font-bold mt-0.5">
                        {app.duracao}
                      </div>

                      <div className="text-[0.74rem] text-[#a3a3a3] mt-0.5">
                        {app.detalhe}
                      </div>
                    </div>
                  </div>

                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white no-underline text-[0.78rem] font-bold px-2.5 py-2 rounded-[6px] whitespace-nowrap shrink-0"
                  >
                    Registar
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECÇÃO 2: SUBSCRIÇÕES E ALERTAS */}
        {secaoAtiva === 'subs' && (
          <div>
            <form
              noValidate
              onSubmit={handleFormSubmit}
              className="bg-[#1e1e1e] border border-[#333] rounded-[8px] p-3 mb-3"
            >
              <h2 className="text-[0.95rem] font-bold mb-2.5 text-[#93c5fd]">
                + Registar Nova Adesão / Alerta
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label
                    htmlFor="sub-servico"
                    className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]"
                  >
                    Serviço / Aplicação
                  </label>
                  <select
                    id="sub-servico"
                    value={subServico}
                    onChange={(e) => {
                      setSubServico(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem]"
                  >
                    {SERVICO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {subServico.startsWith('outro|') && (
                  <div className="col-span-2">
                    <label className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]">
                      Nome do Serviço (e domínio ex: netflix.com)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={subNomeCustom}
                        onChange={(e) => setSubNomeCustom(e.target.value)}
                        placeholder="Ex: NordVPN"
                        className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem]"
                      />
                      <input
                        type="text"
                        value={subDomCustom}
                        onChange={(e) => setSubDomCustom(e.target.value)}
                        placeholder="nordvpn.com"
                        className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="sub-inicio"
                    className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]"
                  >
                    Data de Adesão
                  </label>
                  <input
                    id="sub-inicio"
                    type="date"
                    value={subInicio}
                    onChange={(e) => handleInicioChange(e.target.value)}
                    className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sub-dias"
                    className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]"
                  >
                    Duração (dias)
                  </label>
                  <select
                    id="sub-dias"
                    value={subDias}
                    onChange={(e) => handleDiasChange(Number(e.target.value))}
                    className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem]"
                  >
                    <option value={7}>7 dias</option>
                    <option value={14}>14 dias</option>
                    <option value={30}>30 dias (1 mês)</option>
                    <option value={90}>90 dias (3 meses)</option>
                    <option value={0}>Manual</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sub-fim"
                    className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]"
                  >
                    Data de Fim / Cancelar até
                  </label>
                  <input
                    id="sub-fim"
                    type="date"
                    value={subFim}
                    onChange={(e) => setSubFim(e.target.value)}
                    className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem] [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sub-aviso"
                    className="block text-[0.72rem] text-[#b0b0b0] mb-[3px]"
                  >
                    Alertar quantos dias antes?
                  </label>
                  <select
                    id="sub-aviso"
                    value={subAviso}
                    onChange={(e) => setSubAviso(Number(e.target.value))}
                    className="w-full bg-[#121212] text-white border border-[#444] rounded-[6px] p-2 text-[0.84rem]"
                  >
                    <option value={1}>1 dia antes</option>
                    <option value={2}>2 dias antes</option>
                    <option value={3}>3 dias antes</option>
                    <option value={5}>5 dias antes</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    adicionarSubscricao();
                  }}
                  className="col-span-2 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white border-none rounded-[6px] p-2.5 text-[0.85rem] font-bold cursor-pointer mt-1"
                >
                  Guardar Subscrição e Ativar Alerta
                </button>

                {(formSuccess || formError) && (
                  <div
                    id="status-msg"
                    role={formError ? 'alert' : 'status'}
                    className={`col-span-2 rounded-[6px] px-3 py-2.5 text-[0.82rem] font-bold border ${
                      formError
                        ? 'bg-[#991b1b] border-[#ef4444] text-white'
                        : 'bg-[#15803d] border-[#22c55e] text-white'
                    }`}
                  >
                    {formError || formSuccess}
                  </div>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-2">
              {subsOrdenadas.map((sub) => {
                const falta = diasRestantes(sub.fim);

                let itemStyle = 'border-l-[#22c55e] bg-[#1e1e1e]';
                let duracaoColor = 'text-[#4ade80]';
                let textoFalta = `Faltam ${falta} dias`;

                if (falta < 0) {
                  itemStyle = 'border-l-[#ef4444] bg-[#261717]';
                  duracaoColor = 'text-[#f87171]';
                  textoFalta = `Expirou há ${Math.abs(falta)} dia(s)`;
                } else if (falta === 0) {
                  itemStyle = 'border-l-[#ef4444] bg-[#261717]';
                  duracaoColor = 'text-[#f87171]';
                  textoFalta = 'ACABA HOJE — Cancelar já!';
                } else if (falta <= (sub.aviso || 2)) {
                  itemStyle = 'border-l-[#ef4444] bg-[#261717]';
                  duracaoColor = 'text-[#f87171]';
                  textoFalta = `ALERTA: Faltam ${falta} dia(s)!`;
                } else if (falta <= 7) {
                  itemStyle = 'border-l-[#f59e0b] bg-[#1e1e1e]';
                  duracaoColor = 'text-[#fbbf24]';
                }

                return (
                  <div
                    key={sub.id}
                    className={`border border-[#2c2c2c] border-l-4 ${itemStyle} rounded-[6px] px-3 py-2.5 flex items-center justify-between gap-2.5`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <LogoBox nome={sub.nome} dominio={sub.dominio} />

                      <div className="min-w-0">
                        <div className="text-[0.95rem] font-bold text-white">
                          {sub.nome}
                        </div>
                        <div
                          className={`text-[0.78rem] font-bold mt-0.5 ${duracaoColor}`}
                        >
                          {textoFalta}
                        </div>
                        <div className="text-[0.74rem] text-[#a3a3a3] mt-0.5">
                          Adesão: {formatarDataPT(sub.inicio)} • Fim:{' '}
                          {formatarDataPT(sub.fim)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removerSub(sub.id)}
                      className="bg-[#3f1d1d] hover:bg-[#522323] text-[#fca5a5] border border-[#7f1d1d] text-[0.75rem] font-bold px-[9px] py-[7px] rounded-[6px] cursor-pointer shrink-0"
                    >
                      Apagar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
