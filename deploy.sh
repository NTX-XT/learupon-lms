#!/bin/bash

# LearnUpon LMS Deployment Script
# This script automates the deployment process on Ubuntu servers

echo "🚀 Starting LearnUpon LMS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 14.0.0 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 14 ]; then
            print_error "Node.js version 14.0.0 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Installing Node.js 18..."
        install_nodejs
    fi
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    if command -v node >/dev/null 2>&1; then
        print_status "Node.js installed successfully: $(node --version)"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    if [ -f "package.json" ]; then
        npm install --production
        if [ $? -eq 0 ]; then
            print_status "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_error "package.json not found in current directory"
        exit 1
    fi
}

# Install PM2 for process management
install_pm2() {
    if command -v pm2 >/dev/null 2>&1; then
        print_status "PM2 is already installed: $(pm2 --version)"
    else
        print_status "Installing PM2 for process management..."
        sudo npm install -g pm2
        
        if command -v pm2 >/dev/null 2>&1; then
            print_status "PM2 installed successfully"
        else
            print_error "Failed to install PM2"
            exit 1
        fi
    fi
}

# Start the application
start_application() {
    print_status "Starting LearnUpon LMS application..."
    
    # Stop existing process if running
    pm2 delete learupon-lms 2>/dev/null || true
    
    # Start new process
    pm2 start proxy-server.js --name "learupon-lms"
    
    if [ $? -eq 0 ]; then
        print_status "Application started successfully"
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup script
        print_status "Setting up PM2 to start on system boot..."
        pm2 startup
        
        print_status "✅ Deployment completed successfully!"
        echo ""
        print_status "Application is running on port 3000"
        print_status "You can access the dashboards at:"
        echo "  - User Transcript: http://$(hostname -I | awk '{print $1}'):3000/transcript.html"
        echo "  - Group Management: http://$(hostname -I | awk '{print $1}'):3000/groups.html"
        echo ""
        print_warning "Don't forget to configure your firewall to allow traffic on port 3000!"
        echo ""
        print_status "Useful PM2 commands:"
        echo "  - View logs: pm2 logs learupon-lms"
        echo "  - Restart app: pm2 restart learupon-lms"
        echo "  - Stop app: pm2 stop learupon-lms"
        echo "  - View status: pm2 status"
        
    else
        print_error "Failed to start application"
        exit 1
    fi
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for better security."
fi

# Main deployment process
print_status "Starting deployment process..."

# Update system packages
print_status "Updating system packages..."
sudo apt update

# Check/Install Node.js
check_nodejs

# Install dependencies
install_dependencies

# Install PM2
install_pm2

# Start application
start_application

print_status "🎉 Deployment completed! Your LearnUpon LMS is ready to use."
