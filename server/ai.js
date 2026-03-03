export async function analyzeWithAI(repoData) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn('No GEMINI_API_KEY found. Using fallback analysis.');
        return generateFallbackAnalysis(repoData);
    }

    const prompt = buildPrompt(repoData);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            throw new Error('AI analysis failed');
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('Empty AI response');
        }

        // Robust JSON extraction
        text = text.trim();
        if (text.startsWith('```')) {
            text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const analysis = JSON.parse(text);
        return validateAnalysis(analysis);
    } catch (error) {
        console.error('AI Analysis error:', error.message);
        return generateFallbackAnalysis(repoData);
    }
}

function buildPrompt(repoData) {
    return `You are a senior software architect and security auditor. Analyze the following GitHub repository data and provide a comprehensive assessment.

## Repository Data

**Name:** ${repoData.metadata.fullName}
**Description:** ${repoData.metadata.description || 'No description'}
**Stars:** ${repoData.metadata.stars} | **Forks:** ${repoData.metadata.forks}
**Open Issues:** ${repoData.metadata.openIssues}
**License:** ${repoData.metadata.license}
**Created:** ${repoData.metadata.createdAt}
**Last Updated:** ${repoData.metadata.updatedAt}
**Last Push:** ${repoData.metadata.pushedAt}
**Topics:** ${(repoData.metadata.topics || []).join(', ') || 'None'}
**Total Files:** ${repoData.fileCount}
**Recent Commits (last 30):** ${repoData.recentCommitCount}

### Languages
${JSON.stringify(repoData.languages, null, 2)}

### Folder Structure (top 2 levels)
${repoData.folderStructure.join('\n')}

### Key Files (first 200)
${repoData.fileStructure.join('\n')}

### Dependency Files
${Object.entries(repoData.dependencyFiles).map(([file, content]) =>
        `#### ${file}\n\`\`\`\n${content}\n\`\`\``
    ).join('\n\n')}

### Configuration Files Detected
${repoData.configFiles.join(', ')}

### Contributors (Top 10)
${repoData.contributors.map(c => `${c.login}: ${c.contributions} contributions`).join('\n')}

### Releases
${repoData.releases.map(r => `${r.name} (${r.tag}) - ${r.date}`).join('\n') || 'No releases'}

### README (excerpt)
${repoData.readme ? repoData.readme.substring(0, 4000) : 'No README found'}

---

## Analysis Required

Provide a JSON response with EXACTLY this structure:

{
  "scores": {
    "quality": <number 0-100>,
    "security": <number 0-100>,
    "documentation": <number 0-100>,
    "maintainability": <number 0-100>
  },
  "scoreExplanations": {
    "quality": "<1 sentence explaining the quality score>",
    "security": "<1 sentence explaining the security score>",
    "documentation": "<1 sentence explaining the documentation score>",
    "maintainability": "<1 sentence explaining the maintainability score>"
  },
  "summary": "<3-4 sentence overall project summary>",
  "techStack": {
    "primary": ["<main frameworks/languages>"],
    "secondary": ["<supporting tools/libraries>"],
    "devOps": ["<CI/CD, containerization, etc>"],
    "testing": ["<testing frameworks>"]
  },
  "architecture": {
    "pattern": "<e.g. MVC, Microservices, Monolith, Serverless>",
    "description": "<2-3 sentence architecture description>",
    "components": ["<key architectural components>"]
  },
  "mermaidDiagram": "<valid Mermaid diagram string showing the project architecture - use graph TD format>",
  "insights": {
    "maintainability": ["<3-5 specific maintainability observations>"],
    "security": ["<3-5 specific security observations>"],
    "architecture": ["<3-5 specific architecture observations>"],
    "documentation": ["<3-5 specific documentation observations>"]
  },
  "improvements": ["<5-8 specific, actionable improvement suggestions>"],
  "risks": ["<3-5 identified risks or concerns>"],
  "highlights": ["<3-5 positive aspects of the project>"],
  "runInstructions": [
    {
      "step": "<description of the step>",
      "command": "<actual terminal command if applicable, or null>"
    }
  ]
}

IMPORTANT:
- The Mermaid diagram should use \`graph TD\` format and show actual project components
- All arrays must have at least 2 items
- Extract "runInstructions" for basic local setup: (1) git clone, (2) cd, (3) Installation (npm/pip install), (4) Running/Starting (npm start/python app.py).
- Prioritize high-quality, executable commands over generic "ls" or documentation commands.
- If specific commands aren't obvious in README, predict based on common language patterns (e.g., package.json -> npm install).
- Return ONLY valid JSON, no markdown wrapping`;
}

function validateAnalysis(analysis) {
    // Ensure all required fields exist with defaults
    const defaults = {
        scores: { quality: 50, security: 50, documentation: 50, maintainability: 50, global: 50 },
        scoreExplanations: {
            quality: 'Assessment based on code structure and practices.',
            security: 'Assessment based on dependencies and configuration.',
            documentation: 'Assessment based on README and inline documentation.',
            maintainability: 'Assessment based on project organization and complexity.',
        },
        summary: 'Analysis completed.',
        techStack: { primary: [], secondary: [], devOps: [], testing: [] },
        architecture: { pattern: 'Unknown', description: 'Could not determine.', components: [] },
        mermaidDiagram: 'graph TD\n  A[Repository] --> B[Source Code]\n  A --> C[Configuration]\n  A --> D[Documentation]',
        insights: { maintainability: [], security: [], architecture: [], documentation: [] },
        improvements: [],
        risks: [],
        highlights: [],
        runInstructions: [],
    };

    if (analysis && analysis.scores && !analysis.scores.global) {
        const s = analysis.scores;
        analysis.scores.global = Math.round((s.quality + s.security + s.documentation + s.maintainability) / 4);
    }
    return { ...defaults, ...analysis };
}

function generateFallbackAnalysis(repoData) {
    const languages = Object.entries(repoData.languages || {})
        .sort((a, b) => b[1].bytes - a[1].bytes)
        .map(([lang]) => lang);
    const primaryLang = languages[0] || 'Unknown';
    const hasTests = repoData.fileStructure.some(f =>
        f.includes('test') || f.includes('spec') || f.includes('__tests__')
    );
    const hasCI = repoData.configFiles.some(f => f.includes('.github/workflows'));
    const hasDocker = repoData.configFiles.some(f =>
        f.toLowerCase().includes('docker')
    );
    const hasLicense = repoData.metadata.license !== 'None';
    const hasReadme = !!repoData.readme;
    const depCount = Object.keys(repoData.dependencyFiles).length;

    // Calculate scores based on heuristics
    let qualityScore = 40;
    if (hasTests) qualityScore += 15;
    if (hasCI) qualityScore += 10;
    if (repoData.configFiles.length > 3) qualityScore += 10;
    if (languages.length > 1) qualityScore += 5;
    if (repoData.recentCommitCount > 10) qualityScore += 10;
    qualityScore = Math.min(qualityScore, 95);

    let securityScore = 50;
    if (hasLicense) securityScore += 10;
    if (hasCI) securityScore += 10;
    if (repoData.configFiles.some(f => f.includes('eslint'))) securityScore += 5;
    securityScore = Math.min(securityScore, 90);

    let docScore = 20;
    if (hasReadme) docScore += 30;
    if (repoData.readme && repoData.readme.length > 1000) docScore += 15;
    if (hasLicense) docScore += 10;
    if (repoData.metadata.description) docScore += 10;
    if (repoData.metadata.homepage) docScore += 5;
    docScore = Math.min(docScore, 95);

    let maintScore = 40;
    if (hasTests) maintScore += 15;
    if (repoData.contributors.length > 2) maintScore += 10;
    if (repoData.releases.length > 0) maintScore += 10;
    if (repoData.recentCommitCount > 15) maintScore += 10;
    maintScore = Math.min(maintScore, 95);

    // Detect tech stack
    const techStack = { primary: [], secondary: [], devOps: [], testing: [] };
    techStack.primary = languages.slice(0, 3);

    // Check package.json
    const pkgContent = repoData.dependencyFiles['package.json'];
    if (pkgContent) {
        try {
            const pkg = JSON.parse(pkgContent.replace('...(truncated)', ''));
            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            const depNames = Object.keys(allDeps || {});

            if (depNames.includes('react')) techStack.primary.push('React');
            if (depNames.includes('vue')) techStack.primary.push('Vue.js');
            if (depNames.includes('next')) techStack.primary.push('Next.js');
            if (depNames.includes('express')) techStack.secondary.push('Express.js');
            if (depNames.includes('typescript')) techStack.secondary.push('TypeScript');
            if (depNames.includes('jest')) techStack.testing.push('Jest');
            if (depNames.includes('vitest')) techStack.testing.push('Vitest');
            if (depNames.includes('mocha')) techStack.testing.push('Mocha');
        } catch { }
    }

    if (hasDocker) techStack.devOps.push('Docker');
    if (hasCI) techStack.devOps.push('GitHub Actions');

    // Generate mermaid diagram
    const components = [];
    if (repoData.folderStructure.some(f => f.startsWith('src/'))) components.push('Source');
    if (hasTests) components.push('Tests');
    if (repoData.folderStructure.some(f => f.includes('api') || f.includes('routes'))) components.push('API');
    if (repoData.folderStructure.some(f => f.includes('components') || f.includes('views'))) components.push('UI');
    if (repoData.folderStructure.some(f => f.includes('model') || f.includes('schema'))) components.push('Data');
    if (components.length === 0) components.push('Core');

    let mermaid = 'graph TD\n';
    mermaid += `  A[${repoData.metadata.name}] --> B[${components[0] || 'Core'}]\n`;
    components.slice(1).forEach((c, i) => {
        mermaid += `  A --> ${String.fromCharCode(67 + i)}[${c}]\n`;
    });

    return {
        scores: {
            quality: qualityScore,
            security: securityScore,
            documentation: docScore,
            maintainability: maintScore,
            global: Math.round((qualityScore + securityScore + docScore + maintScore) / 4),
        },
        scoreExplanations: {
            quality: `${hasTests ? 'Tests detected. ' : 'No tests found. '}${hasCI ? 'CI/CD configured.' : 'No CI/CD detected.'}`,
            security: `License: ${repoData.metadata.license}. ${depCount > 0 ? 'Dependencies found for review.' : 'No dependency files detected.'}`,
            documentation: `${hasReadme ? 'README present' : 'No README'}. ${repoData.metadata.description ? 'Has description.' : 'Missing description.'}`,
            maintainability: `${repoData.contributors.length} contributors. ${repoData.recentCommitCount} recent commits.`,
        },
        summary: `${repoData.metadata.fullName} is a ${primaryLang}-based project with ${repoData.fileCount} files. ${repoData.metadata.description || 'No description provided.'}`,
        techStack,
        architecture: {
            pattern: components.includes('API') && components.includes('UI') ? 'Full Stack' : 'Monolith',
            description: `A ${primaryLang} project organized with ${repoData.folderStructure.length} top-level directories.`,
            components,
        },
        deepDive: `This ${primaryLang} codebase is structured around ${components.join(' and ')} layers. The project maintains a clean separation of concerns with ${repoData.fileCount} files distributed across ${repoData.folderStructure.length} directories, suggesting a scalable foundation.`,
        keyInsight: `A robust ${primaryLang} architecture that leverages ${techStack.primary.join(', ') || 'standard patterns'} to ensure long-term architectural integrity.`,
        mermaidDiagram: mermaid,
        insights: {
            maintainability: [
                hasTests ? 'Test suite detected, improving reliability' : 'No test suite detected',
                `${repoData.contributors.length} contributors found`,
                `${repoData.recentCommitCount} commits in recent activity`,
            ],
            security: [
                `License: ${repoData.metadata.license}`,
                `${depCount} dependency files found`,
                hasCI ? 'CI/CD pipeline configured' : 'No CI/CD pipeline detected',
            ],
            architecture: [
                `Primary language: ${primaryLang}`,
                `${repoData.folderStructure.length} directories in structure`,
                `${repoData.configFiles.length} configuration files detected`,
            ],
            documentation: [
                hasReadme ? 'README file present' : 'No README file found',
                repoData.metadata.description ? 'Repository description set' : 'Missing repository description',
                `${repoData.releases.length} releases published`,
            ],
        },
        improvements: [
            ...(!hasTests ? ['Add a test suite for better code reliability'] : []),
            ...(!hasCI ? ['Set up CI/CD pipeline with GitHub Actions'] : []),
            ...(!hasReadme ? ['Add a comprehensive README with setup instructions'] : []),
            ...(!hasLicense ? ['Add a license to clarify usage rights'] : []),
            ...(!hasDocker ? ['Consider containerization with Docker'] : []),
            'Add contributing guidelines for better collaboration',
            'Consider adding code quality badges to README',
        ].slice(0, 7),
        risks: [
            ...(!hasLicense ? ['No license may deter contributors'] : []),
            ...(!hasTests ? ['Lack of tests increases regression risk'] : []),
            repoData.metadata.archived ? 'Repository is archived' : null,
            repoData.metadata.openIssues > 50 ? `High number of open issues (${repoData.metadata.openIssues})` : null,
        ].filter(Boolean).slice(0, 5),
        highlights: [
            repoData.metadata.stars > 100 ? `Popular with ${repoData.metadata.stars} stars` : null,
            hasTests ? 'Test suite in place' : null,
            hasCI ? 'CI/CD pipeline configured' : null,
            hasReadme ? 'Well-documented with README' : null,
            repoData.releases.length > 0 ? 'Regular releases published' : null,
            repoData.contributors.length > 3 ? `Active community (${repoData.contributors.length} contributors)` : null,
        ].filter(Boolean).slice(0, 5),
        runInstructions: (() => {
            const steps = [
                { step: 'Clone the repository', command: `git clone https://github.com/${repoData.metadata.fullName}.git` },
                { step: 'Navigate to directory', command: `cd ${repoData.metadata.name}` }
            ];

            // Installation step
            if (repoData.dependencyFiles['package.json']) {
                steps.push({ step: 'Install dependencies', command: 'npm install' });
                steps.push({ step: 'Launch project', command: 'npm start' });
            } else if (repoData.dependencyFiles['requirements.txt'] || repoData.dependencyFiles['setup.py']) {
                steps.push({ step: 'Initialize environment', command: 'pip install -r requirements.txt' });
                steps.push({ step: 'Run application', command: primaryLang.toLowerCase() === 'python' ? `python main.py` : null });
            } else if (repoData.dependencyFiles['go.mod']) {
                steps.push({ step: 'Download modules', command: 'go mod download' });
                steps.push({ step: 'Build and run', command: 'go run .' });
            } else if (repoData.dependencyFiles['Gemfile']) {
                steps.push({ step: 'Install gems', command: 'bundle install' });
            } else if (repoData.dependencyFiles['pom.xml'] || repoData.dependencyFiles['build.gradle']) {
                steps.push({ step: 'Compile project', command: repoData.dependencyFiles['pom.xml'] ? 'mvn install' : './gradlew build' });
            } else {
                steps.push({ step: 'Check project setup', command: 'ls -F' });
                steps.push({ step: 'Review documentation', command: 'cat README.md | head -n 20' });
            }

            return steps;
        })()
    };
}
