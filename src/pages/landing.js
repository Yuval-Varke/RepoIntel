export function renderLanding(container, state) {
  container.innerHTML = `
    <div class="bg-background-dark text-slate-200 font-sans selection:bg-primary selection:text-white transition-colors duration-300 min-h-screen relative overflow-hidden">
      <div class="fixed inset-0 pointer-events-none paper-texture z-0"></div>
      
      <nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div class="glass px-6 py-3 rounded-full flex items-center justify-between shadow-2xl">
          <div class="flex items-center gap-2">
            <div class="w-12 h-12 flex items-center justify-center">
              <img src="/logo_512x512.gif" class="w-12 h-12 object-contain mix-blend-lighten" alt="RepoIntel Logo" />
            </div>
            <span class="font-serif italic pl-2 text-2xl tracking-tight text-white">RepoIntel</span>
          </div>
          <div class="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a class="hover:text-primary transition-colors" href="#">Documentation</a>
            <a class="hover:text-primary transition-colors" href="#">Showcase</a>
            <a class="hover:text-primary transition-colors" href="#">Pricing</a>
          </div>
          <div class="flex items-center gap-4">
            <a class="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-semibold hover:opacity-90 transition-opacity" href="https://github.com">
              <span class="material-symbols-outlined text-sm">code</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      <main class="relative z-10 pt-48 pb-32 px-6">
        <section class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div class="relative">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono mb-8 border border-primary/20">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              From Repo to Results
            </div>
            <h1 class="font-serif text-7xl md:text-8xl lg:text-9xl leading-[0.85] text-white mb-6">
              Understand <br/>
              <span class="italic font-light">Any</span> <br/>
              <span class="font-sans font-bold tracking-tighter uppercase text-6xl md:text-7xl lg:text-8xl opacity-90">Codebase</span>
            </h1>
            <p class="text-xl md:text-2xl font-light text-slate-400 max-w-md leading-relaxed">
              A boutique analysis engine that turns hours of digging into seconds of clarity.
            </p>
            <svg class="hand-drawn-arrow" fill="none" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10C30 40 70 45 85 15" stroke="white" stroke-linecap="round" stroke-width="1.5"></path>
              <path d="M78 18L86 14L88 23" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
            </svg>
          </div>

          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent-gold/30 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div class="relative glass p-8 md:p-12 rounded-[32px] shadow-2xl">
              <div class="mb-8">
                <label class="block text-xs font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Repository URL</label>
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="relative flex-grow">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                    <input id="repo-input" class="w-full bg-white/5 border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:ring-primary focus:border-primary transition-all placeholder:text-slate-600 text-white" placeholder="github.com/owner/repo" type="text" value="${state.repoUrl || ''}"/>
                  </div>
                  <button id="analyze-btn" class="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                    Analyze
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
                <p id="hero-error" class="text-red-500 text-xs mt-2 ml-4 min-h-[18px]">${state.error || ''}</p>
                <p class="mt-4 text-xs font-mono text-slate-500 text-center sm:text-left">
                  Try: <span class="underline cursor-pointer hover:text-primary">supabase/supabase</span> or <span class="underline cursor-pointer hover:text-primary">public-apis/public-apis</span>
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-2xl border-white/5">
                  <span class="material-symbols-outlined text-primary mb-2">insights</span>
                  <div class="text-sm font-bold">Deep Insights</div>
                  <div class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">AI Powered</div>
                </div>
                <div class="glass p-4 rounded-2xl border-white/5">
                  <span class="material-symbols-outlined text-primary mb-2">architecture</span>
                  <div class="text-sm font-bold">Flow Diagrams</div>
                  <div class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Interactive</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="max-w-5xl mx-auto mt-32">
          <div class="grid md:grid-cols-3 gap-12">
            <div class="group cursor-default">
              <div class="text-primary font-mono text-xl mb-4">01.</div>
              <h3 class="font-serif text-3xl mb-4 group-hover:italic transition-all text-white">Instant Context</h3>
              <p class="text-slate-500 leading-relaxed text-sm">No more reading thousands of lines. Get a plain English explanation of any file structure instantly.</p>
            </div>
            <div class="group cursor-default">
              <div class="text-primary font-mono text-xl mb-4">02.</div>
              <h3 class="font-serif text-3xl mb-4 group-hover:italic transition-all text-white">Health Scores</h3>
              <p class="text-slate-500 leading-relaxed text-sm">Quantify technical debt with our proprietary 100-point repository health algorithm.</p>
            </div>
            <div class="group cursor-default">
              <div class="text-primary font-mono text-xl mb-4">03.</div>
              <h3 class="font-serif text-3xl mb-4 group-hover:italic transition-all text-white">AI Actions</h3>
              <p class="text-slate-500 leading-relaxed text-sm">One-click GitHub issue creation for technical debt, refactors, and missing documentation.</p>
            </div>
          </div>
        </section>
      </main>

      <footer class="relative z-10 border-t border-white/5 py-12 px-6">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div class="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <img src="/logo_512x512.gif" class="w-6 h-6 object-contain mix-blend-lighten" alt="RepoIntel Logo" />
            <span class="font-serif italic text-lg tracking-tight text-white">RepoIntel</span>
          </div>
          <div class="text-slate-500 font-mono text-[10px] tracking-widest uppercase">
            © 2026 - By Yuval Varke
          </div>
          <div class="flex gap-6">
            <a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">brand_awareness</span></a>
            <a class="text-slate-500 hover:text-primary transition-colors" href="#"><span class="material-symbols-outlined">code</span></a>
          </div>
        </div>
      </footer>

      <div class="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  `;

  // Events
  const input = document.getElementById('repo-input');
  const btn = document.getElementById('analyze-btn');
  const errorEl = document.getElementById('hero-error');

  function handleAnalyze() {
    let url = input.value.trim();
    if (!url) { errorEl.textContent = 'Enter a repository URL'; return; }
    // Auto-prepend https://github.com/ if just owner/repo
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(url)) {
      url = 'https://github.com/' + url;
    }
    if (!/github\.com\/[^\/]+\/[^\/]+/.test(url)) {
      errorEl.textContent = 'Enter a valid GitHub URL, e.g. github.com/owner/repo';
      return;
    }
    errorEl.textContent = '';

    // Dynamic import to use analyzeRepo from main.js
    import('../main.js').then(m => m.analyzeRepo(url));
  }

  btn.addEventListener('click', handleAnalyze);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleAnalyze(); });

  // Hint clicks
  document.querySelectorAll('.underline.cursor-pointer').forEach(hint => {
    hint.addEventListener('click', () => {
      input.value = hint.innerText;
      handleAnalyze();
    });
  });

  input.focus();
}
