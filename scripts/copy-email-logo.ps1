# Copia o logo PNG gerado para o frontend (Netlify) e backend (CID nos e-mails).
$ErrorActionPreference = "Stop"
$src = "C:\Users\awavi\.cursor\projects\empty-window\assets\marquisa-email-logo.png"
$root = "C:\Users\awavi\Desktop\flight-plan"

$publicLogo = Join-Path $root "frontend\public\marquisa-email-logo.png"
$backendDir = Join-Path $root "backend\assets"
$backendLogo = Join-Path $backendDir "email-logo.png"

if (-not (Test-Path $src)) { throw "Logo source not found: $src" }

New-Item -ItemType Directory -Force -Path $backendDir | Out-Null
Copy-Item -Force $src $publicLogo
Copy-Item -Force $src $backendLogo
Write-Host "OK: $publicLogo"
Write-Host "OK: $backendLogo"
Get-Item $publicLogo, $backendLogo | Format-Table FullName, Length -AutoSize
