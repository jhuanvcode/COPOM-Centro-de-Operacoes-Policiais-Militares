@echo off
chcp 65001 > nul
echo ========================================================
echo   Iniciando Dashboard Web COPOM 190 (TypeScript + Java)
echo ========================================================

if not exist bin\br\com\policia\app\ApiServer.class (
    echo Compilando aplicacao...
    call compilar.bat
)

echo.
echo [OK] Servidor iniciando em http://localhost:8080
echo [OK] Abrindo navegador automaticamente...
start http://localhost:8080

java "-Dfile.encoding=UTF-8" -cp bin br.com.policia.app.ApiServer
pause
