export interface SoundItem {
  id: string;
  title: string;
  sound: string; // Filename (e.g., "vine-boom.ogg"), relative path, or URL
  image?: string; // Filename (e.g., "doge.jpg"), relative path, or image URL
  memePreset?: string;
  category?: string;
  hotkey?: string;
  tags?: string[];
  volume?: number; // 0.0 to 1.0 (default 1.0)
  loop?: boolean;
  description?: string;
  brainrotTag?: string;
  isCustomBlob?: boolean;
  customBlobUrl?: string;
}

export interface SoundboardConfig {
  version?: string;
  sounds: SoundItem[];
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  box_count?: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loop: boolean;
  playbackRate: number;
}

export type CardViewMode = 'grid' | 'compact' | 'large';
