# Copia propostas de logo Marquisa para frontend/public/brand/
$ErrorActionPreference = "Stop"

$srcDir = Join-Path $env:USERPROFILE ".cursor\projects\empty-window\assets"
$dstDir = "C:\Users\awavi\Desktop\flight-plan\frontend\public\brand"

New-Item -ItemType Directory -Force -Path $dstDir | Out-Null

$map = @{
    # marca oficial (v2 mark-b)
    "marquisa-logo-v2-mark-b.png"     = "mark-compass.png"
    "marquisa-logo-v2-mark-a.png"     = "v2-mark-a-runway.png"
    "marquisa-logo-v2-mark-c.png"     = "v2-mark-c-route.png"
    "marquisa-logo-v2-wordmark-a.png" = "v2-wordmark-a-lines.png"
    "marquisa-logo-v2-wordmark-b.png" = "v2-wordmark-b-star.png"
    # v1
    "marquisa-logo-mark-a.png"        = "mark-a-runway-m.png"
    "marquisa-logo-mark-b.png"        = "mark-b-plane-route.png"
    "marquisa-logo-wordmark-a.png"    = "wordmark-a-combo.png"
    "marquisa-logo-wordmark-b.png"    = "wordmark-b-type.png"
    "marquisa-logo-avatar.png"        = "avatar-compass-m.png"
}

foreach ($pair in $map.GetEnumerator()) {
    $from = Join-Path $srcDir $pair.Key
    $to = Join-Path $dstDir $pair.Value
    if (-not (Test-Path $from)) {
        Write-Warning "Faltando: $from"
        continue
    }
    Copy-Item $from $to -Force
    Write-Host "OK $($pair.Value)"
}

Write-Host "`nDestino: $dstDir"
Write-Host "Marca em uso no site: SVG /marquisa-mark.svg (rosa dos ventos)"
