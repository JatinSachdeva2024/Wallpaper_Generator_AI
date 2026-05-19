# Windows Task Scheduler — run daily at midnight
# Action: powershell -File "C:\path\to\AI-wallpaper App\scripts\schedule-daily.ps1"

Set-Location $PSScriptRoot\..
npm run cron:generate 2>&1 | Tee-Object -FilePath "data\cron.log" -Append
