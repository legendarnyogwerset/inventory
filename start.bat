@echo off
title Inventarz QR Scanner - Setup
color 0A

echo.
echo ===============================================
echo     INVENTARZ QR SCANNER - SETUP
echo ===============================================
echo.

:: Sprawdź czy Python jest zainstalowany
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python nie jest zainstalowany!
    echo    Pobierz Python z: https://python.org
    echo    Upewnij się, że Python jest dodany do PATH
    pause
    exit /b 1
)

:: Sprawdź czy pliki istnieją
if not exist "index.html" (
    echo ❌ Brak pliku index.html
    pause
    exit /b 1
)

if not exist "app.js" (
    echo ❌ Brak pliku app.js
    pause
    exit /b 1
)

if not exist "style.css" (
    echo ❌ Brak pliku style.css
    pause
    exit /b 1
)

echo ✅ Wszystkie wymagane pliki znalezione
echo.

:: Sprawdź czy port 8000 jest wolny
netstat -an | find "8000" >nul
if not errorlevel 1 (
    echo ⚠️  Port 8000 jest zajęty, spróbuję 8001...
    set PORT=8001
) else (
    set PORT=8000
)

echo 🚀 Uruchamianie aplikacji...
echo 📡 Serwer będzie dostępny na: http://localhost:%PORT%
echo 📱 Przeglądarka otworzy się automatycznie
echo.
echo ⏹️  Naciśnij Ctrl+C aby zatrzymać serwer
echo ===============================================
echo.

:: Uruchom serwer
python -m http.server %PORT%

pause