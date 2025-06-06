/**
 * Simple CORS Proxy Server for LearnUpon API
 * This can be deployed to Azure Functions, Vercel, Netlify, or any Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (you can restrict this to your specific domain)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// LearnUpon API configuration
const LEARUPON_CONFIG = {
    username: '7e3cabb33785685b95eb',
    password: '0f990388e4a4ad06cd2f63814e7dd7',
    baseUrl: 'https://learn.nintex.com/api/v1'
};

// Create authorization header
function getAuthHeader() {
    const credentials = Buffer.from(`${LEARUPON_CONFIG.username}:${LEARUPON_CONFIG.password}`).toString('base64');
    return `Basic ${credentials}`;
}

// Proxy endpoint for LearnUpon API
app.all('/api/learupon/*', async (req, res) => {
    try {
        // Extract the path after /api/learupon/
        const apiPath = req.path.replace('/api/learupon/', '');
        const url = `${LEARUPON_CONFIG.baseUrl}/${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
        
        console.log(`Proxying request to: ${url}`);
        
        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        
        if (!response.ok) {
            throw new Error(`LearnUpon API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message,
            details: error.toString()
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'LearnUpon CORS Proxy is running' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LearnUpon CORS Proxy Server',
        endpoints: {
            health: '/health',
            proxy: '/api/learupon/{endpoint}'
        },
        examples: [
            '/api/learupon/users?email=ziyi@alrightylabs.com',
            '/api/learupon/groups',
            '/api/learupon/users/{id}/enrollments'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`LearnUpon CORS Proxy server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
