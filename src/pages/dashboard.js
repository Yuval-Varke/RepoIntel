import { exportAsPDF } from '../utils/export.js';
import { navigateTo } from '../main.js';

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

export function renderDashboard(container, state) {
  const d = state.analysisData;
  if (!d || !d.repoData) {
    return container.innerHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-zinc-950">
        <h1 class="editorial-title text-4xl mb-4 text-zinc-50 dark:text-zinc-50">Something went wrong</h1>
        <p class="text-zinc-500 mb-8">Missing analysis data. Please try again.</p>
        <button class="bg-primary text-white px-8 py-3 rounded-xl font-bold" onclick="window.location.reload()">Return Home</button>
      </div>
    `;
  }

  const meta = d.repoData.metadata;
  const analysis = d.analysis;
  const scores = analysis.scores;
  const langs = Object.entries(d.repoData.languages || {}).sort((a, b) => b[1].bytes - a[1].bytes);
  const mainLang = langs[0] ? langs[0][0] : 'Unknown';

  container.innerHTML = `
    <div class="bg-zinc-950 text-zinc-100 dark:text-zinc-200 transition-colors duration-300 min-h-screen relative">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2 cursor-pointer" id="logo-home">
            <div class="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-xl">folder_managed</span>
            </div>
            <span class="font-display text-xl font-semibold tracking-tight">RepoIntel</span>
          </div>
          <div class="flex items-center gap-6">
            <div class="hidden md:flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <button id="export-pdf-top" class="hover:text-primary transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">download</span>
                Export Report
              </button>
            </div>
            <div class="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
            <div class="flex items-center gap-3">
              <button id="back-home-nav" class="bg-zinc-100 text-zinc-100 px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">
                Analyze New
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <!-- Header Section -->
        <header class="mb-16 lg:mb-24">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div class="max-w-3xl">
              <div class="flex items-center gap-3 mb-6">
                <span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-mono tracking-widest uppercase rounded">
                  ${meta.visibility || 'Public'} Repository
                </span>
                <span class="h-1 w-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
                <span class="text-sm font-mono text-primary">${mainLang} Core</span>
              </div>
              <h1 class="editorial-title text-6xl lg:text-8xl font-medium text-zinc-100 dark:text-zinc-50 mb-6 leading-[0.9]">
                ${meta.name}
              </h1>
              <p class="font-mono text-zinc-500 dark:text-zinc-400 text-lg">
                @${meta.owner || d.repository?.owner || 'unknown'} / <span class="text-zinc-400 dark:text-zinc-600">${meta.description || 'No description provided.'}</span>
              </p>
            </div>
            <div class="flex flex-wrap gap-2 lg:mb-2">
              <div class="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                <span class="material-symbols-outlined text-[16px] text-zinc-400">star</span>
                <span class="text-xs font-semibold">${formatNum(meta.stars)}</span>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                <span class="material-symbols-outlined text-[16px] text-zinc-400">fork_right</span>
                <span class="text-xs font-semibold">${formatNum(meta.forks)}</span>
              </div>
              <div class="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                <span class="material-symbols-outlined text-[16px] text-zinc-400">visibility</span>
                <span class="text-xs font-semibold">${formatNum(meta.watchers)}</span>
              </div>
            </div>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div class="lg:col-span-8 space-y-20">
            <!-- Summary Section -->
            <section>
              <div class="flex items-center gap-4 mb-8">
                <span class="text-xs font-mono text-primary uppercase tracking-[0.2em]">Analysis Intelligence</span>
                <div class="flex-grow h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
              <div class="prose prose-zinc dark:prose-invert max-w-none">
                <h2 class="editorial-title text-4xl mb-8 italic">Architecture Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 leading-relaxed text-zinc-600 dark:text-zinc-400 font-serif text-xl italic">
                  <p class="not-italic font-sans text-base text-zinc-800 dark:text-zinc-300">
                    <span class="text-6xl font-display mr-3 float-left text-primary leading-[1]">${(analysis.summary || 'T')[0]}</span>
                    ${(analysis.summary || 'his repository represents a sophisticated organization of concerns.').slice(1)}
                  </p>
                  <p>
                    ${analysis.deepDive || 'The codebase demonstrates a commitment to modularity. Each component appears to fulfill a specific role within the larger system ecosystem.'}
                  </p>
                </div>
                <blockquote class="my-16 border-l-0 pl-0 relative">
                  <span class="material-symbols-outlined absolute -top-10 -left-4 text-6xl text-zinc-100 dark:text-zinc-100 -z-10 select-none">format_quote</span>
                  <p class="editorial-title text-3xl text-zinc-100 dark:text-zinc-100 italic leading-snug">
                    "${analysis.keyInsight || 'A sophisticated project structure that prioritizes long-term maintainability and clear data flow protocols.'}"
                  </p>
                  <cite class="text-sm font-mono text-zinc-500 not-italic">— RepoIntel AI Synthesis</cite>
                </blockquote>
              </div>
            </section>

            <!-- Scores Section -->
            <section class="glass-panel p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="flex flex-col justify-center items-center text-center">
                  <div class="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg class="w-full h-full -rotate-90" viewBox="0 0 128 128">
                      <circle class="text-zinc-100 dark:text-zinc-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-width="8"></circle>
                      <circle class="text-primary transition-all duration-1000" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-dasharray="364.4" stroke-dashoffset="${364.4 - (364.4 * (scores.global || 0) / 100)}" stroke-linecap="round" stroke-width="8"></circle>
                    </svg>
                    <span class="absolute text-3xl font-display font-bold text-zinc-100 dark:text-white">${scores.global || '...'}</span>
                  </div>
                  <span class="text-xs font-mono uppercase tracking-widest text-zinc-500">Global Health Score</span>
                </div>
                <div class="md:col-span-2 grid grid-cols-2 gap-y-6 gap-x-12">
                  ${['quality', 'security', 'maintainability', 'documentation'].map(key => `
                    <div>
                      <div class="flex justify-between text-xs font-mono mb-2 uppercase text-zinc-500">
                        <span>${key}</span>
                        <span>${scores[key]}%</span>
                      </div>
                      <div class="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div class="h-full bg-primary transition-all duration-1000" style="width: ${scores[key]}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>

            <!-- Observation List -->
            <section class="space-y-6">
              <h3 class="text-sm font-mono text-zinc-400 uppercase tracking-widest">Strategic Observations</h3>
              <div class="space-y-4">
                ${(analysis.observations || []).map((obs, i) => `
                  <div class="flex items-start gap-4 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <div class="p-2 ${obs.type === 'risk' ? 'bg-orange-500/10' : 'bg-blue-500/10'} rounded">
                      <span class="material-symbols-outlined text-primary">${obs.type === 'risk' ? 'warning' : 'info'}</span>
                    </div>
                    <div class="flex-grow">
                      <div class="flex items-center justify-between mb-1">
                        <h4 class="font-medium text-zinc-100 dark:text-white">${obs.title}</h4>
                        <span class="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">${obs.priority || 'Medium'}</span>
                      </div>
                      <p class="text-sm text-zinc-500 dark:text-zinc-400">${obs.description || obs.content}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
            
            <!-- How to Run Locally -->
            <section class="mt-20">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-green-500">terminal</span>
                </div>
                <div>
                  <h3 class="font-medium text-zinc-100">How to Run Locally</h3>
                  <p class="text-xs text-zinc-500">Quick start commands to get this running</p>
                </div>
              </div>
              
              <div class="space-y-3">
                ${(analysis.runInstructions || []).map((step, i) => `
                  <div class="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-900/20 group hover:border-zinc-700 transition-all">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-xs font-mono text-zinc-500 border border-zinc-700/50 group-hover:text-zinc-300 transition-colors">${i + 1}</div>
                    <div class="flex-grow font-mono text-sm ${step.command ? 'text-zinc-300' : 'text-zinc-400 italic'} truncate">
                      ${step.command || step.step}
                    </div>
                    ${step.command ? `
                      <button class="flex-shrink-0 text-zinc-500 hover:text-white transition-colors p-1" 
                        onclick="const btn = this; const icon = btn.querySelector('.material-symbols-outlined'); navigator.clipboard.writeText('${step.command.replace(/'/g, "\\'")}'); icon.innerText = 'check'; icon.classList.add('text-green-500'); btn.classList.add('pulse'); setTimeout(() => { icon.innerText = 'content_copy'; icon.classList.remove('text-green-500'); btn.classList.remove('pulse'); }, 2000);">
                        <span class="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 space-y-12">
            <!-- Tech Stack Panel -->
            <div class="bg-zinc-100/50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <h3 class="editorial-title text-2xl mb-8">Tech Stack</h3>
              <div class="grid grid-cols-2 gap-4">
                ${langs.slice(0, 4).map(([name]) => `
                  <div class="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div class="w-8 h-8 flex items-center justify-center">
                      <span class="material-symbols-outlined text-zinc-400 text-sm">code</span>
                    </div>
                    <span class="text-sm font-medium text-zinc-100 dark:text-zinc-200">${name}</span>
                  </div>
                `).join('')}
              </div>
              <div class="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <div class="flex justify-between items-center mb-4 text-xs font-mono text-zinc-500 uppercase">
                  <span>Composition</span>
                </div>
                <div class="space-y-4">
                  ${langs.slice(0, 3).map(([name, info]) => `
                    <div>
                      <div class="flex justify-between text-xs mb-1">
                        <span class="text-zinc-500">${name}</span>
                        <span class="font-mono text-zinc-100 dark:text-zinc-300">${info.percentage || info.percent || '0'}%</span>
                      </div>
                      <div class="h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div class="h-full bg-zinc-900 dark:bg-zinc-200" style="width: ${info.percentage || info.percent || 0}%"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <!-- Metadata List -->
            <div class="px-4">
              <h3 class="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-6">Discovery Data</h3>
              <div class="space-y-6">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <span class="material-symbols-outlined text-zinc-400 text-xl">schedule</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-zinc-100 dark:text-zinc-200">Last Synced</p>
                    <p class="text-xs text-zinc-500 uppercase font-mono">${new Date(meta.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <span class="material-symbols-outlined text-zinc-400 text-xl">balance</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-zinc-100 dark:text-zinc-200">License</p>
                    <p class="text-xs text-zinc-500 uppercase font-mono">${meta.license || 'Proprietary'}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <!-- Footer Footer -->
        <footer class="mt-32 pt-16 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <h4 class="editorial-title text-3xl mb-8 dark:text-white italic">Analyze another repository?</h4>
          <div class="max-w-xl mx-auto flex gap-4">
            <input id="footer-repo-input" class="flex-grow bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary text-zinc-100 dark:text-white" placeholder="https://github.com/..." type="text"/>
            <button id="footer-analyze-btn" class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-100 px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">Analyze</button>
          </div>
          <p class="mt-12 text-zinc-400 text-xs font-mono tracking-widest uppercase">RepoIntel © 2024 — Hand-crafted for code clarity.</p>
        </footer>
      </main>

    </div>
  `;

  // Events
  document.getElementById('logo-home')?.addEventListener('click', () => navigateTo('landing'));
  document.getElementById('back-home-nav')?.addEventListener('click', () => navigateTo('landing'));
  document.getElementById('export-pdf-top')?.addEventListener('click', () => exportAsPDF(d));



  const footerInput = document.getElementById('footer-repo-input');
  const footerBtn = document.getElementById('footer-analyze-btn');

  footerBtn?.addEventListener('click', () => {
    const val = footerInput.value.trim();
    if (val) {
      import('../main.js').then(m => m.analyzeRepo(val));
    }
  });

  // Smooth scroll to top on render
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
