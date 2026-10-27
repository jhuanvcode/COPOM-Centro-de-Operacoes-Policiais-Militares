@echo off
chcp 65001 > nul
if not exist bin\br\com\policia\app\Main.class (
    echo Compilando primeiro...
    call compilar.bat
)

java "-Dfile.encoding=UTF-8" -cp bin br.com.policia.app.Main
pause
