@echo off
REM Wordle Full-Stack Application Startup Script for Windows

echo =========================================
echo   Wordle Full-Stack Application
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Docker is not installed!
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo.

REM Check for running containers
docker compose ps | findstr "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] Containers are already running!
    echo.
    choice /C YN /M "Do you want to restart them?"
    if errorlevel 2 (
        echo Keeping existing containers running.
        pause
        exit /b 0
    )
    echo Stopping existing containers...
    docker compose down
)

REM Ask for mode
echo Choose mode:
echo 1) Production (recommended for testing)
echo 2) Development (with hot reload)
choice /C 12 /M "Enter choice"

if errorlevel 2 (
    echo Starting in DEVELOPMENT mode...
    set COMPOSE_FILE=docker-compose.dev.yml
    docker compose -f docker-compose.dev.yml up -d
) else (
    echo Starting in PRODUCTION mode...
    set COMPOSE_FILE=docker-compose.yml
    docker compose up -d
)

echo.
echo Building and starting containers...
echo (This may take a few minutes on first run)
echo.

REM Wait for containers to start
timeout /t 10 /nobreak >nul

REM Check health status
echo.
echo =========================================
echo   Application Status
echo =========================================
docker compose -f %COMPOSE_FILE% ps
echo.

echo =========================================
echo   Access the Application
echo =========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.

echo =========================================
echo   Useful Commands
echo =========================================
echo View logs:     docker compose logs -f
echo Stop app:      docker compose down
if "%COMPOSE_FILE%"=="docker-compose.dev.yml" (
    echo Restart:       docker compose -f docker-compose.dev.yml restart
) else (
    echo Restart:       docker compose restart
)
echo.

echo [OK] Application started successfully!
pause
