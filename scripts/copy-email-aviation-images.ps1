$ErrorActionPreference = "Stop"
$assets = "C:\Users\awavi\.cursor\projects\empty-window\assets"
$dest = "C:\Users\awavi\Desktop\flight-plan\frontend\public\emails"
Copy-Item -Force (Join-Path $assets "email-aviation-hero.png") (Join-Path $dest "email-aviation-hero.png")
Copy-Item -Force (Join-Path $assets "email-aviation-daynight.png") (Join-Path $dest "email-aviation-daynight.png")
Get-Item (Join-Path $dest "email-aviation-*.png") | Format-Table Name, Length -AutoSize
