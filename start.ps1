Write-Host "🚀 Starting Food Analyzer App..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
Set-Location ..

Write-Host ""
Write-Host "🌐 Starting the application..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start backend server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location client; npm start" -WindowStyle Normal

Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host "📱 Open http://localhost:3000 in your browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
