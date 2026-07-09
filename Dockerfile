FROM node:20-alpine

WORKDIR /app

# Salin semua file project
COPY . .

# Tidak ada npm install karena server.js hanya pakai built-in Node.js modules
# (http, fs, path) — zero dependencies

EXPOSE 80

CMD ["node", "server.js"]
