import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
    if (mermaidInitialized) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
            primaryColor: '#6C5CE7',
            primaryTextColor: '#F8FAFC',
            primaryBorderColor: 'rgba(255,255,255,0.08)',
            lineColor: '#94A3B8',
            secondaryColor: '#161E2E',
            tertiaryColor: '#121826',
            background: '#121826',
            mainBkg: '#161E2E',
            nodeBorder: 'rgba(255,255,255,0.08)',
            clusterBkg: '#121826',
            clusterBorder: 'rgba(255,255,255,0.08)',
            titleColor: '#F8FAFC',
            edgeLabelBackground: '#121826',
            fontFamily: 'Inter, sans-serif',
        },
        flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 15,
        },
        securityLevel: 'loose',
    });
    mermaidInitialized = true;
}

export async function renderMermaid(containerId, diagramCode) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        initMermaid();

        // Clean up the diagram code
        let cleanCode = diagramCode
            .replace(/\\n/g, '\n')
            .replace(/```mermaid\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        // Ensure it starts with a valid diagram type
        if (!cleanCode.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph)/)) {
            cleanCode = 'graph TD\n' + cleanCode;
        }

        const id = 'mermaid-' + Date.now();
        const { svg } = await mermaid.render(id, cleanCode);
        container.innerHTML = svg;

        // Style the SVG
        const svgEl = container.querySelector('svg');
        if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.minHeight = '200px';
        }
    } catch (error) {
        console.error('Mermaid render error:', error);
        container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px;color:var(--text-muted);">
        <span style="font-size:32px;">📐</span>
        <p>Architecture diagram could not be rendered</p>
        <details style="max-width:100%;overflow:auto;">
          <summary style="cursor:pointer;color:var(--accent);">View raw diagram code</summary>
          <pre style="margin-top:12px;padding:16px;background:var(--bg-primary);border-radius:8px;font-size:12px;color:var(--text-secondary);white-space:pre-wrap;max-width:100%;">${escapeHtml(diagramCode)}</pre>
        </details>
      </div>
    `;
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
