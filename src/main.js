import { renderLanding } from './pages/landing.js';
import { renderLoading } from './pages/loading.js';
import { renderDashboard } from './pages/dashboard.js';

const state = {
  page: 'landing', // 'landing' | 'loading' | 'dashboard'
  repoUrl: '',
  analysisData: null,
  error: null,
  fromCache: false,
};

// API base URL
const API_URL = 'http://localhost:3001';

// Navigation
export function navigateTo(page, data = {}) {
  Object.assign(state, data, { page });
  render();
}

// Analyze repository
export async function analyzeRepo(repoUrl, refresh = false) {
  state.repoUrl = repoUrl;

  // Check cache unless refresh is requested
  if (!refresh) {
    const cached = localStorage.getItem(`repointel_cache_${repoUrl}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        console.log('Loading from cache:', repoUrl);
        navigateTo('dashboard', { analysisData: data, fromCache: true });
        return;
      } catch (e) {
        console.error('Failed to parse cache', e);
        localStorage.removeItem(`repointel_cache_${repoUrl}`);
      }
    }
  }

  navigateTo('loading', { fromCache: false });

  try {
    const response = await fetch(`${API_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    // Save to cache
    localStorage.setItem(`repointel_cache_${repoUrl}`, JSON.stringify(data));

    navigateTo('dashboard', { analysisData: data, fromCache: false });
  } catch (error) {
    navigateTo('landing', { error: error.message });
  }
}

// Initialize scroll restoration behavior
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Render
function render() {
  const app = document.getElementById('app');
  
  // Aggressive scroll reset to combat browser restoration
  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0), 10);
  setTimeout(() => {
    window.scrollTo(0, 0);
    const input = document.getElementById('repo-input');
    if (input) input.focus({ preventScroll: true });
  }, 100);
  setTimeout(() => window.scrollTo(0, 0), 500);

  switch (state.page) {
    case 'landing':
      renderLanding(app, state);
      break;
    case 'loading':
      renderLoading(app, state);
      break;
    case 'dashboard':
      renderDashboard(app, state);
      break;
    default:
      renderLanding(app, state);
  }

  // Initialize animations
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-animate]').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.1}s`;
      el.classList.add('animate-fade-in-up');
    });
  });
}

// Initial render
render();
