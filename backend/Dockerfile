FROM node:20-alpine

WORKDIR /app

# Copy package files dan install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy semua source backend
COPY backend/ ./backend/

# Copy wishes.json dari root repo
COPY wishes.json ./wishes.json

WORKDIR /app/backend

EXPOSE 8774

CMD ["node", "index.js"]
