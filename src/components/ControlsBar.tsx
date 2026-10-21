import React from 'react';
import { Volume2, VolumeX, Gauge, Layers, LayoutGrid, Rows } from 'lucide-react';
import { CardViewMode } from '../types/sound';

interface ControlsBarProps {
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  soloMode: boolean;
  onToggleSoloMode: (solo: boolean) => void;
  viewMode: CardViewMode;
  onViewModeChange: (mode: CardViewMode) => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  masterVolume,
  onMasterVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  soloMode,
  onToggleSoloMode,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 w-full">
      {/* Sleek Master Audio & Layout Bar (No Category Pills) */}
      <div className="bg-slate-900/70 backdrop-blur border border-slate-800/80 rounded-2xl p-3 sm:px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left: Master Volume */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onMasterVolumeChange(masterVolume > 0 ? 0 : 1)}
            className="text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
            title="Toggle Mute"
          >
            {masterVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2 flex-1 md:w-48">
            <span className="text-slate-400 font-medium whitespace-nowrap">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-slate-300 w-9 text-right">{Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        {/* Center: Pitch / Speed Shifter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400 font-medium">Speed:</span>
          <div className="flex items-center gap-1">
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onPlaybackRateChange(rate)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Overlap Mode & Grid/Compact Toggle */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => onToggleSoloMode(!soloMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              soloMode
                ? 'bg-purple-950/40 border-purple-500/60 text-purple-300'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
            title={soloMode ? 'Solo Mode: Plays one sound at a time' : 'Overlap Mode: Multiple sounds can play together'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{soloMode ? 'Solo Mode' : 'Overlap'}</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid Cards"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-700 text-rose-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('compact')}
              title="Compact Rows"
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'compact' ? 'bg-slate-700 text-rose-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
