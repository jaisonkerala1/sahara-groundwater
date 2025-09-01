@echo off
echo 🚀 Starting Food Analyzer App...
echo.

echo 📦 Installing backend dependencies...
npm install

echo 📦 Installing frontend dependencies...
cd client
npm install
cd ..

echo.
echo 🌐 Starting the application...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: 

echo.
echo Press Ctrl+C to stop both servers
echo.

start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd client && npm start"

echo ✅ Both servers are starting up!
echo 📱 Open http://localhost:3000 in your browser
pause
