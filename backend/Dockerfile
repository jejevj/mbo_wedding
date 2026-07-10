FROM node:20-alpine

WORKDIR /app

# Copy package files dulu untuk cache layer
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy source backend
COPY backend/index.js ./index.js

# wishes.json di-mount via volume (lihat docker-compose.yml)
# Path yang dibaca: /app/wishes.json

EXPOSE 8774

CMD ["node", "index.js"]
