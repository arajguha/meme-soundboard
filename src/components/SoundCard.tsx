import React, { useState, useEffect } from 'react';
import { Play, Square, Repeat, Volume2, VolumeX } from 'lucide-react';
import { SoundItem, CardViewMode } from '../types/sound';
import { soundEngine } from '../utils/audioEngine';
import { resolveMemeImage } from '../utils/memeGallery';
import confetti from 'canvas-confetti';

interface SoundCardProps {
  sound: SoundItem;
  viewMode: CardViewMode;
}

export const SoundCard: React.FC<SoundCardProps> = ({ sound, viewMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(sound.volume ?? 1.0);
  const [isLoop, setIsLoop] = useState(sound.loop ?? false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = imgError
    ? 'https://i.imgflip.com/65939r.jpg'
    : resolveMemeImage(sound.image, sound.memePreset, sound.title);

  // Sync playing state from audio engine
  useEffect(() => {
    const checkState = () => {
      setIsPlaying(soundEngine.isPlaying(sound.id));
    };
    checkState();
    const unsubscribe = soundEngine.subscribe(checkState);
    return () => unsubscribe();
  }, [sound.id]);

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      soundEngine.stop(sound.id);
    } else {
      soundEngine.play(sound, { volume, loop: isLoop });
      if (Math.random() > 0.65) {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#f43f5e', '#a855f7', '#06b6d4', '#eab308']
        });
      }
    }
  };

  const handleLoopToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLoop = !isLoop;
    setIsLoop(nextLoop);
    if (isPlaying) {
      soundEngine.play(sound, { volume, loop: nextLoop });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isPlaying) {
      soundEngine.play(sound, { volume: newVol, loop: isLoop });
    }
  };

  // Compact Row View
  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => handlePlay()}
        className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
          isPlaying
            ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50 scale-[1.01]'
            : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center space-x-3.5 overflow-hidden">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
            <img
              src={imageUrl}
              alt={sound.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
              </div>
            )}
          </div>

          <div className="truncate">
            <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors truncate">
              {sound.title}
            </h4>
            {sound.description && (
              <p className="text-xs text-amber-300/80 italic truncate mt-0.5">
                "{sound.description}"
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handlePlay}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-rose-500 text-slate-200 hover:text-white'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>
        </div>
      </div>
    );
  }

  // Standard Grid View
  return (
    <div
      className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden select-none ${
        isPlaying
          ? 'playing-glow bg-gradient-to-b from-slate-900 to-rose-950/40 border-rose-500/80 -translate-y-1.5'
          : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* Meme Image Banner */}
      <div
        onClick={() => handlePlay()}
        className="relative w-full aspect-[16/11] bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={sound.title}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isPlaying ? 'scale-110 filter brightness-110' : 'group-hover:scale-105'
          }`}
        />

        {/* Gradient shadow for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Animated Equalizer Overlay when playing */}
        {isPlaying && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
            <div className="flex items-end space-x-1 h-6">
              <div className="w-1.5 bg-rose-500 rounded-full animate-eq-1" />
              <div className="w-1.5 bg-amber-400 rounded-full animate-eq-2" />
              <div className="w-1.5 bg-rose-400 rounded-full animate-eq-3" />
              <div className="w-1.5 bg-cyan-400 rounded-full animate-eq-4" />
              <div className="w-1.5 bg-purple-400 rounded-full animate-eq-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-400 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-rose-500/40">
              PLAYING
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3
            onClick={() => handlePlay()}
            className="font-black text-base text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1 cursor-pointer"
            title={sound.title}
          >
            {sound.title}
          </h3>

          {/* Dialogue quote matched with audio */}
          {sound.description && (
            <p className="text-xs text-amber-300/90 font-medium italic mt-1.5 leading-relaxed bg-amber-950/30 px-2.5 py-1.5 rounded-xl border border-amber-900/30">
              "{sound.description}"
            </p>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Big Play / Stop Button */}
          <button
            type="button"
            onClick={handlePlay}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-800 hover:bg-rose-500 text-slate-100 hover:text-white border border-slate-700/60 hover:border-transparent'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Loop Button */}
          <button
            type="button"
            onClick={handleLoopToggle}
            title={isLoop ? 'Looping enabled' : 'Click to loop'}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              isLoop
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume Slider Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowVolumeSlider(!showVolumeSlider);
            }}
            title="Adjust volume"
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              showVolumeSlider
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
            }`}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Volume Slider */}
        {showVolumeSlider && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col gap-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
