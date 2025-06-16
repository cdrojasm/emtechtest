#!/bin/sh
if [ -z "$MODE" ]; then
    echo "MODE is not set."
    exit 1
fi
if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ] && [ "$MODE" != "sleep" ]; then
    echo "MODE must be one of the following values: dev, prod, sleep."
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "node_modules directory already exists."
else
    echo "Installing dependencies..."
    npm install
fi

if [ "$MODE" = "true" ]; then
    echo "I'm go to sleep for 1 hour. zzz zzz..."
    sleep 3600
fi
    echo "Starting services in production mode."
npm run dev