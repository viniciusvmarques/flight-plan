# Publica Marquisa no marquisa.com.br (git push → Netlify + Render)
# Uso:  powershell -ExecutionPolicy Bypass -File .\publish.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "`n=== Marquisa — publicar produção ===" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git nao encontrado." -ForegroundColor Red
  exit 1
}

Write-Host "`nStatus:" -ForegroundColor Yellow
git status -sb
Write-Host ""

$msg = @"
Modelo B glass cockpit: home METAR ao vivo, dashboard unificado, tema EFIS em todas as paginas.
"@

git add -A
# Nunca versionar secrets
git reset HEAD -- backend/.env frontend/.env 2>$null

$status = git status --porcelain
if (-not $status) {
  Write-Host "Nada novo para commitar. Tentando push mesmo assim..." -ForegroundColor Yellow
} else {
  git commit -m $msg
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit falhou." -ForegroundColor Red
    exit 1
  }
}

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Push para origin/$branch ..." -ForegroundColor Green
git push -u origin HEAD

if ($LASTEXITCODE -ne 0) {
  Write-Host "Push falhou. Confira login do GitHub (gh auth login) e o remote." -ForegroundColor Red
  exit 1
}

Write-Host "`nPush ok." -ForegroundColor Green
Write-Host "Netlify (frontend) e Render (backend) devem redeployar sozinhos." -ForegroundColor Cyan
Write-Host "Site: https://marquisa.com.br" -ForegroundColor Cyan
Write-Host "API:  https://marquisa-backend.onrender.com" -ForegroundColor Cyan
Write-Host "`nNo Render, confira CORS_ORIGIN incluindo:" -ForegroundColor Yellow
Write-Host "  https://marquisa.com.br,https://www.marquisa.com.br" -ForegroundColor Gray
Write-Host "No Netlify, confira VITE_API_URL:" -ForegroundColor Yellow
Write-Host "  https://marquisa-backend.onrender.com" -ForegroundColor Gray
Write-Host ""
