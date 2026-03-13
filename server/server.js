import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchRepoData } from './github.js';
import { analyzeWithAI } from './ai.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
    contentSecurityPolicy: false, // Disabled temporarily to allow inline styles/scripts and SimpleIcons in the frontend without complex configs
    crossOriginResourcePolicy: false // Prevent strict browsers/adblockers from blocking same-origin or CORS static images
}));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    methods: ['GET', 'POST']
}));
app.use(express.json());

// Serve static frontend files (Vite build output)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(process.cwd(), 'dist')));

// API Rate Limiting Setup
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests, please try again later.' }
});

const analyzeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 analysis requests per hour to prevent AI quota exhaustion
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Analysis quota exceeded. Please try again later.' }
});

// Apply basic limiter to all /api/ endpoints
app.use('/api', apiLimiter);

// Health check (v1)
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Analyze repository endpoint (v1) with stricter rate limiting
app.post('/api/v1/analyze', analyzeLimiter, async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Parse owner/repo from URL
    const match = repoUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?.*$/);
    if (!match) {
        return res.status(400).json({ error: 'Invalid GitHub repository URL format' });
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
        // Generic error response to prevent leaking internal system details
        res.status(500).json({
            error: 'Failed to analyze repository. Please check the URL and try again later.',
        });
    }
});


// SPA Fallback: Route all other non-API traffic to the index.html
app.get(/(.*)/, (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
