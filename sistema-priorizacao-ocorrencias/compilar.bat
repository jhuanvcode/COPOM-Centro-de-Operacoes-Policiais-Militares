@echo off
chcp 65001 > nul
echo ========================================================
echo   Compilando Sistema de Priorizacao Policial...
echo ========================================================

if not exist bin mkdir bin

javac -encoding UTF-8 -d bin src\br\com\policia\model\*.java src\br\com\policia\sorting\*.java src\br\com\policia\generator\*.java src\br\com\policia\benchmark\*.java src\br\com\policia\app\*.java

if %ERRORLEVEL% equ 0 (
    echo [SUCESSO] Codigo compilado com sucesso na pasta bin/
) else (
    echo [ERRO] Falha durante a compilacao.
)
pause
