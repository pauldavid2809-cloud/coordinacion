@echo off
title Sistema de Permisos y Coordinacion - Seminario Santo Tomas de Aquino
color 0B
cls
echo ======================================================================
echo    SEMINARIO MAYOR SANTO TOMAS DE AQUINO - ARQUIDIOCESIS DE MARACAIBO
echo    SISTEMA DE PERMISOS, COORDINACION Y PROPUESTAS 2026-2027
echo ======================================================================
echo.
echo Iniciando aplicacion web...
echo.
start http://localhost:5173
npm run dev
pause
