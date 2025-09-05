@echo off
echo 🚀 Sahara Groundwater - Quick Deploy
echo ===================================
echo.

cd client
echo 📦 Building React app...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build completed!
echo.
echo 🎯 Next Steps:
echo 1. Go to Hostinger File Manager
echo 2. Navigate to public_html/report/
echo 3. Upload ALL files from client/build/ folder
echo 4. Test: https://report.saharagroundwater.com/
echo.
echo Press any key to open the build folder...
pause >nul
explorer client\build
