@echo off
chcp 65001 > nul
REM InkOS - Run Only [no build]
REM Runs pre-built Studio in Korean

set "ROOT=%~dp0"
set "INKOS_LOCALE=ko"
set "INKOS_CLI_ROOT=%~dp0packages\cli\dist"

if not exist "%INKOS_CLI_ROOT%\index.js" (
    echo InkOS CLI not built.
    echo See: inkos-dev.bat for build + run
    pause
    exit /b 1
)

echo Starting InkOS Studio [Korean]...
node "%INKOS_CLI_ROOT%\index.js" studio
if errorlevel 1 (
    echo.
    echo Studio exited with an error.
    pause
)