@echo off
chcp 65001 > nul
REM InkOS - Development Build + Run
REM Builds core, then runs Studio in Korean

set "ROOT=%~dp0"
set "INKOS_LOCALE=ko"

echo ========================================
echo   InkOS - Dev Build + Run
echo ========================================
echo.

echo [1/3] Building core...
cd /d "%ROOT%packages\core"
call npx tsc
if errorlevel 1 (
    echo ERROR: core build failed
    cd /d "%ROOT%"
    pause
    exit /b 1
)
echo   core built OK.

echo [2/3] Building studio server...
cd /d "%ROOT%packages\studio"
call npx tsc -p tsconfig.server.json
if errorlevel 1 (
    echo ERROR: studio server build failed
    cd /d "%ROOT%"
    pause
    exit /b 1
)
echo   studio server built OK.

echo [3/3] Starting Studio...
echo.
cd /d "%ROOT%"
node "%ROOT%packages\cli\dist\index.js" studio
if errorlevel 1 (
    echo.
    echo Studio exited with an error.
    pause
)
cd /d "%ROOT%"