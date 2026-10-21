import { SoundItem } from '../types/sound';
import { playSynthesizedMeme } from './memeSynthesizer';

interface ActiveSound {
  id: string;
  sourceNode?: AudioBufferSourceNode;
  gainNode: GainNode;
  analyser: AnalyserNode;
  synthHandle?: { stop: () => void };
  startTime: number;
  duration: number;
  isLoop: boolean;
  timerId?: number;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bufferCache = new Map<string, AudioBuffer>();
  private activeSounds = new Map<string, ActiveSound>();
  private masterVolume = 1.0;
  private globalPlaybackRate = 1.0;
  private soloMode = false;
  private onStateChangeListeners = new Set<() => void>();

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: () => void) {
    this.onStateChangeListeners.add(cb);
    return () => {
      this.onStateChangeListeners.delete(cb);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach(cb => cb());
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  public getMasterVolume() {
    return this.masterVolume;
  }

  public setGlobalPlaybackRate(rate: number) {
    this.globalPlaybackRate = Math.max(0.25, Math.min(3.0, rate));
    // Update currently playing sounds
    this.activeSounds.forEach(sound => {
      if (sound.sourceNode && this.ctx) {
        sound.sourceNode.playbackRate.setValueAtTime(this.globalPlaybackRate, this.ctx.currentTime);
      }
    });
    this.notify();
  }

  public getGlobalPlaybackRate() {
    return this.globalPlaybackRate;
  }

  public setSoloMode(solo: boolean) {
    this.soloMode = solo;
    this.notify();
  }

  public isSoloMode() {
    return this.soloMode;
  }

  public isPlaying(soundId: string): boolean {
    return this.activeSounds.has(soundId);
  }

  public getActiveCount(): number {
    return this.activeSounds.size;
  }

  public getFrequencyData(soundId: string, outputArray: Uint8Array): boolean {
    const active = this.activeSounds.get(soundId);
    if (!active) return false;
    // Cast to satisfy TS library definition differences between ArrayBuffer and ArrayBufferLike
    (active.analyser.getByteFrequencyData as unknown as (arr: Uint8Array) => void)(outputArray);
    return true;
  }

  public stop(soundId: string) {
    const active = this.activeSounds.get(soundId);
    if (active) {
      if (active.timerId) {
        window.clearTimeout(active.timerId);
      }
      if (active.synthHandle) {
        active.synthHandle.stop();
      }
      if (active.sourceNode) {
        try {
          active.sourceNode.stop();
          active.sourceNode.disconnect();
        } catch {
          // ignore
        }
      }
      try {
        active.gainNode.disconnect();
        active.analyser.disconnect();
      } catch {
        // ignore
      }
      this.activeSounds.delete(soundId);
      this.notify();
    }
  }

  public stopAll() {
    const keys = Array.from(this.activeSounds.keys());
    keys.forEach(id => this.stop(id));
  }

  public async preloadSound(item: SoundItem): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx) return false;
      const url = this.resolveSoundUrl(item);
      if (this.bufferCache.has(url)) return true;

      const response = await fetch(url);
      if (!response.ok) return false;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return true;
    } catch {
      return false;
    }
  }

  private resolveSoundUrl(item: SoundItem): string {
    if (item.customBlobUrl) {
      return item.customBlobUrl;
    }
    const soundPath = item.sound || '';
    if (soundPath.startsWith('http://') || soundPath.startsWith('https://') || soundPath.startsWith('blob:') || soundPath.startsWith('data:')) {
      return soundPath;
    }
    if (soundPath.startsWith('./') || soundPath.startsWith('/')) {
      return soundPath;
    }
    // Default to sounds directory relative to base
    return `./sounds/${soundPath}`;
  }

  public async play(item: SoundItem, options?: { volume?: number; loop?: boolean }) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.soloMode) {
      this.stopAll();
    } else {
      // If this specific sound is already playing, restart it
      this.stop(item.id);
    }

    const soundVol = options?.volume ?? item.volume ?? 1.0;
    const isLoop = options?.loop ?? item.loop ?? false;

    // Create channel nodes
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, soundVol)), this.ctx.currentTime);

    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    gainNode.connect(analyser);
    analyser.connect(this.masterGain);

    const soundUrl = this.resolveSoundUrl(item);
    let loadedBuffer = this.bufferCache.get(soundUrl);

    if (!loadedBuffer) {
      // List candidate paths to try
      const candidateUrls = [
        soundUrl,
        `./sounds/${item.sound}`,
        `/sounds/${item.sound}`,
        `./assets/aistudio/${item.sound}`,
        `/assets/aistudio/${item.sound}`,
      ];

      for (const testUrl of candidateUrls) {
        try {
          const response = await fetch(testUrl);
          if (response.ok) {
            const ab = await response.arrayBuffer();
            loadedBuffer = await this.ctx.decodeAudioData(ab);
            this.bufferCache.set(soundUrl, loadedBuffer);
            this.bufferCache.set(testUrl, loadedBuffer);
            break;
          }
        } catch {
          // try next candidate
        }
      }
    }

    if (loadedBuffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = loadedBuffer;
      source.loop = isLoop;
      source.playbackRate.setValueAtTime(this.globalPlaybackRate, this.ctx.currentTime);
      source.connect(gainNode);

      const activeRecord: ActiveSound = {
        id: item.id,
        sourceNode: source,
        gainNode,
        analyser,
        startTime: this.ctx.currentTime,
        duration: loadedBuffer.duration,
        isLoop
      };

      source.onended = () => {
        if (!isLoop) {
          this.stop(item.id);
        }
      };

      this.activeSounds.set(item.id, activeRecord);
      source.start(0);
      this.notify();
    } else {
      // Fallback: Web Audio synthesis matching the sound key
      const synthKey = item.sound + ' ' + item.title;
      const synthHandle = playSynthesizedMeme(this.ctx, synthKey, gainNode, this.globalPlaybackRate);

      const activeRecord: ActiveSound = {
        id: item.id,
        synthHandle,
        gainNode,
        analyser,
        startTime: this.ctx.currentTime,
        duration: 1.5,
        isLoop
      };

      const estimatedDuration = isLoop ? 999999 : 1500 / this.globalPlaybackRate;
      activeRecord.timerId = window.setTimeout(() => {
        this.stop(item.id);
      }, estimatedDuration);

      this.activeSounds.set(item.id, activeRecord);
      this.notify();
    }
  }

  public registerCustomBlob(soundId: string, file: File): string {
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  }
}

export const soundEngine = new AudioEngine();
