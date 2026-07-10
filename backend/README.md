# MBO Wedding Backend API

Node.js REST API untuk mengelola ucapan/wishes pada website pernikahan MBO.

## Menjalankan Secara Lokal

```bash
cd backend
npm install
node index.js
```

Server berjalan di: `http://localhost:8774`

## Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/wishes` | Ambil semua wishes |
| POST | `/api/wishes` | Tambah wish baru |
| GET | `/api/wishes/:id` | Ambil wish by ID |
| DELETE | `/api/wishes/:id` | Hapus wish by ID |

## Contoh Request POST

```json
{
  "name": "Nama Tamu",
  "alamat": "Kota, Provinsi",
  "comment": "Selamat menempuh hidup baru!"
}
```

## Menjalankan via Docker

```bash
# Build dari root repo
docker build -f backend/Dockerfile -t mbo-wedding-backend .

# Run container
docker run -p 8774:8774 mbo-wedding-backend
```
