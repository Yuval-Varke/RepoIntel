import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
    if (mermaidInitialized) return;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
            primaryColor: '#f97316',
            primaryTextColor: '#F8FAFC',
            primaryBorderColor: 'rgba(249,115,22,0.3)',
            lineColor: '#64748b',
            secondaryColor: '#18181b',
            tertiaryColor: '#09090b',
            background: '#09090b',
            mainBkg: '#18181b',
            nodeBorder: 'rgba(249,115,22,0.3)',
            clusterBkg: '#09090b',
            clusterBorder: 'rgba(255,255,255,0.08)',
            titleColor: '#F8FAFC',
            edgeLabelBackground: '#18181b',
            fontFamily: 'Inter, system-ui, sans-serif',
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

        // Sanitize: quote labels inside [] that contain special chars like ()
        // e.g. E[GoTrue (Auth)] → E["GoTrue (Auth)"]
        cleanCode = cleanCode.replace(/\[([^\]"]*[()][^\]"]*)\]/g, '["$1"]');

        // Sanitize: inner parentheses inside text (like "Service (Elixir)") break Mermaid parsing
        // We replace them with square brackets safely if they are preceded by a space.
        cleanCode = cleanCode.replace(/\s\(([^)]+)\)/g, ' [$1]');

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
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px;color:#a1a1aa;">
        <span class="material-symbols-outlined" style="font-size:32px;color:#f97316;">schema</span>
        <p style="font-size:14px;">Architecture diagram could not be rendered</p>
        <details style="max-width:100%;overflow:auto;">
          <summary style="cursor:pointer;color:#f97316;font-size:12px;font-family:monospace;">View raw diagram code</summary>
          <pre style="margin-top:12px;padding:16px;background:#18181b;border-radius:8px;font-size:12px;color:#a1a1aa;white-space:pre-wrap;max-width:100%;border:1px solid #27272a;">${escapeHtml(diagramCode)}</pre>
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
