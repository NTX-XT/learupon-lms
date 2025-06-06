/**
 * Simple CORS Proxy Server for LearnUpon API
 * This can be deployed to Azure Functions, Vercel, Netlify, or any Node.js hosting
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (you can restrict this to your specific domain)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// LearnUpon API configuration
const LEARUPON_CONFIG = {
    username: 'dc6de87f63bb5b12ae2e',
    password: '896f3ad0ba054f4ab9fda24a1b3d95',
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

// API info endpoint
app.get('/api-info', (req, res) => {
    res.json({
        message: 'LearnUpon CORS Proxy Server',
        endpoints: {
            health: '/health',
            proxy: '/api/learupon/{endpoint}',
            static: {
                transcript: '/transcript.html',
                groups: '/groups.html'
            }
        },
        examples: [
            '/api/learupon/users?email=ziyi@alrightylabs.com',
            '/api/learupon/groups',
            '/api/learupon/users/{id}/enrollments'
        ]
    });
});

// Root endpoint serves an index page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LearnUpon LMS Dashboard</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 50px auto; 
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 { color: #333; margin-bottom: 30px; }
                .dashboard-links { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 20px; 
                    margin: 30px 0;
                }
                .link-card { 
                    padding: 20px; 
                    border: 2px solid #ddd; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    color: #333;
                    transition: all 0.3s ease;
                }
                .link-card:hover { 
                    border-color: #007cba; 
                    background-color: #f8f9fa;
                    transform: translateY(-2px);
                }
                .link-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .link-desc { color: #666; font-size: 14px; }
                .api-info { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                .status { color: #28a745; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎓 LearnUpon LMS Dashboard</h1>
                <p class="status">✅ Server Status: Online</p>
                
                <div class="dashboard-links">
                    <a href="/transcript.html" class="link-card">
                        <div class="link-title">📊 User Transcript</div>
                        <div class="link-desc">View individual learner progress and completed courses</div>
                    </a>
                    
                    <a href="/groups.html" class="link-card">
                        <div class="link-title">👥 Groups Management</div>
                        <div class="link-desc">Manage learner groups and organizational structure</div>
                    </a>
                </div>
                
                <div class="api-info">
                    <h3>🔧 Technical Information</h3>
                    <p><strong>API Health:</strong> <a href="/health">/health</a></p>
                    <p><strong>API Info:</strong> <a href="/api-info">/api-info</a></p>
                    <p><strong>Proxy Endpoint:</strong> /api/learupon/{endpoint}</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`LearnUpon CORS Proxy server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
