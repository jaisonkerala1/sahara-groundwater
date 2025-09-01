# 🚀 Sahara Groundwater Kerala - Quick Setup Script
# Run this after cloning from GitHub

Write-Host "🌊 SAHARA GROUNDWATER KERALA - QUICK SETUP" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "⚛️  Installing frontend dependencies..." -ForegroundColor Green
cd client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host "🔧 Setting up environment..." -ForegroundColor Green
if (-not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env and add your OPENROUTER_API_KEY!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 TO START THE APPLICATION:" -ForegroundColor Cyan
Write-Host "   Option 1: .\start.bat" -ForegroundColor White
Write-Host "   Option 2: .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Application will run on:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Add your OPENROUTER_API_KEY to .env file" -ForegroundColor White
Write-Host "   2. Get API key from: https://openrouter.ai/" -ForegroundColor White
Write-Host ""
