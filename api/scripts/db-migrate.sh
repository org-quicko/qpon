#!/bin/sh
set -e

printf "\n=========================================================================\n"
printf "\n=========================\n\nMigrating Data\n\n==========================\n"

if [ "$NODE_ENV" = "production" ]; then
    if [ -d "/app/dist/db/migrations" ]; then
        echo "Running migrations for production...."
        # Run the compiled migrations directly: `npm run db:migration-run`
        # rebuilds the app first, which needs the sources and dev dependencies.
        node ./node_modules/typeorm/cli.js migration:run --dataSource ./dist/db/data-source.js
    else
        echo "No migrations folder found, skipping migration."
    fi
else
    echo "Skipping migrations since NODE_ENV is not production"
fi

printf "\n=========================================================================\n"

exec "$@"