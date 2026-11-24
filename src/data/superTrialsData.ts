export type TrialCategory = 'todos' | 'streaming' | 'musica' | 'ia';

export type MainSection = 'ofertas' | 'subs';

export interface TrialApp {
  nome: string;
  categoria: Exclude<TrialCategory, 'todos'>;
  duracao: string;
  detalhe: string;
  dominio: string;
  url: string;
  novo?: boolean;
}

export interface UserSubscription {
  id: number;
  nome: string;
  dominio: string;
  inicio: string; // YYYY-MM-DD
  duracao?: number;
  fim: string; // YYYY-MM-DD
  aviso: number;
}

export const GIST_URL =
  'https://gist.githubusercontent.com/nunochatgpt77-lgtm/2f3287d8041ff7bc7554f7011758f367/raw/76cdd2b517a90609a1bf6a08a54780996f8d051b/gistfile1.txt';

export const CACHE_KEY = 'super_trials_old_cache';
export const SUBS_STORAGE_KEY = 'super_trials_minhas_subs';

export const APPS_PADRAO: TrialApp[] = [
  {
    nome: 'Amazon Prime Video',
    categoria: 'streaming',
    duracao: '30 dias grátis',
    detalhe: 'Catálogo completo + entregas Prime em Portugal.',
    dominio: 'primevideo.com',
    url: 'https://www.primevideo.com',
    novo: false,
  },
  {
    nome: 'Apple TV+',
    categoria: 'streaming',
    duracao: '7 dias grátis',
    detalhe: '3 meses grátis na compra de dispositivo Apple.',
    dominio: 'tv.apple.com',
    url: 'https://tv.apple.com/pt',
    novo: false,
  },
  {
    nome: 'Crunchyroll',
    categoria: 'streaming',
    duracao: '7 dias grátis',
    detalhe: 'Planos Fan e Mega Fan sem anúncios.',
    dominio: 'crunchyroll.com',
    url: 'https://www.crunchyroll.com/pt-pt',
    novo: false,
  },
  {
    nome: 'SkyShowtime',
    categoria: 'streaming',
    duracao: '7 dias grátis',
    detalhe: 'Plano Standard para novas contas elegíveis.',
    dominio: 'skyshowtime.com',
    url: 'https://www.skyshowtime.com/pt',
    novo: false,
  },
  {
    nome: 'MUBI',
    categoria: 'streaming',
    duracao: '7 dias grátis',
    detalhe: 'Cinema de culto e independente.',
    dominio: 'mubi.com',
    url: 'https://mubi.com/pt',
    novo: false,
  },
  {
    nome: 'Spotify Premium',
    categoria: 'musica',
    duracao: '3 meses por 0 €',
    detalhe: 'Campanha ativa até 31/12/2026 para novas contas.',
    dominio: 'spotify.com',
    url: 'https://www.spotify.com/pt-pt/premium/',
    novo: true,
  },
  {
    nome: 'Deezer',
    categoria: 'musica',
    duracao: '1 mês grátis',
    detalhe: 'Áudio de alta qualidade e playlists sem anúncios.',
    dominio: 'deezer.com',
    url: 'https://www.deezer.com/pt/',
    novo: false,
  },
  {
    nome: 'Apple Music',
    categoria: 'musica',
    duracao: '1 mês grátis',
    detalhe: 'Áudio lossless e espacial sem anúncios.',
    dominio: 'music.apple.com',
    url: 'https://music.apple.com/pt',
    novo: false,
  },
  {
    nome: 'YouTube Premium',
    categoria: 'musica',
    duracao: '1 mês grátis',
    detalhe: 'Vídeos sem anúncios + YouTube Music.',
    dominio: 'youtube.com',
    url: 'https://www.youtube.com/premium',
    novo: false,
  },
  {
    nome: 'TIDAL',
    categoria: 'musica',
    duracao: '30 dias grátis',
    detalhe: 'Som HiFi FLAC para novos subscritores.',
    dominio: 'tidal.com',
    url: 'https://tidal.com',
    novo: false,
  },
  {
    nome: 'Audible',
    categoria: 'musica',
    duracao: '30 dias grátis',
    detalhe: 'Inclui 1 crédito gratuito na conta Amazon.',
    dominio: 'audible.com',
    url: 'https://www.audible.com',
    novo: false,
  },
  {
    nome: 'Canva Pro',
    categoria: 'ia',
    duracao: '30 dias grátis',
    detalhe: 'Ferramentas de IA, remoção de fundo e templates.',
    dominio: 'canva.com',
    url: 'https://www.canva.com/pt_pt/pro/',
    novo: false,
  },
  {
    nome: 'Adobe Creative Cloud',
    categoria: 'ia',
    duracao: '7 dias grátis',
    detalhe: 'Photoshop, Premiere Pro, Acrobat e IA Firefly.',
    dominio: 'adobe.com',
    url: 'https://www.adobe.com/pt/creativecloud.html',
    novo: false,
  },
  {
    nome: 'Microsoft 365',
    categoria: 'ia',
    duracao: '30 dias grátis',
    detalhe: 'Office completo, Copilot IA e 1 TB OneDrive.',
    dominio: 'microsoft.com',
    url: 'https://www.microsoft.com/pt-pt/microsoft-365/try',
    novo: false,
  },
  {
    nome: 'Super Duolingo',
    categoria: 'ia',
    duracao: '7 a 14 dias grátis',
    detalhe: 'Vidas ilimitadas e sem anúncios.',
    dominio: 'duolingo.com',
    url: 'https://www.duolingo.com',
    novo: false,
  },
];

export const SERVICO_OPTIONS: { label: string; value: string }[] = [
  { label: 'Amazon Prime Video', value: 'Amazon Prime Video|primevideo.com' },
  { label: 'Apple TV+', value: 'Apple TV+|tv.apple.com' },
  { label: 'Crunchyroll', value: 'Crunchyroll|crunchyroll.com' },
  { label: 'SkyShowtime', value: 'SkyShowtime|skyshowtime.com' },
  { label: 'Disney+', value: 'Disney+|disneyplus.com' },
  { label: 'Netflix', value: 'Netflix|netflix.com' },
  { label: 'HBO Max', value: 'HBO Max|max.com' },
  { label: 'MUBI', value: 'MUBI|mubi.com' },
  { label: 'Spotify Premium', value: 'Spotify Premium|spotify.com' },
  { label: 'Deezer', value: 'Deezer|deezer.com' },
  { label: 'Apple Music', value: 'Apple Music|music.apple.com' },
  { label: 'YouTube Premium', value: 'YouTube Premium|youtube.com' },
  { label: 'TIDAL', value: 'TIDAL|tidal.com' },
  { label: 'Audible', value: 'Audible|audible.com' },
  { label: 'Canva Pro', value: 'Canva Pro|canva.com' },
  {
    label: 'Adobe Creative Cloud',
    value: 'Adobe Creative Cloud|adobe.com',
  },
  { label: 'Microsoft 365', value: 'Microsoft 365|microsoft.com' },
  { label: 'Super Duolingo', value: 'Super Duolingo|duolingo.com' },
  { label: 'ChatGPT Plus', value: 'ChatGPT Plus|chatgpt.com' },
  { label: 'Outro serviço...', value: 'outro|' },
];

export const SUBS_INICIAIS: UserSubscription[] = [
  {
    id: 1,
    nome: 'SkyShowtime',
    dominio: 'skyshowtime.com',
    inicio: '2026-09-02',
    fim: '2026-12-02',
    aviso: 2,
  },
  {
    id: 2,
    nome: 'Disney+',
    dominio: 'disneyplus.com',
    inicio: '2026-11-10',
    fim: '2026-12-10',
    aviso: 2,
  },
  {
    id: 3,
    nome: 'Amazon Prime Video',
    dominio: 'primevideo.com',
    inicio: '2026-11-12',
    fim: '2026-12-12',
    aviso: 2,
  },
  {
    id: 4,
    nome: 'Apple TV+',
    dominio: 'tv.apple.com',
    inicio: '2026-11-17',
    fim: '2026-12-17',
    aviso: 2,
  },
];

export function getTodayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(n.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  if (!baseISO || days === 0) return baseISO;
  const data = new Date(`${baseISO}T12:00:00`);
  if (Number.isNaN(data.getTime())) return baseISO;
  data.setDate(data.getDate() + days);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(data.getDate()).padStart(2, '0')}`;
}

export function diasRestantes(dataFim: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fim = new Date(`${dataFim}T00:00:00`);
  return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatarDataPT(iso: string): string {
  if (!iso) return '--/--/----';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
