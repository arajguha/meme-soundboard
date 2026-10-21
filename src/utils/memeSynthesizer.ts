/**
 * In-browser Web Audio API procedural meme synthesizer.
 * Provides fallback audio synthesis so that every meme sound triggers instant,
 * rich audio feedback even if an external file is delayed, missing, or blocked.
 */

export function playSynthesizedMeme(
  ctx: AudioContext,
  soundKey: string,
  destination: AudioNode,
  playbackRate = 1.0
): { stop: () => void } {
  const now = ctx.currentTime;
  const key = soundKey.toLowerCase();
  const activeNodes: (AudioNode | AudioScheduledSourceNode)[] = [];

  const registerNode = <T extends AudioNode | AudioScheduledSourceNode>(node: T): T => {
    activeNodes.push(node);
    return node;
  };

  const stopAll = () => {
    activeNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped
      }
    });
  };

  if (key.includes('boom') || key.includes('vine')) {
    // Vine Boom: Deep sub-bass punch with distortion and reverberant tail
    const osc = registerNode(ctx.createOscillator());
    const subOsc = registerNode(ctx.createOscillator());
    const gain = registerNode(ctx.createGain());
    const waveShaper = registerNode(ctx.createWaveShaper());

    // Distortion curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; ++i) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 2.5);
    }
    waveShaper.curve = curve;

    osc.type = 'sine';
    subOsc.type = 'triangle';

    const baseFreq = 120 * playbackRate;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(32 * playbackRate, now + 0.5);

    subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);
    subOsc.frequency.exponentialRampToValueAtTime(25 * playbackRate, now + 0.6);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(waveShaper);
    subOsc.connect(waveShaper);
    waveShaper.connect(gain);
    gain.connect(destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 1.5);
    subOsc.stop(now + 1.5);

  } else if (key.includes('airhorn')) {
    // MLG Airhorn: 3 rapid bursts with distinctive brassy buzz
    const bursts = [
      { start: 0, dur: 0.16, freq: 520 },
      { start: 0.20, dur: 0.16, freq: 520 },
      { start: 0.40, dur: 0.55, freq: 540 }
    ];

    bursts.forEach(({ start, dur, freq }) => {
      const t = now + start;
      const osc1 = registerNode(ctx.createOscillator());
      const osc2 = registerNode(ctx.createOscillator());
      const bGain = registerNode(ctx.createGain());

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq * playbackRate, t);
      osc2.frequency.setValueAtTime(freq * 1.5 * playbackRate, t);

      bGain.gain.setValueAtTime(0.5, t);
      bGain.gain.linearRampToValueAtTime(0.5, t + dur * 0.8);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc1.connect(bGain);
      osc2.connect(bGain);
      bGain.connect(destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    });

  } else if (key.includes('bruh')) {
    // Bruh: low pitched formant slide
    const osc = registerNode(ctx.createOscillator());
    const filter = registerNode(ctx.createBiquadFilter());
    const gain = registerNode(ctx.createGain());

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(75 * playbackRate, now + 0.6);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.6);
    filter.Q.value = 4.0;

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.7);

  } else if (key.includes('bonk')) {
    // Bonk: hollow wooden thud with quick pitch drop
    const osc = registerNode(ctx.createOscillator());
    const gain = registerNode(ctx.createGain());

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(180 * playbackRate, now + 0.12);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.35);

  } else if (key.includes('sad') || key.includes('trombone')) {
    // Sad Trombone: 4 descending wah wah wah wahhh notes
    const notes = [
      { t: 0, dur: 0.35, freq: 311.13 }, // Eb4
      { t: 0.40, dur: 0.35, freq: 293.66 }, // D4
      { t: 0.80, dur: 0.35, freq: 277.18 }, // Db4
      { t: 1.20, dur: 0.90, freq: 261.63, slide: 200 } // C4 slide
    ];

    notes.forEach(n => {
      const startTime = now + n.t;
      const osc = registerNode(ctx.createOscillator());
      const filter = registerNode(ctx.createBiquadFilter());
      const gain = registerNode(ctx.createGain());

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq * playbackRate, startTime);
      if (n.slide) {
        osc.frequency.exponentialRampToValueAtTime(n.slide * playbackRate, startTime + n.dur);
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, startTime);
      filter.frequency.linearRampToValueAtTime(400, startTime + n.dur);

      gain.gain.setValueAtTime(0.6, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + n.dur);
    });

  } else if (key.includes('pipe') || key.includes('metal')) {
    // Metal Pipe Falling Clang
    const freqs = [850, 1120, 1420, 1850, 2200];
    freqs.forEach((f, idx) => {
      const osc = registerNode(ctx.createOscillator());
      const gain = registerNode(ctx.createGain());

      osc.type = idx % 2 === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(f * playbackRate, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.7 * playbackRate, now + 1.2);

      const initVol = 0.3 / (idx + 1);
      gain.gain.setValueAtTime(initVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 1.4);
    });

  } else if (key.includes('sheesh')) {
    // Sheesh: high whistling glissando
    const osc = registerNode(ctx.createOscillator());
    const gain = registerNode(ctx.createGain());

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(1700 * playbackRate, now + 0.6);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.9);

  } else if (key.includes('oof')) {
    // Roblox Oof
    const osc = registerNode(ctx.createOscillator());
    const gain = registerNode(ctx.createGain());

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(120 * playbackRate, now + 0.25);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.3);

  } else if (key.includes('level') || key.includes('win')) {
    // Victory 8-bit chime
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      const t = now + idx * 0.1;
      const osc = registerNode(ctx.createOscillator());
      const gain = registerNode(ctx.createGain());

      osc.type = 'square';
      osc.frequency.setValueAtTime(f * playbackRate, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });

  } else {
    // General comedic sound effect
    const osc = registerNode(ctx.createOscillator());
    const gain = registerNode(ctx.createGain());

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 * playbackRate, now);
    osc.frequency.exponentialRampToValueAtTime(180 * playbackRate, now + 0.4);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  return { stop: stopAll };
}
