#!/bin/bash

echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Restarting PM2..."
    pm2 restart fooddelivery
    echo "🚀 Application updated and restarted!"
    echo "📱 Your app is available at: http://31.207.36.151"
else
    echo "❌ Build failed! Not restarting PM2."
    exit 1
fi