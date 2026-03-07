import { exportAsPDF } from '../utils/export.js';
import { navigateTo } from '../main.js';
import { renderMermaid } from '../components/mermaid.js';
import { initAccordions } from '../components/accordion.js';

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
      <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div class="glass px-6 py-3 rounded-full flex items-center justify-between shadow-2xl">
          <div class="flex items-center gap-2 transition-transform hover:scale-[1.02] duration-300">
            <div class="w-12 h-12 flex items-center justify-center">
              <img src="/logo_512x512.gif" class="w-12 h-12 object-contain mix-blend-lighten" alt="RepoIntel Logo" />
            </div>
            <div class="flex flex-col items-start -space-y-1">
              <span class="font-serif italic pl-2 text-3xl tracking-tight text-white leading-none">RepoIntel</span>
              <span class="text-[10px] font-mono tracking-[0.25em] uppercase text-slate-300/70 pl-2 mt-1 pt-2">From Repo to Results</span>
            </div>
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
              <button id="back-home-nav" class="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                Analyze New
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-6 pt-32 pb-12 lg:pb-20">
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
              <p class="font-mono text-zinc-500 dark:text-zinc-400 text-lg flex items-center gap-2 flex-wrap">
                <a href="${meta.htmlUrl || `https://github.com/${meta.fullName}`}" target="_blank" class="hover:text-primary transition-colors inline-flex items-center gap-1 group">
                  @${meta.owner || d.repository?.owner || 'unknown'}
                  <span class="text-zinc-600 group-hover:text-primary transition-colors">/</span>
                </a>
                <span class="text-zinc-400 dark:text-zinc-600">${meta.description || 'No description provided.'}</span>
              </p>
            </div>
            <div class="flex flex-col items-end gap-6 lg:mb-2">
              ${state.fromCache ? `
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-widest">
                    <span class="material-symbols-outlined text-[14px] text-zinc-500">inventory_2</span>
                    Loaded from cache
                  </div>
                  <button id="refresh-analysis" class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 group">
                    <span class="material-symbols-outlined text-[14px] group-hover:rotate-180 transition-transform duration-500">sync</span>
                    Refresh Analysis
                  </button>
                </div>
              ` : ''}
              <div class="flex flex-wrap gap-2">
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
                    ${(analysis.summary || 'A').slice(1)}
                  </p>
                  <p>
                    ${analysis.deepDive}
                  </p>
                </div>
                <blockquote class="my-16 border-l-0 pl-0 relative">
                  <span class="material-symbols-outlined absolute -top-10 -left-4 text-6xl text-zinc-100 dark:text-zinc-100 -z-10 select-none">format_quote</span>
                  <p class="editorial-title text-3xl text-zinc-100 dark:text-zinc-100 italic leading-snug">
                    ${analysis.keyInsight}
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
                  <span class="text-xs font-mono uppercase tracking-widest text-zinc-500">Repository Score</span>
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

            <!-- Architecture Diagram -->
            ${analysis.mermaidDiagram ? `
            <section class="mt-20">
              <div class="flex items-center gap-4 mb-8">
                <span class="text-xs font-mono text-primary uppercase tracking-[0.2em]">System Architecture</span>
                <div class="flex-grow h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              </div>

              <div class="flex items-center gap-4 mb-8">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">schema</span>
                </div>
                <div>
                  <h2 class="editorial-title text-4xl italic">Architecture Diagram</h2>
                  <p class="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">AI-generated project structure visualization</p>
                </div>
              </div>

              <div class="glass-panel rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div class="p-6 flex items-center justify-center min-h-[300px]" id="mermaid-diagram">
                  <div class="flex flex-col items-center gap-3 text-zinc-500">
                    <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    <span class="text-xs font-mono">Rendering diagram...</span>
                  </div>
                </div>
              </div>
            </section>
            ` : ''}
            
            <!-- How to Run Locally -->
            <section class="mt-20">
              <div class="flex items-center gap-4 mb-8">
                <span class="text-xs font-mono text-primary uppercase tracking-[0.2em]">Deployment Guide Section</span>
                <div class="flex-grow h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
              
              <div class="flex items-center gap-4 mb-8">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-primary">terminal</span>
                </div>
                <div>
                  <h2 class="editorial-title text-4xl italic">How to Run Locally</h2>
                  <p class="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">Quick start commands for local setup</p>
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
                        data-command="${step.command.replace(/"/g, '&quot;')}"
                        onclick="const btn = this; const icon = btn.querySelector('.material-symbols-outlined'); navigator.clipboard.writeText(btn.getAttribute('data-command')); icon.innerText = 'check'; icon.classList.add('text-green-500'); btn.classList.add('pulse'); setTimeout(() => { icon.innerText = 'content_copy'; icon.classList.remove('text-green-500'); btn.classList.remove('pulse'); }, 2000);">
                        <span class="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Repository Structure -->
            <section class="mt-32">
              <div class="flex items-center gap-4 mb-10">
                <span class="text-xs font-mono text-primary uppercase tracking-[0.2em]">Asset Inventory Section</span>
                <div class="flex-grow h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
              </div>
              
              <h2 class="editorial-title text-4xl mb-12 italic">Repository Structure</h2>

              <div class="glass-panel rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <!-- Header Component -->
                <div class="p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/10">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
                      <span class="material-symbols-outlined text-zinc-400">folder_zip</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-display text-xl font-bold text-zinc-100">File Structure</h3>
                        <span class="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <span class="material-symbols-outlined text-[10px]">terminal</span> ${meta.defaultBranch || 'main'}
                        </span>
                      </div>
                      <p class="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                        ${d.repoData.fileCount} Files • ${d.repoData.folderStructure.length} Folders
                      </p>
                    </div>
                  </div>
                  
                  <div class="relative group">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">search</span>
                    <input id="tree-search" type="text" placeholder="Search files and folders..." class="bg-zinc-900/40 border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary w-full md:w-80 text-zinc-300 placeholder-zinc-600 transition-all"/>
                  </div>
                </div>

                <!-- Language Tags -->
                <div class="px-8 py-4 bg-zinc-900/5 flex flex-wrap gap-2 border-b border-zinc-800/50">
                  ${langs.slice(0, 5).map(([name]) => `
                    <span class="px-2 py-1 rounded-md bg-zinc-900/40 border border-zinc-800 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 hover:text-zinc-300 pointer-events-none transition-colors">
                      <span class="h-1 w-1 rounded-full bg-primary/40"></span> ${name}
                    </span>
                  `).join('')}
                </div>

                <!-- Tree View Container -->
                <div class="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <div id="tree-container" class="space-y-0.5">
                    ${(() => {
      const buildTree = (files) => {
        const root = {};
        files.forEach(path => {
          const parts = path.split('/');
          let current = root;
          parts.forEach((part, i) => {
            if (!current[part]) {
              current[part] = (i === parts.length - 1) ? null : {};
            }
            current = current[part];
          });
        });
        return root;
      };

      const renderNode = (node, name, depth = 0) => {
        const isFolder = node !== null;

        if (isFolder) {
          const children = Object.entries(node).sort((a, b) => {
            const aFolder = a[1] !== null;
            const bFolder = b[1] !== null;
            if (aFolder && !bFolder) return -1;
            if (!aFolder && bFolder) return 1;
            return a[0].localeCompare(b[0]);
          });

          return `
            <details open class="tree-folder group/folder">
              <summary class="tree-row list-none flex items-center gap-2 py-1.5 hover:bg-white/5 px-2 rounded-lg transition-all cursor-pointer group" data-name="${name.toLowerCase()}" data-type="folder" style="padding-left: ${depth * 20 + 8}px">
                <span class="material-symbols-outlined text-[16px] text-zinc-600 transition-transform group-open:rotate-180">expand_more</span>
                <span class="material-symbols-outlined text-primary/80 group-hover:text-primary text-xl transition-colors">folder</span>
                <span class="text-sm font-medium text-zinc-200 group-hover:text-white">${name}</span>
                <span class="ml-auto text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-tight">${children.length} items</span>
              </summary>
              <div class="border-l border-zinc-200/5 dark:border-zinc-800/30 ml-[23px] my-0.5">
                ${children.map(([childName, childNode]) => renderNode(childNode, childName, depth + 1)).join('')}
              </div>
            </details>
          `;
        } else {
          return `
            <div class="tree-row flex items-center gap-2 py-1.5 hover:bg-white/5 px-2 rounded-lg transition-all cursor-default group" data-name="${name.toLowerCase()}" data-type="file" style="padding-left: ${depth * 20 + 28}px">
              <span class="material-symbols-outlined text-zinc-500 group-hover:text-zinc-300 text-lg transition-colors">description</span>
              <span class="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">${name}</span>
              <span class="ml-auto text-[9px] font-mono text-zinc-700 uppercase tracking-tighter">indexed</span>
            </div>
          `;
        }
      };

      const tree = buildTree(d.repoData.fileStructure.slice(0, 50)); // Limit to first 50 for performance
      return Object.entries(tree).sort((a, b) => {
        const aFolder = a[1] !== null;
        const bFolder = b[1] !== null;
        if (aFolder && !bFolder) return -1;
        if (!aFolder && bFolder) return 1;
        return a[0].localeCompare(b[0]);
      }).map(([name, node]) => renderNode(node, name)).join('');
    })()}
                  </div>
                  <div id="tree-empty" class="hidden py-20 text-center">
                    <span class="material-symbols-outlined text-zinc-800 text-5xl mb-4">search_off</span>
                    <p class="text-zinc-600 text-xs font-mono uppercase tracking-[0.2em]">No matching files found</p>
                  </div>
                </div>

                <!-- Footer Stats -->
                <div class="px-8 py-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
                   <div class="flex items-center gap-2">
                     <span class="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"></span>
                     <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">${d.repoData.fileCount} files indexed in analysis</span>
                   </div>
                   <span class="text-[10px] font-mono text-zinc-600 uppercase">Snapshot v1.0</span>
                </div>
              </div>
            </section>

            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 space-y-12 lg:sticky lg:top-28 lg:self-start">
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

        <!-- Core Features & Strategic Observations Grid -->
        <section class="mt-20">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Core Features -->
            <div class="space-y-4">
              <h3 class="text-sm font-mono text-primary uppercase tracking-widest">Core Features</h3>
              <div class="space-y-2">
                ${(analysis.highlights || []).map(h => `
                  <div class="flex items-start gap-3 p-4 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/30 transition-all group">
                    <div class="p-1.5 bg-emerald-500/10 rounded flex-shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                    </div>
                    <p class="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors leading-relaxed">${h}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Strategic Observations -->
            <div class="space-y-4">
              <h3 class="text-sm font-mono text-primary uppercase tracking-widest">Strategic Observations</h3>
              <div class="accordion space-y-2">
                ${(analysis.observations || []).map((obs, i) => `
                  <div class="accordion-item border border-zinc-800 rounded-xl overflow-hidden transition-all">
                    <button class="accordion-header w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-900/50 transition-colors">
                      <div class="p-1.5 ${obs.type === 'risk' ? 'bg-orange-500/10' : 'bg-blue-500/10'} rounded flex-shrink-0">
                        <span class="material-symbols-outlined text-primary text-lg">${obs.type === 'risk' ? 'warning' : 'info'}</span>
                      </div>
                      <div class="flex-grow min-w-0">
                        <h4 class="font-medium text-sm text-zinc-100 truncate">${obs.title}</h4>
                      </div>
                      <span class="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0 text-zinc-400">${obs.priority || 'Medium'}</span>
                      <span class="material-symbols-outlined accordion-chevron text-zinc-500 text-lg flex-shrink-0 transition-transform">expand_more</span>
                    </button>
                    <div class="accordion-content">
                      <div class="accordion-body px-4 pb-4 pt-0">
                        <p class="text-sm text-zinc-400 leading-relaxed pl-10">${obs.description || obs.content}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- Recommendations & Actions Section -->
        <section class="mt-32">
          <div class="flex items-center gap-4 mb-10">
            <span class="text-xs font-mono text-primary uppercase tracking-[0.2em]">Issues Section</span>
            <div class="flex-grow h-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
          </div>
          
          <h2 class="editorial-title text-4xl mb-12 italic">AI Recommended Issues</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="action-content">
            ${analysis.recommendations.length > 0 ? analysis.recommendations.map(r => `
              <div class="action-card group p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div>
                  <div class="flex gap-4 mb-4">
                    <div class="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0 shadow-inner group-hover:border-primary/30 transition-colors">
                      <span class="material-symbols-outlined text-zinc-600 group-hover:text-primary transition-colors text-xl">
                        ${r.category === 'Testing' ? 'science' : r.category === 'Documentation' ? 'description' : r.category === 'Technical Debt' ? 'architecture' : r.category === 'Infrastructure' ? 'hub' : 'settings'}
                      </span>
                    </div>
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <h4 class="font-display text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">${r.title}</h4>
                      </div>
                      <p class="text-[11px] text-zinc-500 leading-snug group-hover:text-zinc-400 transition-colors line-clamp-2">${r.description}</p>
                    </div>
                  </div>
                </div>

                <a href="https://github.com/${meta.fullName}/issues/new?title=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.description + '\n\n---\n*Synthesis by RepoIntel AI Engine*')}" 
                   target="_blank"
                   class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-white hover:text-zinc-900 rounded-lg text-[9px] font-bold transition-all active:scale-95 shadow-lg shadow-black/20 mt-2">
                  <span class="material-symbols-outlined text-[14px] font-bold">add</span>
                  Create GitHub Issue
                </a>
              </div>
            `).join('') : `
              <div class="col-span-full py-20 text-center">
                <p class="text-zinc-500 font-mono text-sm uppercase tracking-widest">No recommendations available</p>
              </div>
            `}
          </div>
        </section>

        <!-- Footer Footer -->
        <footer class="mt-32 pt-16 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <h4 class="editorial-title text-3xl mb-8 dark:text-white italic">Analyze another repository?</h4>
          <div class="max-w-xl mx-auto flex gap-4">
            <input id="footer-repo-input" class="flex-grow bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary text-zinc-100 dark:text-white" placeholder="https://github.com/..." type="text"/>
            <button id="footer-analyze-btn" class="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">Analyze</button>
          </div>
          <div class="mt-12 flex flex-col items-center gap-4">
            <p class="text-zinc-400 text-xs font-mono tracking-widest uppercase">RepoIntel</p>
            <img src="/logo_512x512.gif" class="w-6 h-6 opacity-40 mix-blend-lighten" alt="RepoIntel Logo" />
          </div>
        </footer>
      </main>

    </div>
  `;

  // Events
  document.getElementById('logo-home')?.addEventListener('click', () => navigateTo('landing'));
  document.getElementById('back-home-nav')?.addEventListener('click', () => navigateTo('landing'));
  document.getElementById('export-pdf-top')?.addEventListener('click', () => exportAsPDF(d));

  // Initialize accordions
  initAccordions();

  // Render Mermaid diagram
  if (analysis.mermaidDiagram) {
    setTimeout(() => {
      renderMermaid('mermaid-diagram', analysis.mermaidDiagram);
    }, 500);
  }

  // Refresh analysis
  document.getElementById('refresh-analysis')?.addEventListener('click', () => {
    import('../main.js').then(m => m.analyzeRepo(state.repoUrl, true));
  });

  // Tree Search Filter
  const treeSearch = document.getElementById('tree-search');
  const treeContainer = document.getElementById('tree-container');

  treeSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const allRows = treeContainer.querySelectorAll('.tree-row');
    const allFolders = treeContainer.querySelectorAll('.tree-folder');

    const emptyState = document.getElementById('tree-empty');

    if (!query) {
      allRows.forEach(r => r.classList.remove('hidden'));
      allFolders.forEach(f => f.classList.remove('hidden'));
      if (emptyState) emptyState.classList.add('hidden');
      return;
    }

    // Hide everything
    allRows.forEach(r => r.classList.add('hidden'));
    allFolders.forEach(f => f.classList.add('hidden'));

    let matchedCount = 0;
    allRows.forEach(row => {
      const name = row.getAttribute('data-name') || '';
      if (name.includes(query)) {
        matchedCount++;
        row.classList.remove('hidden');

        // If folder name matches, show all its contents
        const hostFolder = row.closest('details.tree-folder');
        if (hostFolder && row.tagName === 'SUMMARY') {
          hostFolder.classList.remove('hidden');
          hostFolder.open = true;
          hostFolder.querySelectorAll('.tree-row, .tree-folder').forEach(el => el.classList.remove('hidden'));
        }

        // Show and open all ancestors
        let parent = row.parentElement;
        while (parent && parent !== treeContainer) {
          if (parent.classList.contains('tree-folder')) {
            parent.classList.remove('hidden');
            parent.open = true;
            // Ensure the folder label (summary) is also visible
            const summary = parent.querySelector('summary.tree-row');
            if (summary) summary.classList.remove('hidden');
          }
          parent = parent.parentElement;
        }
      }
    });

    if (emptyState) {
      if (matchedCount > 0) emptyState.classList.add('hidden');
      else emptyState.classList.remove('hidden');
    }
  });


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
