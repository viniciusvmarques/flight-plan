# Copia cenas climáticas (clima × período) para frontend/public/wx-scenes.
# Fonte: imagens geradas em ~/.cursor/projects/empty-window/assets

$ErrorActionPreference = "Stop"

$srcDir = Join-Path $env:USERPROFILE ".cursor\projects\empty-window\assets"
$dstDir = "C:\Users\awavi\Desktop\flight-plan\frontend\public\wx-scenes"

if (-not (Test-Path $srcDir)) {
    Write-Error "Pasta de origem nao encontrada: $srcDir"
}

New-Item -ItemType Directory -Force -Path $dstDir | Out-Null

$weathers = @("clear", "cloudy", "overcast", "rain", "fog", "storm")
$periods = @("dawn", "day", "dusk", "night", "late")

$copied = 0
$missing = 0

foreach ($w in $weathers) {
    foreach ($p in $periods) {
        $from = Join-Path $srcDir "wx-$w-$p.png"
        $to = Join-Path $dstDir "$w-$p.png"
        if (-not (Test-Path $from)) {
            Write-Warning "Faltando: $from"
            $missing++
            continue
        }
        Copy-Item $from $to -Force
        Write-Host "OK $w-$p.png"
        $copied++
    }
}

# idle + legado (dia) se existirem
foreach ($extra in @(
    @{ From = "wx-idle.png"; To = "idle.png" },
    @{ From = "wx-clear.png"; To = "clear.png" },
    @{ From = "wx-cloudy.png"; To = "cloudy.png" },
    @{ From = "wx-overcast.png"; To = "overcast.png" },
    @{ From = "wx-rain.png"; To = "rain.png" },
    @{ From = "wx-fog.png"; To = "fog.png" },
    @{ From = "wx-storm.png"; To = "storm.png" }
)) {
    $from = Join-Path $srcDir $extra.From
    $to = Join-Path $dstDir $extra.To
    if (Test-Path $from) {
        Copy-Item $from $to -Force
        Write-Host "OK $($extra.To)"
        $copied++
    }
}

Write-Host "`nCopiados: $copied | Faltando: $missing"
Write-Host "Destino: $dstDir"
