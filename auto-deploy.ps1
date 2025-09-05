# Sahara Groundwater - Auto Deploy Script
# This script builds and prepares files for deployment

Write-Host "🚀 Sahara Groundwater - Auto Deploy Script" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Step 1: Build the React app
Write-Host "📦 Building React app..." -ForegroundColor Yellow
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 2: Go back to root
Set-Location ..

# Step 3: Show deployment instructions
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Hostinger File Manager" -ForegroundColor White
Write-Host "2. Navigate to public_html/report/" -ForegroundColor White
Write-Host "3. Upload ALL files from client/build/ folder" -ForegroundColor White
Write-Host "4. Test: https://report.saharagroundwater.com/" -ForegroundColor White
Write-Host ""
Write-Host "📁 Files to upload:" -ForegroundColor Cyan
Get-ChildItem -Path "client/build" -Recurse | ForEach-Object {
    Write-Host "   $($_.FullName.Replace((Get-Location).Path + '\client\build\', ''))" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Ready for deployment!" -ForegroundColor Green
