@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title NEXUS - Secure Investigation System

echo ========================================================
echo   NEXUS - Secure Intelligence. Connected Evidence.
echo ========================================================
echo Project: %CD%
echo.

REM 1. Python / venv
if not exist "venv\Scripts\python.exe" (
  echo [1/5] Creating Python virtual environment...
  python -m venv venv
  if errorlevel 1 (
    echo ERROR: Could not create venv. Install Python 3.11+ and ensure ^"python^" works in CMD.
    pause
    exit /b 1
  )
) else (
  echo [1/5] Python environment ready.
)
call "venv\Scripts\activate.bat"
if errorlevel 1 (
  echo ERROR: Could not activate venv.
  pause
  exit /b 1
)

REM 2. Backend packages
python -c "import uvicorn,fastapi" >nul 2>&1
if errorlevel 1 (
  echo [2/5] Installing backend dependencies...
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
  if errorlevel 1 (
    echo ERROR: Backend dependencies failed. See this terminal for details.
    pause
    exit /b 1
  )
) else (
  echo [2/5] Backend dependencies ready.
)

REM 3. Frontend packages
if not exist "frontend\node_modules" (
  echo [3/5] Installing frontend dependencies. This can take a few minutes...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    echo ERROR: npm install failed. Install Node.js LTS and try again.
    pause
    exit /b 1
  )
  popd
) else (
  echo [3/5] Frontend dependencies ready.
)

REM 4. Backend
if not exist "venv\Scripts\uvicorn.exe" (
  echo ERROR: Uvicorn is missing after dependency installation.
  pause
  exit /b 1
)
echo [4/5] Starting backend: http://127.0.0.1:8000
start "NEXUS Backend" "%ComSpec%" /k "cd /d ""%~dp0"" && call ""venv\Scripts\activate.bat"" && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Waiting for backend health...
set BACKEND_READY=
for /l %%i in (1,1,40) do (
  powershell -NoProfile -Command "try {$r=Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health -TimeoutSec 1;if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
  if not errorlevel 1 set BACKEND_READY=1&goto backend_ok
  timeout /t 1 /nobreak >nul
)
:backend_ok
if defined BACKEND_READY (echo Backend READY.) else echo WARNING: Backend not ready. Check NEXUS Backend terminal.

REM 5. Frontend
echo [5/5] Starting frontend: http://127.0.0.1:5173
start "NEXUS Frontend" "%ComSpec%" /k "cd /d ""%~dp0frontend"" && npm run dev -- --host 127.0.0.1"

echo Waiting for frontend...
set FRONT_READY=
for /l %%i in (1,1,40) do (
  powershell -NoProfile -Command "try {$r=Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173 -TimeoutSec 1;if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
  if not errorlevel 1 set FRONT_READY=1&goto frontend_ok
  timeout /t 1 /nobreak >nul
)
:frontend_ok
if defined FRONT_READY (
  echo Frontend READY. Opening browser...
  start "" "http://127.0.0.1:5173"
) else echo WARNING: Frontend not ready. Check NEXUS Frontend terminal.

echo.
echo ========================================================
echo Frontend : http://127.0.0.1:5173
echo Backend  : http://127.0.0.1:8000
echo Swagger  : http://127.0.0.1:8000/docs
echo ========================================================
echo Keep the Backend and Frontend windows open while using NEXUS.
endlocal
