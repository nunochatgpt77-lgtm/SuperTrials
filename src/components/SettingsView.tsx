import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, FileCode2, Check } from 'lucide-react';
import { ServiceItem } from '../types';
import { generateStandaloneHTML } from '../utils/exportHtml';

interface SettingsViewProps {
  services: ServiceItem[];
  onImportServices: (imported: ServiceItem[]) => void;
  onResetCatalog: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  services,
  onImportServices,
  onResetCatalog,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const showMessage = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDownloadStandaloneHTML = () => {
    const html = generateStandaloneHTML(services);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'super-trials.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMessage(
      'Ficheiro único HTML descarregado (100% offline com localStorage).'
    );
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(services, null, 2);
    const blob = new Blob([dataStr], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `super-trials-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showMessage('Cópia de segurança JSON exportada.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          onImportServices(parsed as ServiceItem[]);
          showMessage('Catálogo e subscrições importados com sucesso.');
        } else {
          showMessage('Ficheiro JSON inválido.');
        }
      } catch {
        showMessage('Não foi possível ler o ficheiro JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="max-w-2xl space-y-4">
      {feedback && (
        <div className="bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-[#141821] border border-[#232936] rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 flex items-center justify-center text-[#4ADE80] shrink-0">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white">
              Versão em ficheiro único HTML (Offline)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Descarrega o ficheiro{' '}
              <code className="text-slate-200">super-trials.html</code> com
              React + Tailwind CSS, atualização local 100% offline e todas as
              tuas subscrições atuais.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownloadStandaloneHTML}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#4ADE80] hover:bg-[#3FCF72] text-[#0B0D12] text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Descarregar HTML único</span>
        </button>
      </div>

      <div className="bg-[#141821] border border-[#232936] rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-white">
          Cópia de segurança (localStorage)
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Todas as alterações são guardadas automaticamente no armazenamento
          local do teu navegador. Podes exportar ou restaurar os teus dados em
          JSON.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1B202C] hover:bg-[#252C3B] border border-[#232936] text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#4C8DF6]" />
            <span>Exportar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1B202C] hover:bg-[#252C3B] border border-[#232936] text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#4ADE80]" />
            <span>Importar JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-[#141821] border border-[#232936] rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-white">Repor catálogo inicial</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restaura os 15 serviços iniciais de Portugal com os preços, links
          oficiais e períodos experimentais atualizados.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repor catálogo de origem</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetCatalog();
                setConfirmReset(false);
                showMessage(
                  'Catálogo reposto para os valores iniciais de Portugal.'
                );
              }}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Confirmar reposição total
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1B202C] border border-[#232936] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
