$ErrorActionPreference = "Continue"

# Server details
$server = "103.179.97.107"
$user = "root"
$pass = "Bkb@1234"

# First, set up SSH key auth so future deployments are passwordless
Write-Host "=== Setting up SSH key authentication ==="

# Generate key if not exists
if (!(Test-Path "$env:USERPROFILE\.ssh\id_rsa")) {
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""' -q
    Write-Host "SSH key generated"
}

# Use scp-like approach with expect simulation
# Since Windows doesn't have sshpass, we'll use .NET to automate
Add-Type -AssemblyName System.Runtime

$pubKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" -Raw

# Create a temporary expect script
$expectScript = @"
#!/usr/bin/expect -f
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${user}@${server} "mkdir -p ~/.ssh && echo '$($pubKey.Trim())' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo KEY_ADDED"
expect "password:"
send "${pass}\r"
expect eof
"@

# Alternative: Use .NET Process with stdin redirection
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.Arguments = "-o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no ${user}@${server} `"cd /var/www/smarterp && git pull origin main 2>&1; pm2 restart smarterp-backend 2>&1; echo DEPLOY_DONE`""
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)

# Wait for password prompt
Start-Sleep -Seconds 3

# Send password
$proc.StandardInput.WriteLine($pass)
$proc.StandardInput.Close()

# Wait for completion with timeout
if ($proc.WaitForExit(120000)) {
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    Write-Host "=== STDOUT ===" 
    Write-Host $stdout
    Write-Host "=== STDERR ==="
    Write-Host $stderr
    Write-Host "Exit code: $($proc.ExitCode)"
} else {
    Write-Host "Timeout waiting for SSH"
    $proc.Kill()
}
