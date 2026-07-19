@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo === Marquisa - servidor local ===
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao instalado.
    echo Baixe em https://nodejs.org  ^(versao LTS^)
    pause
    exit /b 1
)

echo Node:
node -v
echo.

if not exist "node_modules\vite\package.json" (
    echo Instalando dependencias... aguarde 1-2 minutos
    call npm install
    if errorlevel 1 (
        echo ERRO no npm install
        pause
        exit /b 1
    )
)

if not exist "public\images" mkdir "public\images"
if exist "%USERPROFILE%\.cursor\projects\empty-window\assets\bg-ifr-chart-4k.jpg" (
    copy /Y "%USERPROFILE%\.cursor\projects\empty-window\assets\bg-ifr-chart-4k.jpg" "public\images\bg-ifr-chart-4k.jpg" >nul
    echo Imagem IFR 4K copiada.
)

echo.
echo Subindo servidor... NAO FECHE ESTA JANELA.
echo Quando aparecer "Local: http://127.0.0.1:5173/" abra esse link no navegador.
echo Ctrl+C para parar.
echo.

call npm run dev

pause
