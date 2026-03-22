@echo off
title OTC Games Dev Server
echo Starting OTC Games...
echo.
echo  Player (Student):   http://localhost:5173
echo  Builder (Lecturer): http://localhost:5174/builder.html
echo.
start "OTC Player" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
start "OTC Builder" cmd /k "npm run dev:builder"
timeout /t 3 /nobreak >nul
start "" http://localhost:5173
start "" http://localhost:5174/builder.html
