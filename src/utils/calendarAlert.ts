import { ServiceItem } from '../types';
import { formatDatePT } from './dateUtils';

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export interface CalendarAlertPayload {
  title: string;
  endDateISO: string;
  endDatePT: string;
  googleCalendarUrl: string;
  icsContent: string;
  filename: string;
}

export function buildCalendarAlertPayload(
  service: ServiceItem
): CalendarAlertPayload | null {
  const sub = service.subscription;
  if (!sub || !sub.endDate) return null;

  const title = `Cancelar período gratuito: ${service.name}`;
  const compactDate = sub.endDate.replace(/-/g, '');
  const startStamp = `${compactDate}T090000`;
  const endStamp = `${compactDate}T093000`;
  const endDatePT = formatDatePT(sub.endDate);

  const descriptionLines = [
    `Serviço: ${service.name}`,
    `Data de término: ${endDatePT}`,
    `Preço após período: ${sub.price} (${sub.cycle})`,
    `Método: ${sub.method}`,
    `Lembretes recomendados: 2 dias antes e 1 dia antes`,
    `Link oficial: ${service.url}`,
  ];
  if (sub.notes) {
    descriptionLines.push(`Notas: ${sub.notes}`);
  }
  const description = descriptionLines.join('\n');

  const googleCalendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${startStamp}/${endStamp}` +
    `&details=${encodeURIComponent(description)}` +
    '&ctz=Europe/Lisbon';

  const nowUtc =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SUPER TRIALS//Portugal//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:supertrials-${service.id}-${compactDate}@supertrials.app`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART;TZID=Europe/Lisbon:${startStamp}`,
    `DTEND;TZID=Europe/Lisbon:${endStamp}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `URL:${service.url}`,
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(`Faltam 2 dias — ${title}`)}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(`Falta 1 dia — ${title}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const safeSlug = service.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    title,
    endDateISO: sub.endDate,
    endDatePT,
    googleCalendarUrl,
    icsContent: icsLines.join('\r\n'),
    filename: `alerta-${safeSlug || 'subscricao'}-${compactDate}.ics`,
  };
}

export function downloadCalendarAlertICS(service: ServiceItem): boolean {
  const payload = buildCalendarAlertPayload(service);
  if (!payload) return false;

  const blob = new Blob([payload.icsContent], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = payload.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
