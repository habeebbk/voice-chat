@echo off
echo Starting Voice Chat Application...
echo.

echo Installing dependencies...
npm install
cd client
npm install
cd ..

echo.
echo Starting the application...
echo.
echo The app will be available at:
echo - Local: http://localhost:3000
echo - Network: http://YOUR_IP_ADDRESS:3000
echo.
echo To find your IP address, run: ipconfig
echo.

npm run dev

pause 