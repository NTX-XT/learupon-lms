#!/bin/bash

# LearnUpon LMS Deployment Verification Script
# This script verifies that the deployment is working correctly

echo "🔍 LearnUpon LMS Deployment Verification"
echo "========================================"

# Check server connectivity
echo "1. Checking server connectivity..."
if ping -c 3 20.125.24.28 > /dev/null 2>&1; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable"
    exit 1
fi

# Check SSH connection
echo "2. Testing SSH connection..."
if ssh azure-learupon "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo "✅ SSH connection working"
else
    echo "❌ SSH connection failed"
    exit 1
fi

# Check PM2 status
echo "3. Checking PM2 application status..."
PM2_STATUS=$(ssh azure-learupon "pm2 jlist" 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null)
if [ "$PM2_STATUS" = "online" ]; then
    echo "✅ Application is running (Status: $PM2_STATUS)"
else
    echo "⚠️  Application status: $PM2_STATUS"
fi

# Check web server response
echo "4. Testing web server response..."
HTTP_CODE=$(ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Web server responding (HTTP $HTTP_CODE)"
else
    echo "❌ Web server not responding (HTTP $HTTP_CODE)"
fi

# Check static file serving
echo "5. Testing static file serving..."
GROUPS_CODE=$(ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/groups.html" 2>/dev/null)
TRANSCRIPT_CODE=$(ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/transcript.html" 2>/dev/null)

if [ "$GROUPS_CODE" = "200" ]; then
    echo "✅ Groups dashboard accessible (HTTP $GROUPS_CODE)"
else
    echo "❌ Groups dashboard not accessible (HTTP $GROUPS_CODE)"
fi

if [ "$TRANSCRIPT_CODE" = "200" ]; then
    echo "✅ Transcript dashboard accessible (HTTP $TRANSCRIPT_CODE)"
else
    echo "❌ Transcript dashboard not accessible (HTTP $TRANSCRIPT_CODE)"
fi

# Check API proxy
echo "6. Testing API proxy..."
API_CODE=$(ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health" 2>/dev/null)
if [ "$API_CODE" = "200" ]; then
    echo "✅ API proxy healthy (HTTP $API_CODE)"
else
    echo "❌ API proxy not responding (HTTP $API_CODE)"
fi

# Summary
echo ""
echo "🎯 Deployment URLs:"
echo "   Main Dashboard: http://20.125.24.28:3000/"
echo "   Groups Manager: http://20.125.24.28:3000/groups.html"
echo "   Transcript View: http://20.125.24.28:3000/transcript.html"
echo "   Health Check: http://20.125.24.28:3000/health"
echo ""
echo "🔧 SSH Connection:"
echo "   ssh azure-learupon"
echo "   ssh -i ~/.ssh/azure_learupon NTXPTRAdmin@20.125.24.28"
echo ""
echo "📊 Application Management:"
echo "   ssh azure-learupon 'pm2 status'"
echo "   ssh azure-learupon 'pm2 logs learupon-lms'"
echo "   ssh azure-learupon 'pm2 restart learupon-lms'"

echo ""
echo "Verification completed! ✨"
