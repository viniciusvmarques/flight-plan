# Copia cenas climáticas geradas para o frontend (public/wx-scenes).
# Rode na pasta do projeto ou de qualquer lugar.

$ErrorActionPreference = "Stop"

$srcDir = Join-Path $env:USERPROFILE ".cursor\projects\empty-window\assets"
$dstDir = "C:\Users\awavi\Desktop\flight-plan\frontend\public\wx-scenes"

if (-not (Test-Path $srcDir)) {
    Write-Error "Pasta de origem nao encontrada: $srcDir"
}

New-Item -ItemType Directory -Force -Path $dstDir | Out-Null

$map = @{
    "wx-clear.png"    = "clear.png"
    "wx-cloudy.png"   = "cloudy.png"
    "wx-overcast.png" = "overcast.png"
    "wx-rain.png"     = "rain.png"
    "wx-fog.png"      = "fog.png"
    "wx-storm.png"    = "storm.png"
    "wx-idle.png"     = "idle.png"
}

foreach ($pair in $map.GetEnumerator()) {
    $from = Join-Path $srcDir $pair.Key
    $to = Join-Path $dstDir $pair.Value
    if (-not (Test-Path $from)) {
        Write-Warning "Faltando: $from"
        continue
    }
    Copy-Item $from $to -Force
    Write-Host "OK $($pair.Value) ($((Get-Item $to).Length) bytes)"
}

Write-Host "`nPronto. Arquivos em: $dstDir"
