$nginxExe  = "C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe"
$nginxRoot = Split-Path $nginxExe -Parent

$repoRoot   = Resolve-Path "$PSScriptRoot\..\.."
$configPath = Join-Path $repoRoot "infra\nginx\nginx.local.conf"

New-Item -ItemType Directory -Force -Path (Join-Path $nginxRoot "logs") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $nginxRoot "temp") | Out-Null

Write-Host "Starting nginx (detached)..."

Start-Process -FilePath $nginxExe `
  -ArgumentList @("-p", $nginxRoot, "-c", $configPath) `
  -WorkingDirectory $nginxRoot `
  -WindowStyle Hidden
