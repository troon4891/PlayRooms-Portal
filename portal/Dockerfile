# Default allows local `docker build` without --build-arg; HA Supervisor always overrides
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bookworm
FROM ${BUILD_FROM}

# Install Node.js only — Portal is lightweight, no Intiface, no Bluetooth, no serial
RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update && \
    apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy and build server
COPY server/package.json server/package-lock.json* /app/server/
WORKDIR /app/server
RUN npm ci --ignore-scripts 2>/dev/null || npm install

COPY server/ /app/server/
RUN npm run build

# Clean up build dependencies
RUN npm prune --omit=dev

COPY run.sh /
RUN chmod +x /run.sh

CMD ["/run.sh"]
