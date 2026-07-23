# Copia PNGs oficiais do Canva para e-mail (CID) e aliases
$ErrorActionPreference = "Stop"
$pub = "C:\Users\awavi\Desktop\flight-plan\frontend\public"
$backendAssets = "C:\Users\awavi\Desktop\flight-plan\backend\assets"
New-Item -ItemType Directory -Force -Path $backendAssets | Out-Null

Copy-Item -Force "$pub\marquisa-mark.png" "$backendAssets\email-logo.png"
Copy-Item -Force "$pub\marquisa-mark.png" "$pub\marquisa-email-logo.png"
Copy-Item -Force "$pub\marquisa-mark.png" "$pub\apple-touch-icon.png"

Write-Host "OK email-logo + apple-touch"
Get-Item "$pub\marquisa-icon.png","$pub\marquisa-mark.png","$pub\marquisa-wordmark.png","$backendAssets\email-logo.png" |
  Format-Table Name, Length, LastWriteTime -AutoSize
