# PowerShell Deployment Verification Script for Windows
# LearnUpon LMS Deployment Verification

Write-Host "🔍 LearnUpon LMS Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check server connectivity
Write-Host "1. Checking server connectivity..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName "20.125.24.28" -Count 3 -Quiet
    if ($ping) {
        Write-Host "✅ Server is reachable" -ForegroundColor Green
    } else {
        Write-Host "❌ Server is not reachable" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Server connectivity check failed" -ForegroundColor Red
    exit 1
}

# Check SSH connection
Write-Host "2. Testing SSH connection..." -ForegroundColor Yellow
try {
    $sshTest = ssh azure-learupon "echo 'SSH connection successful'" 2>$null
    if ($sshTest -eq "SSH connection successful") {
        Write-Host "✅ SSH connection working" -ForegroundColor Green
    } else {
        Write-Host "❌ SSH connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ SSH connection test failed" -ForegroundColor Red
}

# Check PM2 status
Write-Host "3. Checking PM2 application status..." -ForegroundColor Yellow
try {
    $pm2Status = ssh azure-learupon "pm2 status" 2>$null
    if ($pm2Status -match "online") {
        Write-Host "✅ Application is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Application may not be running properly" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ PM2 status check failed" -ForegroundColor Red
}

# Check web server response
Write-Host "4. Testing web server response..." -ForegroundColor Yellow
try {
    $httpCode = ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/" 2>$null
    if ($httpCode -eq "200") {
        Write-Host "✅ Web server responding (HTTP $httpCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Web server not responding (HTTP $httpCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Web server test failed" -ForegroundColor Red
}

# Check static file serving
Write-Host "5. Testing static file serving..." -ForegroundColor Yellow
try {
    $groupsCode = ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/groups.html" 2>$null
    $transcriptCode = ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/transcript.html" 2>$null
    
    if ($groupsCode -eq "200") {
        Write-Host "✅ Groups dashboard accessible (HTTP $groupsCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Groups dashboard not accessible (HTTP $groupsCode)" -ForegroundColor Red
    }
    
    if ($transcriptCode -eq "200") {
        Write-Host "✅ Transcript dashboard accessible (HTTP $transcriptCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Transcript dashboard not accessible (HTTP $transcriptCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Static file serving test failed" -ForegroundColor Red
}

# Check API proxy
Write-Host "6. Testing API proxy..." -ForegroundColor Yellow
try {
    $apiCode = ssh azure-learupon "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/health" 2>$null
    if ($apiCode -eq "200") {
        Write-Host "✅ API proxy healthy (HTTP $apiCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ API proxy not responding (HTTP $apiCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API proxy test failed" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "🎯 Deployment URLs:" -ForegroundColor Cyan
Write-Host "   Main Dashboard: http://20.125.24.28:3000/" -ForegroundColor White
Write-Host "   Groups Manager: http://20.125.24.28:3000/groups.html" -ForegroundColor White
Write-Host "   Transcript View: http://20.125.24.28:3000/transcript.html" -ForegroundColor White
Write-Host "   Health Check: http://20.125.24.28:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "🔧 SSH Connection:" -ForegroundColor Cyan
Write-Host "   ssh azure-learupon" -ForegroundColor White
Write-Host "   ssh -i ~/.ssh/azure_learupon NTXPTRAdmin@20.125.24.28" -ForegroundColor White
Write-Host ""
Write-Host "📊 Application Management:" -ForegroundColor Cyan
Write-Host "   ssh azure-learupon 'pm2 status'" -ForegroundColor White
Write-Host "   ssh azure-learupon 'pm2 logs learupon-lms'" -ForegroundColor White
Write-Host "   ssh azure-learupon 'pm2 restart learupon-lms'" -ForegroundColor White

Write-Host ""
Write-Host "Verification completed! ✨" -ForegroundColor Green
