import React from 'react';
import { VolumeX, Shuffle, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCount: number;
  onStopAll: () => void;
  onRandomPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeCount,
  onStopAll,
  onRandomPlay,
}) => {
  const triggerRandom = () => {
    onRandomPlay();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.25 },
      colors: ['#f43f5e', '#a855f7', '#06b6d4', '#eab308']
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
        
        {/* Brand / Minimal Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <span className="text-xl">💀</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300">
                  সখা সংগীত
                </h1>
              </div>
            </div>
          </div>

          {/* Mobile Panic Stop */}
          <div className="flex items-center gap-2 md:hidden">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onStopAll}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/40 animate-pulse cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop ({activeCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Active Sounds / Stop All Panic Button */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onStopAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/40 animate-pulse transition-all cursor-pointer"
              title="Stop all playing sounds (Press Space or Escape)"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop All ({activeCount})</span>
            </button>
          )}

          {/* Random Sound Button */}
          <button
            type="button"
            onClick={triggerRandom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-semibold text-xs transition-all cursor-pointer"
            title="Play random sound effect"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random</span>
          </button>

        </div>

      </div>
    </header>
  );
};
