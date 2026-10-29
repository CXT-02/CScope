@echo off
title CScope Launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
if errorlevel 1 (
  echo.
  echo Startup failed. See the message above.
  pause
)
