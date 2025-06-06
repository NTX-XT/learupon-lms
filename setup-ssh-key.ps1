# SSH Key Setup Script for Azure Server
# This script copies the SSH public key to the Azure server for passwordless authentication

$publicKey = Get-Content "$env:USERPROFILE\.ssh\azure_learupon.pub"
$serverIP = "20.125.24.28"
$username = "NTXPTRAdmin"

Write-Host "Setting up SSH key authentication for $username@$serverIP"
Write-Host "You will need to enter the password one last time: w4Qq`$LD&vZKod6v7oED7Gt&A"
Write-Host ""
Write-Host "Public key to be added:"
Write-Host $publicKey
Write-Host ""

# Use plink (if available) or ssh to copy the key
$command = @"
mkdir -p ~/.ssh && 
echo '$publicKey' >> ~/.ssh/authorized_keys && 
chmod 700 ~/.ssh && 
chmod 600 ~/.ssh/authorized_keys &&
echo 'SSH key added successfully!'
"@

Write-Host "Executing command on remote server..."
Write-Host "Command: ssh $username@$serverIP `"$command`""
