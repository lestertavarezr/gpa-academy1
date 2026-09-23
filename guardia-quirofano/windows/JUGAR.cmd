@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
if errorlevel 1 (
  echo.
  echo No se pudo iniciar el juego. Comprueba que el puerto 4174 no este ocupado.
  pause
)
