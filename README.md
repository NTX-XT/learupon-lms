# LearnUpon LMS Dashboard

A static web application for managing LearnUpon LMS data with user transcript and group management capabilities.

## 🚀 Quick Start

**Live Application**: [http://20.125.24.28:3000/](http://20.125.24.28:3000/)

### SSH Access (Passwordless)
For development and maintenance, SSH access has been configured:

```powershell
# Connect using SSH alias
ssh azure-learupon

# Or connect directly
ssh -i ~/.ssh/azure_learupon NTXPTRAdmin@20.125.24.28
```

### Application Management
```bash
# Check application status
ssh azure-learupon "pm2 status"

# View application logs
ssh azure-learupon "pm2 logs learupon-lms"

# Restart application
ssh azure-learupon "pm2 restart learupon-lms"

# Update deployment (from local machine)
./deploy.sh
```

## 🔧 Development Setup

### SSH Key Configuration (For Azure Server)

1. **Generate SSH Key** (if not already done):
   ```powershell
   ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\azure_learupon" -N '""'
   ```

2. **Copy Public Key to Server**:
   ```powershell
   scp "$env:USERPROFILE\.ssh\azure_learupon.pub" NTXPTRAdmin@20.125.24.28:~/temp_key.pub
   ```

3. **Configure Server**:
   ```bash
   ssh NTXPTRAdmin@20.125.24.28 "mkdir -p ~/.ssh && cat ~/temp_key.pub >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && rm ~/temp_key.pub"
   ```

4. **Create SSH Config**:
   ```powershell
   echo "Host azure-learupon`nHostName 20.125.24.28`nUser NTXPTRAdmin`nIdentityFile ~/.ssh/azure_learupon`nIdentitiesOnly yes`nStrictHostKeyChecking no" | Out-File -FilePath "$env:USERPROFILE\.ssh\config" -Encoding UTF8
   ```

5. **Test Connection**:
   ```powershell
   ssh azure-learupon "echo 'SSH connection successful!'"
   ```

### Deployment Verification

Run the verification script to check deployment status:

```powershell
# Windows PowerShell
.\verify-deployment.ps1

# Linux/Mac (if using WSL or Git Bash)
./verify-deployment.sh
```

## Features

- **User Transcript Dashboard**: View individual user certifications and course completions
- **Group Management**: Manage company/group-level training data
- **CORS Proxy Server**: Handle LearnUpon API requests with proper CORS handling
- **Modern UI**: Clean, responsive interface for optimal user experience
- **Azure Deployment**: Production-ready deployment with PM2 process management

## 🏗️ Architecture

### Deployment URLs
- **Main Dashboard**: http://20.125.24.28:3000/
- **Groups Manager**: http://20.125.24.28:3000/groups.html
- **Transcript View**: http://20.125.24.28:3000/transcript.html
- **Health Check**: http://20.125.24.28:3000/health
- **API Info**: http://20.125.24.28:3000/api-info

## Project Structure

```
├── groups.html          # Group management interface
├── groups.js           # LearnUpon Groups Manager with API integration
├── transcript.html     # User transcript dashboard interface  
├── transcript.js       # LearnUpon Transcript Manager with API integration
├── proxy-server.js     # CORS proxy server for LearnUpon API
├── package.json        # Node.js dependencies and scripts
└── README.md          # This file
```

## Prerequisites

- Node.js 14.0.0 or higher
- npm (Node Package Manager)
- LearnUpon API credentials

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd static_LMS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### API Configuration
The application supports two modes:

1. **Proxy Mode (Recommended)**: Uses the built-in proxy server to handle CORS issues
2. **Direct API Mode**: Connects directly to LearnUpon API (may have CORS limitations)

### Environment Setup
Update the proxy URL in the configuration panel of each dashboard to match your deployment:
- **Local Development**: `http://localhost:3000/api/learupon`
- **Production**: Your deployed proxy URL (e.g., Azure, Vercel, Netlify)

## Usage

### Development

1. Start the proxy server:
   ```bash
   npm start
   ```

2. Open your web browser and navigate to:
   - User Transcript: `http://localhost:3000/transcript.html`
   - Group Management: `http://localhost:3000/groups.html`

### Production Deployment

#### Option 1: Traditional Server Deployment
1. Upload files to your web server
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`
4. Configure your firewall to allow traffic on port 3000

#### Option 2: Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./  
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option 3: Cloud Platforms
- **Azure**: Deploy as Azure App Service
- **Vercel**: Deploy with serverless functions
- **Netlify**: Deploy with Netlify Functions
- **Heroku**: Deploy as Node.js application

## API Endpoints

The proxy server provides the following endpoints:

- `GET /api/learupon/*` - Proxies requests to LearnUpon API
- `GET /` - Serves static files (HTML, JS, CSS)

## Security Considerations

- Never expose your LearnUpon API credentials in client-side code
- Use the proxy server to handle API authentication
- Configure proper CORS settings for your domain
- Use HTTPS in production environments

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Changelog

### v1.0.0
- Initial release
- User transcript dashboard
- Group management interface
- CORS proxy server
- Responsive UI design
