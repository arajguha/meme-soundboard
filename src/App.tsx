/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { SoundCard } from './components/SoundCard';
import { ConfigModal } from './components/ConfigModal';
import { GitHubGuideModal } from './components/GitHubGuideModal';
import { SoundItem, CardViewMode } from './types/sound';
import { soundEngine } from './utils/audioEngine';
import { Sparkles, Music2, Keyboard } from 'lucide-react';

export default function App() {
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<CardViewMode>('grid');
  const [activeCount, setActiveCount] = useState(0);

  const [masterVolume, setMasterVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [soloMode, setSoloMode] = useState(false);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isGitHubGuideOpen, setIsGitHubGuideOpen] = useState(false);

  // Always load directly from codebase public/sounds.json
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('./sounds.json');
      if (!res.ok) throw new Error('sounds.json not found');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSounds(data);
      }
    } catch (err) {
      console.warn('Could not fetch ./sounds.json:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Subscribe to audio engine changes
  useEffect(() => {
    const updateEngineState = () => {
      setActiveCount(soundEngine.getActiveCount());
    };
    updateEngineState();
    const unsub = soundEngine.subscribe(updateEngineState);
    return () => unsub();
  }, []);

  // Global Keyboard Hotkeys (1-5 to play, Space / Esc to stop all)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isConfigOpen ||
        isGitHubGuideOpen
      ) {
        return;
      }

      // Space or Escape panic key to stop all
      if (e.code === 'Space' || e.key === 'Escape') {
        e.preventDefault();
        soundEngine.stopAll();
        return;
      }

      const key = e.key.toUpperCase();
      const match = sounds.find(s => s.hotkey && s.hotkey.toUpperCase() === key);
      if (match) {
        e.preventDefault();
        soundEngine.play(match);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sounds, isConfigOpen, isGitHubGuideOpen]);

  // Filtered sounds list
  const filteredSounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sounds;

    return sounds.filter(s => {
      const titleMatch = s.title.toLowerCase().includes(query);
      const descMatch = s.description ? s.description.toLowerCase().includes(query) : false;
      const hotkeyMatch = s.hotkey ? s.hotkey.toLowerCase() === query : false;
      const tagsMatch = s.tags ? s.tags.some(t => t.toLowerCase().includes(query)) : false;

      return titleMatch || descMatch || hotkeyMatch || tagsMatch;
    });
  }, [sounds, searchQuery]);

  // Handlers for Audio Settings
  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    soundEngine.setMasterVolume(vol);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    soundEngine.setGlobalPlaybackRate(rate);
  };

  const handleToggleSoloMode = (solo: boolean) => {
    setSoloMode(solo);
    soundEngine.setSoloMode(solo);
  };

  const handleRandomPlay = () => {
    if (filteredSounds.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredSounds.length);
    const randomSound = filteredSounds[randomIndex];
    soundEngine.play(randomSound);
  };

  return (
    <div className="min-h-screen bg-[#090c14] text-slate-100 flex flex-col relative selection:bg-rose-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCount={activeCount}
        onStopAll={() => soundEngine.stopAll()}
        onRandomPlay={handleRandomPlay}
      />

      {/* Controls Bar (Speed, Volume, Overlap Mode) */}
      <ControlsBar
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolumeChange}
        playbackRate={playbackRate}
        onPlaybackRateChange={handlePlaybackRateChange}
        soloMode={soloMode}
        onToggleSoloMode={handleToggleSoloMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Soundboard Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-4 w-full z-10 flex flex-col justify-center">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center animate-spin text-rose-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-300">Loading soundboard...</p>
          </div>
        ) : filteredSounds.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Music2 className="w-12 h-12 text-slate-500 mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No sounds found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No sound matches "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              viewMode === 'compact'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
            }`}
          >
            {filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Minimal Hotkey Cheat Sheet Bar */}
        <div className="mt-8 mx-auto p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400 justify-center flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
            <Keyboard className="w-4 h-4" />
            <span>Hotkeys:</span>
          </div>
          {sounds.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] font-bold">
                {s.hotkey}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[90px]">{s.title.split(' ')[0]}</span>
            </div>
          ))}
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-rose-400 font-mono">Space / Esc: Stop All</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 px-4 lg:px-8 py-4 text-xs text-slate-400 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-rose-400">সখা সংগীত</span>
            <span>· Pure Codebase Static Soundboard</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Inspect sounds.json
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsGitHubGuideOpen(true)}
              className="hover:text-purple-400 transition-colors cursor-pointer"
            >
              GitHub Deployment Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        sounds={sounds}
        onApplySounds={(updated) => setSounds(updated)}
        onReloadDefaultConfig={loadConfig}
      />

      <GitHubGuideModal
        isOpen={isGitHubGuideOpen}
        onClose={() => setIsGitHubGuideOpen(false)}
      />
    </div>
  );
}
