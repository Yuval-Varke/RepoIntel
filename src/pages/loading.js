export function renderLoading(container, state) {
  container.innerHTML = `
    <div class="bg-zinc-950 text-zinc-900 dark:text-zinc-200 transition-colors duration-300 min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div class="fixed inset-0 pointer-events-none paper-texture z-0"></div>
      
      <div class="relative z-10 max-w-lg w-full text-center space-y-12">
        <!-- Brand/Icon -->
        <div class="flex flex-col items-center animate-pulse">
          <div class="w-16 h-16 flex items-center justify-center mb-6">
            <img src="/repointel-brand.gif" class="w-16 h-16 object-contain mix-blend-lighten" alt="RepoIntel Logo" />
          </div>
          <span class="font-display italic text-2xl tracking-tight text-slate-900 dark:text-white">RepoIntel Intelligence</span>
        </div>

        <!-- Main Status -->
        <div class="space-y-4">
          <h1 class="editorial-title text-4xl lg:text-5xl italic font-medium leading-tight">
            Synthesizing core <br/> architectural patterns...
          </h1>
          <p class="font-mono text-zinc-500 dark:text-zinc-400 text-sm tracking-wide">
            Analyzing: <span class="text-primary truncate inline-block max-w-[250px] align-bottom">${state.repoUrl || 'repository'}</span>
          </p>
        </div>

        <!-- Steps List -->
        <div class="space-y-3 text-left max-w-xs mx-auto" id="loading-steps">
          <div class="flex items-center gap-4 group transition-all duration-500" id="step-fetch">
            <div class="w-2 h-2 rounded-full bg-primary animate-ping"></div>
            <span class="text-sm font-medium text-zinc-500 transition-colors duration-500">Connecting to GitHub...</span>
          </div>
          <div class="flex items-center gap-4 opacity-30 transition-all duration-500" id="step-extract">
            <div class="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <span class="text-sm font-medium text-zinc-500">Extracting code signals</span>
          </div>
          <div class="flex items-center gap-4 opacity-30 transition-all duration-500" id="step-ai">
            <div class="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <span class="text-sm font-medium text-zinc-500">AI reasoning stage</span>
          </div>
          <div class="flex items-center gap-4 opacity-30 transition-all duration-500" id="step-render">
            <div class="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <span class="text-sm font-medium text-zinc-500">Formatting editorial report</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="max-w-xs mx-auto">
          <div class="h-1 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-1000 ease-out" id="progress-fill" style="width: 10%"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Decoration -->
      <div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer">
        <div class="flex items-center gap-2 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
          <img src="/repointel-brand.gif" class="w-6 h-6 object-contain mix-blend-lighten" alt="RepoIntel Logo" />
          <span class="font-serif italic text-lg tracking-tight text-white">RepoIntel</span>
        </div>
        <p class="text-[9px] font-mono tracking-[0.2em] uppercase text-zinc-600 group-hover:text-primary transition-colors">From Repo to Results</p>
      </div>

      <!-- Accent Blurs -->
      <div class="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  `;

  runProgress();
}

function runProgress() {
  const fill = document.getElementById('progress-fill');
  const stepIds = ['step-fetch', 'step-extract', 'step-ai', 'step-render'];
  let currentStep = 0;

  const advance = () => {
    if (currentStep < stepIds.length) {
      const el = document.getElementById(stepIds[currentStep]);
      if (el) {
        el.style.opacity = '1';
        const dot = el.querySelector('div');
        if (dot) {
          dot.classList.add('bg-primary');
          dot.classList.add('animate-ping');
          dot.classList.remove('bg-zinc-300', 'dark:bg-zinc-700');
        }

        // Mark previous as completed (stop ping)
        if (currentStep > 0) {
          const prev = document.getElementById(stepIds[currentStep - 1]);
          if (prev) {
            prev.querySelector('div')?.classList.remove('animate-ping');
            prev.querySelector('span')?.classList.remove('text-zinc-500');
            prev.querySelector('span')?.classList.add('text-zinc-900', 'dark:text-zinc-100');
          }
        }
      }
    }

    const pct = Math.min(10 + (currentStep + 1) * 22, 95);
    if (fill) fill.style.width = pct + '%';
    currentStep++;
  };

  // Delayed step updates
  setTimeout(() => advance(), 1200);   // Move to extract
  setTimeout(() => advance(), 3000);   // Move to AI
  setTimeout(() => advance(), 5500);   // Move to render
}
