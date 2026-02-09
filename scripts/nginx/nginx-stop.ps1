$nginxExe  = "C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe"
$nginxRoot = Split-Path $nginxExe -Parent

$repoRoot   = Resolve-Path "$PSScriptRoot\..\.."
$configPath = Join-Path $repoRoot "infra\nginx\nginx.local.conf"

Write-Host "Stopping nginx..."
& $nginxExe -p $nginxRoot -c $configPath -s stop
