@echo off
rem Обновить сайт на GitHub Pages: закоммитить изменения и отправить на GitHub.
rem Запуск: двойной клик по файлу (или deploy.bat --no-pause из консоли).
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "SITE=https://vroang.github.io/boroda-nozhnicy/"

where git >nul 2>&1 || (echo [Ошибка] git не найден. Установите Git for Windows. & goto :end)

echo === Что изменилось ===
git status --short
echo.

git add -A
git diff --cached --quiet
if %errorlevel%==0 (
  echo Новых изменений нет - отправляю то, что уже закоммичено.
) else (
  git commit -q -m "Обновление сайта %date% %time:~0,5%"
  if errorlevel 1 (echo [Ошибка] не удалось сделать коммит. & goto :end)
  echo Коммит создан.
)

echo.
echo === Отправка на GitHub ===
git push -u origin main
if errorlevel 1 (echo [Ошибка] push не прошёл - см. сообщение выше. & goto :end)

echo.
echo Готово. GitHub Pages обновит сайт через 1-2 минуты:
echo %SITE%
echo (если видна старая версия - обновите страницу с Ctrl+F5)

:end
endlocal
if /i not "%~1"=="--no-pause" pause
