const GITHUB_API = 'https://api.github.com';

function getHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RepoAnalyzer/1.0',
    };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
}

async function githubFetch(url) {
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
        if (res.status === 404) throw new Error('Repository not found');
        if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Add a GITHUB_TOKEN to .env');
        throw new Error(`GitHub API error: ${res.status}`);
    }
    return res.json();
}

async function fetchFileContent(owner, repo, path) {
    try {
        const data = await githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`);
        if (data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return null;
    } catch {
        return null;
    }
}

export async function fetchRepoData(owner, repo) {
    // Fetch all data in parallel
    const [metadata, languages, tree, contributors, releases, commits] = await Promise.all([
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}`),
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`),
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`).catch(() => ({ tree: [] })),
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=10`).catch(() => []),
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/releases?per_page=5`).catch(() => []),
        githubFetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=30`).catch(() => []),
    ]);

    // Extract file structure (limit to first 500 files for performance)
    const fileStructure = (tree.tree || [])
        .filter(item => item.type === 'blob')
        .slice(0, 500)
        .map(item => item.path);

    // Detect and fetch dependency files
    const depFiles = [
        'package.json', 'requirements.txt', 'Pipfile', 'Cargo.toml',
        'go.mod', 'build.gradle', 'pom.xml', 'Gemfile', 'composer.json',
        'pubspec.yaml', 'setup.py', 'pyproject.toml', 'CMakeLists.txt',
    ];

    const configFiles = [
        '.eslintrc.json', '.eslintrc.js', 'tsconfig.json', '.prettierrc',
        'webpack.config.js', 'vite.config.js', 'vite.config.ts',
        'next.config.js', 'next.config.mjs', 'Dockerfile', 'docker-compose.yml',
        '.github/workflows/ci.yml', '.github/workflows/main.yml',
        'Makefile', '.env.example', 'jest.config.js', 'vitest.config.ts',
    ];

    const existingFiles = fileStructure.map(f => f.toLowerCase());

    const foundDepFiles = depFiles.filter(f =>
        existingFiles.includes(f.toLowerCase())
    );
    const foundConfigFiles = configFiles.filter(f =>
        existingFiles.includes(f.toLowerCase())
    );

    // Fetch content of dependency files
    const depContents = {};
    for (const file of foundDepFiles.slice(0, 5)) {
        const content = await fetchFileContent(owner, repo, file);
        if (content) {
            // Truncate large files
            depContents[file] = content.length > 5000 ? content.substring(0, 5000) + '...(truncated)' : content;
        }
    }

    // Fetch README
    let readme = null;
    for (const readmeName of ['README.md', 'readme.md', 'README.rst', 'README.txt', 'README']) {
        readme = await fetchFileContent(owner, repo, readmeName);
        if (readme) {
            readme = readme.length > 8000 ? readme.substring(0, 8000) + '...(truncated)' : readme;
            break;
        }
    }

    // Compute language distribution
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const languageDistribution = {};
    for (const [lang, bytes] of Object.entries(languages)) {
        languageDistribution[lang] = {
            bytes,
            percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : 0,
        };
    }

    // Extract folder structure (top 2 levels)
    const folders = [...new Set(
        fileStructure
            .map(f => f.split('/').slice(0, 2).join('/'))
            .filter(f => f.includes('/'))
    )].sort();

    return {
        metadata: {
            name: metadata.name,
            fullName: metadata.full_name,
            description: metadata.description,
            stars: metadata.stargazers_count,
            forks: metadata.forks_count,
            openIssues: metadata.open_issues_count,
            watchers: metadata.watchers_count,
            defaultBranch: metadata.default_branch,
            license: metadata.license?.spdx_id || metadata.license?.name || 'None',
            createdAt: metadata.created_at,
            updatedAt: metadata.updated_at,
            pushedAt: metadata.pushed_at,
            size: metadata.size,
            topics: metadata.topics || [],
            homepage: metadata.homepage,
            hasWiki: metadata.has_wiki,
            hasPages: metadata.has_pages,
            archived: metadata.archived,
            visibility: metadata.visibility || 'public',
            owner: metadata.owner.login,
            htmlUrl: metadata.html_url,
        },
        languages: languageDistribution,
        fileCount: fileStructure.length,
        folderStructure: folders.slice(0, 80),
        fileStructure: fileStructure.slice(0, 200),
        dependencyFiles: depContents,
        configFiles: foundConfigFiles,
        readme,
        contributors: (Array.isArray(contributors) ? contributors : []).slice(0, 10).map(c => ({
            login: c.login,
            contributions: c.contributions,
            avatar: c.avatar_url,
        })),
        releases: (Array.isArray(releases) ? releases : []).slice(0, 5).map(r => ({
            name: r.name || r.tag_name,
            tag: r.tag_name,
            date: r.published_at,
            prerelease: r.prerelease,
        })),
        recentCommitCount: Array.isArray(commits) ? commits.length : 0,
    };
}
