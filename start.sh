#!/bin/bash
set -e
export NODE_ENV=production
export PORT=${PORT:-3010}
exec node server.js
