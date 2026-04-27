#!/bin/sh
set -e

if [ ! -f "$BUDDEN_CONFIG" ]; then
  echo "First run — initialising config and database at /data"
  cd /app && bun run apps/cli/src/index.ts init
  echo ""
  echo "Save the API token above. It's also written to $BUDDEN_CONFIG."
fi

exec bun apps/web/build/index.js
