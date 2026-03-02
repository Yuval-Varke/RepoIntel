import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchRepoData } from './github.js';
import { analyzeWithAI } from './ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Analyze repository endpoint
app.post('/api/analyze', async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) {
        return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    try {
        console.log(`Analyzing repository: ${owner}/${repo}`);

        // Step 1: Fetch repository data from GitHub
        const repoData = await fetchRepoData(owner, repo);
        console.log(`GitHub data fetched for ${owner}/${repo}`);

        // Step 2: Analyze with AI
        const analysis = await analyzeWithAI(repoData);
        console.log(`AI analysis completed for ${owner}/${repo}`);

        res.json({
            success: true,
            repository: {
                owner,
                repo,
                url: repoUrl,
            },
            repoData, // Changed from data to repoData
            analysis,
        });
    } catch (error) {
        console.error('SERVER ERROR during analysis:', error);
        res.status(500).json({
            error: error.message || 'Failed to analyze repository',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
