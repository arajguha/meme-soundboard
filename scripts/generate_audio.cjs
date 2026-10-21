const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate a standard 16-bit 44.1kHz mono WAV buffer
function createWavBuffer(sampleRate, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  /* RIFF header */
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  /* fmt subchunk */
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  /* data subchunk */
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2);
  }

  return buffer;
}

const SAMPLE_RATE = 44100;

function generateVineBoom() {
  const duration = 1.6;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = Math.max(35, 140 * Math.exp(-t * 4.5));
    const sine = Math.sin(2 * Math.PI * freq * t);
    const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.7;
    const distortion = Math.tanh((sine + sub) * 2.2);
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 12) * 0.3;
    const env = Math.exp(-t * 2.2);
    samples[i] = (distortion + noise) * env * 0.85;
  }
  return samples;
}

function generateAirhorn() {
  const duration = 1.3;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  const bursts = [
    { start: 0.0, end: 0.18, freq: 520 },
    { start: 0.22, end: 0.40, freq: 520 },
    { start: 0.44, end: 0.95, freq: 540 }
  ];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (const b of bursts) {
      if (t >= b.start && t < b.end) {
        const localT = t - b.start;
        const square = (Math.sin(2 * Math.PI * b.freq * localT) > 0 ? 1 : -1) * 0.4;
        const saw = (2 * ((localT * b.freq) % 1) - 1) * 0.4;
        const env = Math.sin((localT / (b.end - b.start)) * Math.PI);
        s += (square + saw) * env;
      }
    }
    samples[i] = s * 0.6;
  }
  return samples;
}

function generateBruh() {
  const duration = 0.9;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Descending formants imitating "Bruhh"
    const pitch = 110 * Math.exp(-t * 0.7);
    const f1 = 600 - t * 250;
    const f2 = 1000 - t * 400;
    const wave = (2 * ((t * pitch) % 1) - 1);
    const formant = Math.sin(2 * Math.PI * f1 * t) * 0.5 + Math.sin(2 * Math.PI * f2 * t) * 0.3;
    const env = Math.sin(Math.min(1, t / 0.1) * Math.PI * 0.5) * Math.exp(-t * 2.5);
    samples[i] = (wave * 0.4 + formant * 0.6) * env * 0.8;
  }
  return samples;
}

function generateBonk() {
  const duration = 0.6;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 480 * Math.exp(-t * 12) + 220;
    const body = Math.sin(2 * Math.PI * freq * t);
    const click = (Math.random() * 2 - 1) * Math.exp(-t * 80);
    const env = Math.exp(-t * 7);
    samples[i] = (body * 0.8 + click * 0.5) * env * 0.85;
  }
  return samples;
}

function generateSadTrombone() {
  const duration = 2.4;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  const notes = [
    { start: 0.0, end: 0.45, freq: 311.13 }, // Eb4
    { start: 0.5, end: 0.95, freq: 293.66 }, // D4
    { start: 1.0, end: 1.45, freq: 277.18 }, // Db4
    { start: 1.5, end: 2.30, freq: 261.63, slide: -30 }  // C4 sliding down
  ];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;
    for (const n of notes) {
      if (t >= n.start && t < n.end) {
        const localT = t - n.start;
        const dur = n.end - n.start;
        const slideFreq = n.freq + (n.slide ? (localT / dur) * n.slide : 0);
        const saw = 2 * ((localT * slideFreq) % 1) - 1;
        const vibrato = 1 + Math.sin(2 * Math.PI * 5 * localT) * 0.03;
        const env = Math.sin((localT / dur) * Math.PI);
        s += saw * vibrato * env * 0.6;
      }
    }
    samples[i] = s;
  }
  return samples;
}

function generateGenericMeme(name) {
  const duration = 1.0;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let freq = 440;
    if (name.includes('wow')) freq = 300 + 400 * (1 - Math.exp(-t * 3));
    else if (name.includes('sheesh')) freq = 600 + 700 * t;
    else if (name.includes('pipe')) freq = 800 * Math.sin(t * 30) + (Math.random() * 400);
    else if (name.includes('oof')) freq = 200 * Math.exp(-t * 8);
    else if (name.includes('level')) freq = 440 * Math.pow(2, Math.floor(t * 12) / 12);
    else if (name.includes('dun')) freq = (t < 0.2 ? 180 : (t < 0.4 ? 180 : 360));
    else freq = 330;

    const wave = Math.sin(2 * Math.PI * freq * t);
    const env = Math.exp(-t * 3.5);
    samples[i] = wave * env * 0.7;
  }
  return samples;
}

const soundFiles = [
  { name: 'vine-boom.ogg', gen: generateVineBoom },
  { name: 'airhorn.ogg', gen: generateAirhorn },
  { name: 'bruh.ogg', gen: generateBruh },
  { name: 'bonk.ogg', gen: generateBonk },
  { name: 'sad-trombone.ogg', gen: generateSadTrombone },
  { name: 'emotional-damage.ogg', gen: () => generateGenericMeme('emotional-damage') },
  { name: 'wow.ogg', gen: () => generateGenericMeme('wow') },
  { name: 'sheesh.ogg', gen: () => generateGenericMeme('sheesh') },
  { name: 'dun-dun-dun.ogg', gen: () => generateGenericMeme('dun') },
  { name: 'metal-pipe.ogg', gen: () => generateGenericMeme('pipe') },
  { name: 'no-god-please-no.ogg', gen: () => generateGenericMeme('no-god') },
  { name: 'rick-roll.ogg', gen: () => generateGenericMeme('rick') },
  { name: 'illuminati.ogg', gen: () => generateGenericMeme('illuminati') },
  { name: 'fart-reverb.ogg', gen: () => generateGenericMeme('fart') },
  { name: 'oof.ogg', gen: () => generateGenericMeme('oof') },
  { name: 'level-up.ogg', gen: () => generateGenericMeme('level') }
];

soundFiles.forEach(({ name, gen }) => {
  const filePath = path.join(outputDir, name);
  const samples = gen();
  const wavBuffer = createWavBuffer(SAMPLE_RATE, samples);
  fs.writeFileSync(filePath, wavBuffer);
  console.log('Created audio asset:', name);
});

console.log('Successfully generated all audio files in public/sounds/');
