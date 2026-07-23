# Copia imagens do e-mail promocional para public/emails
$ErrorActionPreference = "Stop"
$assets = "C:\Users\awavi\.cursor\projects\empty-window\assets"
$dest = "C:\Users\awavi\Desktop\flight-plan\frontend\public\emails"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$files = @(
  @{ Src = "email-aviation-hero.png"; Dst = "email-aviation-hero.png" },
  @{ Src = "email-aviation-daynight.png"; Dst = "email-aviation-daynight.png" }
)

foreach ($f in $files) {
  $from = Join-Path $assets $f.Src
  $to = Join-Path $dest $f.Dst
  if (Test-Path $from) {
    Copy-Item -Force $from $to
    Write-Host "OK $($f.Dst)"
  } else {
    Write-Host "FALTA $from"
  }
}
