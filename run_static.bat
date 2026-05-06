@echo off
chcp 65001 >nul
setlocal

REM ========================================
REM Baseball Prototype - Static Test Server
REM Python簡易サーバーでリポジトリ直下を開く
REM ========================================

set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%
set PORT=8765
if not "%~1"=="" set PORT=%~1

pushd "%SCRIPT_DIR%"

echo [INFO] Starting test server...
echo [INFO] http://localhost:%PORT%/index.html
echo [INFO] Ctrl+C で終了
echo.
start http://localhost:%PORT%/index.html

python -m http.server %PORT% --bind 127.0.0.1
if errorlevel 1 (
    echo.
    echo [INFO] python が見つかりません。直接ファイルを開きます...
    start "" "%SCRIPT_DIR%\index.html"
)

popd
endlocal
