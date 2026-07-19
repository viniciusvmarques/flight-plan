# Marquisa — sobe o site local (PowerShell)
Set-Location $PSScriptRoot

Write-Host "`n=== Marquisa — servidor local ===" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Node.js nao encontrado. Instale em https://nodejs.org (LTS)" -ForegroundColor Red
    Read-Host "Enter para sair"
    exit 1
}
Write-Host "Node:" (node -v)

if (-not (Test-Path "node_modules\vite\package.json")) {
    Write-Host "`nInstalando dependencias (npm install)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO no npm install" -ForegroundColor Red
        Read-Host "Enter para sair"
        exit 1
    }
}

$imgDest = "public\images\bg-ifr-chart-4k.jpg"
$imgSrc = "$env:USERPROFILE\.cursor\projects\empty-window\assets\bg-ifr-chart-4k.jpg"
New-Item -ItemType Directory -Force -Path "public\images" | Out-Null
if (Test-Path $imgSrc) {
    Copy-Item $imgSrc $imgDest -Force
    Write-Host "Imagem IFR copiada." -ForegroundColor Green
}

Write-Host "`nSubindo servidor... NAO FECHE ESTA JANELA." -ForegroundColor Green
Write-Host "Espere aparecer:  Local: http://127.0.0.1:5173/" -ForegroundColor Yellow
Write-Host "So entao abra o link no navegador. Ctrl+C para parar.`n" -ForegroundColor Gray

npm run dev
