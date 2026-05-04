@echo off
title OTC Games Dev Server
echo Starting OTC Games...
echo.
echo  Builder (Lecturer): http://localhost:5173/builder.html
echo  Player  (Student):  http://localhost:5173
echo.
start "OTC Games" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
start "" http://localhost:5173/builder.html
