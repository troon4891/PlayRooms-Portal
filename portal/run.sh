#!/usr/bin/with-contenv bashio

PORT=$(bashio::config 'port')
SHARED_SECRET=$(bashio::config 'shared_secret')
LOG_LEVEL=$(bashio::config 'log_level')

# Export configuration for Node.js server
export PORTAL_PORT="${PORT}"
export SHARED_SECRET="${SHARED_SECRET}"
export LOG_LEVEL="${LOG_LEVEL}"

bashio::log.info "Starting PlayRooms Portal on port ${PORT}..."

exec node /app/server/dist/index.js
