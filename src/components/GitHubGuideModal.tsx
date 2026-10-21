import React, { useState } from 'react';
import { X, Github, FolderTree, FileAudio, Check, Copy, ArrowRight, ExternalLink } from 'lucide-react';

interface GitHubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedAction, setCopiedAction] = useState(false);

  if (!isOpen) return null;

  const sampleActionYaml = `name: Deploy Soundboard to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build static soundboard
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const copyYaml = async () => {
    await navigator.clipboard.writeText(sampleActionYaml);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>GitHub Pages Deployment & Dynamic Audio Guide</span>
              </h2>
              <p className="text-xs text-slate-400">
                How to host statically and dynamically add new .ogg sound files
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Project Directory Structure</span>
            </h3>
            <p className="text-xs text-slate-400">
              The app is 100% static and configured with <code className="text-cyan-300 font-mono">base: './'</code> in Vite so it automatically loads relative sound files on GitHub Pages:
            </p>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
              <p className="text-amber-400">your-meme-soundboard/</p>
              <p>├── <span className="text-rose-400 font-bold">public/</span></p>
              <p>│   ├── <span className="text-emerald-400 font-bold">sounds.json</span> <span className="text-slate-400">// List of sound objects</span></p>
              <p>│   ├── <span className="text-cyan-400 font-bold">sounds/</span> <span className="text-slate-400">// Drop all your .ogg audio files here!</span></p>
              <p>│   │   ├── vine-boom.ogg</p>
              <p>│   │   ├── bruh.ogg</p>
              <p>│   │   └── my-new-voice.ogg</p>
              <p>│   └── <span className="text-purple-400 font-bold">images/</span> <span className="text-slate-400">// (Optional) local meme images</span></p>
              <p>├── src/</p>
              <p>└── package.json</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Adding More Audio Files in the Future</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <p>
                1. Put your new audio file (e.g. <code className="text-cyan-300 font-mono">giggle.ogg</code>) inside <code className="text-cyan-300 font-mono">public/sounds/</code>.
              </p>
              <p>
                2. Open <code className="text-emerald-300 font-mono">public/sounds.json</code> and add an object:
              </p>
              <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`{
  "id": "giggle",
  "title": "Funny Giggle",
  "sound": "giggle.ogg",
  "image": "https://images.unsplash.com/...",
  "category": "Reactions",
  "hotkey": "G"
}`}
              </pre>
              <p className="text-slate-400">
                You can also use the in-app <strong className="text-rose-400">"Add Sound"</strong> button or <strong className="text-cyan-400">"Export sounds.json"</strong> button anytime to generate and download the updated JSON!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base">
                <span className="w-6 h-6 rounded-lg bg-rose-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Automatic GitHub Actions Deploy (Recommended)</span>
              </h3>
              <button
                type="button"
                onClick={copyYaml}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                {copiedAction ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAction ? 'Copied YAML!' : 'Copy Workflow'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Create a file at <code className="text-cyan-300 font-mono">.github/workflows/deploy.yml</code> in your repository. Then go to <strong>GitHub Repo Settings &gt; Pages &gt; Source: GitHub Actions</strong>. Every time you push, it will automatically publish your soundboard!
            </p>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[11px] overflow-x-auto max-h-48 scrollbar-thin">
              {sampleActionYaml}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Got it, Let's Make Noise!
          </button>
        </div>

      </div>
    </div>
  );
};
