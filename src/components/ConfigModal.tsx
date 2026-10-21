import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, RefreshCw, AlertCircle, Upload, Save, HelpCircle } from 'lucide-react';
import { SoundItem } from '../types/sound';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sounds: SoundItem[];
  onApplySounds: (newSounds: SoundItem[]) => void;
  onReloadDefaultConfig: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  sounds,
  onApplySounds,
  onReloadDefaultConfig,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Filter out temporary custom blob URLs when exporting
      const cleanList = sounds.map(({ isCustomBlob, customBlobUrl, ...rest }) => rest);
      setJsonText(JSON.stringify(cleanList, null, 2));
      setError(null);
      setApplied(false);
    }
  }, [isOpen, sounds]);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Config must be an array of sound objects: [ { "title": "...", "sound": "..." } ]');
      }

      // Validate objects
      parsed.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          throw new Error(`Item at index ${index} is not an object`);
        }
        if (!item.title) {
          throw new Error(`Item at index ${index} is missing "title"`);
        }
        if (!item.sound) {
          throw new Error(`Item at index ${index} is missing "sound" filename (e.g. "my-sound.ogg")`);
        }
        // Auto assign ID if missing
        if (!item.id) {
          item.id = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        }
      });

      onApplySounds(parsed);
      setError(null);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sounds.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>sounds.json Configuration</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {sounds.length} entries
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Loaded dynamically from <code className="text-cyan-300">./sounds.json</code> on static hosting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-3 bg-cyan-950/30 border-b border-cyan-900/40 text-xs text-cyan-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
          <div>
            <p className="font-semibold text-cyan-200">How dynamic sound files work:</p>
            <p className="text-cyan-300/90 mt-0.5 leading-relaxed">
              Place your <code className="font-mono bg-cyan-950 px-1 py-0.5 rounded text-cyan-200">.ogg</code> voice files in the <code className="font-mono bg-cyan-950 px-1 py-0.5 rounded text-cyan-200">public/sounds/</code> folder and update this JSON list. In the future you can drop any sound file into that folder and add its name here!
            </p>
          </div>
        </div>

        {/* JSON Editor Box */}
        <div className="flex-1 p-5 overflow-hidden flex flex-col gap-3 min-h-[300px]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setError(null);
              }}
              spellCheck={false}
              className="w-full flex-1 p-4 font-mono text-xs text-cyan-300 bg-transparent resize-none focus:outline-none scrollbar-thin"
              placeholder='[ { "title": "My Sound", "sound": "sound.ogg" } ]'
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onReloadDefaultConfig}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              title="Reset to default config"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
              title="Download sounds.json for your repository"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export sounds.json</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                applied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
              }`}
            >
              {applied ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{applied ? 'Saved to Soundboard!' : 'Apply to Board'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
