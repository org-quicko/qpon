#!/bin/sh
set -e

printf "\n=========================================================================\n"
printf "\n=========================\n\nMigrating Data\n\n==========================\n"

if [ "$NODE_ENV" = "production" ]; then
    if [ -d "/app/db/migrations" ]; then
        echo "Running migrations for production..."
        npm run db:migration-run
    else
        echo "No migrations folder found, skipping migration."
    fi
else
    echo "Skipping migrations since NODE_ENV is not production"
fi

printf "\n=========================================================================\n"

exec "$@"