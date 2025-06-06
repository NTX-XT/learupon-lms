# LearnUpon LMS Dashboard

A static web application for managing LearnUpon LMS data with user transcript and group management capabilities.

## Features

- **User Transcript Dashboard**: View individual user certifications and course completions
- **Group Management**: Manage company/group-level training data
- **CORS Proxy Server**: Handle LearnUpon API requests with proper CORS handling
- **Modern UI**: Clean, responsive interface for optimal user experience

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
