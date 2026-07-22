# Copia ícone gerado para public + backend (e-mail CID)
$ErrorActionPreference = "Stop"
$srcIcon = "C:\Users\awavi\.cursor\projects\empty-window\assets\marquisa-icon.png"
$root = "C:\Users\awavi\Desktop\flight-plan"

New-Item -ItemType Directory -Force -Path "$root\backend\assets" | Out-Null

if (Test-Path $srcIcon) {
  Copy-Item -Force $srcIcon "$root\frontend\public\marquisa-email-logo.png"
  Copy-Item -Force $srcIcon "$root\backend\assets\email-logo.png"
  Copy-Item -Force $srcIcon "$root\frontend\public\apple-touch-icon.png"
  Write-Host "OK: email logo + apple-touch from marquisa-icon.png"
} else {
  Write-Host "AVISO: $srcIcon nao encontrado"
}

Get-Item "$root\frontend\public\marquisa-icon.svg","$root\frontend\public\marquisa-mark.svg","$root\frontend\public\marquisa-wordmark.svg" | Format-Table Name, Length
