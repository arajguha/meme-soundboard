import { MemeTemplate } from '../types/sound';

export const CURATED_MEMES: MemeTemplate[] = [
  {
    id: 'the-rock',
    name: 'The Rock Eyebrow Raise',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'gigachad',
    name: 'GigaChad',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'doge',
    name: 'Doge / Wow',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cheems',
    name: 'Cheems Bonk',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'crying-cat',
    name: 'Crying Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'bruh-face',
    name: 'Disappointed Bruh',
    url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'michael-scott',
    name: 'Michael Scott NO!',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'surprised-pikachu',
    name: 'Surprised Pikachu / Oof',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'steven-he',
    name: 'Emotional Damage',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'mocking-spongebob',
    name: 'Mocking SpongeBob',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'airhorn',
    name: 'MLG Illuminati Horn',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rick-astley',
    name: 'Rick Astley',
    url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'metal-pipe',
    name: 'Metal Pipe',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'illuminati',
    name: 'Illuminati Triangle',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'sheesh',
    name: 'Sheesh Drip',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'dramatic-prairie-dog',
    name: 'Dramatic Look',
    url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=500&auto=format&fit=crop&q=80'
  }
];

// Cache of templates from Imgflip API
let imgflipCache: MemeTemplate[] | null = null;

export async function fetchImgflipMemes(): Promise<MemeTemplate[]> {
  if (imgflipCache && imgflipCache.length > 0) {
    return imgflipCache;
  }
  try {
    const res = await fetch('https://api.imgflip.com/get_memes');
    if (!res.ok) throw new Error('Failed to load memes from API');
    const data = await res.json();
    if (data && data.success && Array.isArray(data.data?.memes)) {
      const mapped: MemeTemplate[] = data.data.memes.map((m: { id: string; name: string; url: string; width?: number; height?: number }) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        width: m.width,
        height: m.height
      }));
      imgflipCache = mapped;
      return mapped;
    }
  } catch (err) {
    console.warn('Could not fetch external Imgflip memes, using curated collection:', err);
  }
  return CURATED_MEMES;
}

export async function getOpenApiMemeForSound(titleOrFilename: string, index = 0): Promise<string> {
  const memes = await fetchImgflipMemes();
  if (!memes || memes.length === 0) {
    return CURATED_MEMES[index % CURATED_MEMES.length].url;
  }

  const clean = titleOrFilename.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 2);

  // 1. Try to find a meme whose name contains any word from the sound filename
  for (const word of words) {
    const match = memes.find(m => m.name.toLowerCase().includes(word));
    if (match) return match.url;
  }

  // 2. Keyword association dictionary for funny reactions
  const associations: Record<string, string[]> = {
    cry: ['sad', 'crying', 'cat', 'tears', 'baby'],
    laugh: ['giggle', 'haha', 'lol', 'laugh', 'joke'],
    scared: ['scream', 'fear', 'panic', 'panik', 'run'],
    angry: ['rage', 'mad', 'slap', 'yell', 'batman'],
    fail: ['loss', 'clown', 'oops', 'bonk', 'loser'],
    win: ['chad', 'victory', 'champion', 'success', 'boss'],
    shock: ['surprised', 'pikachu', 'what', 'shock', 'gasp'],
    smart: ['brain', 'think', 'roll safe', 'mind', 'iq'],
    sleep: ['tired', 'bed', 'rest', 'snooze', 'boring'],
    money: ['rich', 'cash', 'trade', 'stonks', 'offer']
  };

  for (const [memeKeyword, soundWords] of Object.entries(associations)) {
    if (soundWords.some(sw => clean.includes(sw))) {
      const match = memes.find(m => m.name.toLowerCase().includes(memeKeyword));
      if (match) return match.url;
    }
  }

  // 3. Fallback: distribute across the top trending memes from open API
  const selected = memes[index % memes.length];
  return selected.url;
}

export function resolveMemeImage(imageProp?: string, presetKey?: string, title?: string, index = 0): string {
  if (imageProp) {
    if (imageProp.startsWith('http://') || imageProp.startsWith('https://') || imageProp.startsWith('data:') || imageProp.startsWith('blob:')) {
      return imageProp;
    }
    if (imageProp.startsWith('./') || imageProp.startsWith('/')) {
      return imageProp;
    }
    return `./images/${imageProp}`;
  }

  if (presetKey) {
    const match = CURATED_MEMES.find(m => m.id === presetKey || m.name.toLowerCase().includes(presetKey.toLowerCase()));
    if (match) return match.url;
  }

  if (title) {
    const lower = title.toLowerCase();
    const match = CURATED_MEMES.find(m => lower.includes(m.id) || m.name.toLowerCase().split(' ').some(w => lower.includes(w)));
    if (match) return match.url;
  }

  return CURATED_MEMES[index % CURATED_MEMES.length].url;
}
