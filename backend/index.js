const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8774;

// Path ke wishes.json (root repo, satu level di atas folder backend)
const WISHES_FILE = path.join(__dirname, '..', 'wishes.json');

app.use(cors());
app.use(express.json());

// Helper: baca wishes
function readWishes() {
  if (!fs.existsSync(WISHES_FILE)) return [];
  const data = fs.readFileSync(WISHES_FILE, 'utf-8');
  return JSON.parse(data);
}

// Helper: tulis wishes
function writeWishes(wishes) {
  fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2), 'utf-8');
}

// GET semua wishes
app.get('/api/wishes', (req, res) => {
  try {
    const wishes = readWishes();
    res.json({ success: true, data: wishes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membaca wishes', error: err.message });
  }
});

// POST tambah wish baru
app.post('/api/wishes', (req, res) => {
  try {
    const { name, alamat, comment } = req.body;
    if (!name || !comment) {
      return res.status(400).json({ success: false, message: 'Field name dan comment wajib diisi' });
    }
    const wishes = readWishes();
    const newWish = {
      id: wishes.length > 0 ? wishes[wishes.length - 1].id + 1 : 1,
      name,
      alamat: alamat || '',
      comment,
      created_at: new Date().toISOString()
    };
    wishes.push(newWish);
    writeWishes(wishes);
    res.status(201).json({ success: true, data: newWish });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan wish', error: err.message });
  }
});

// GET wish by ID
app.get('/api/wishes/:id', (req, res) => {
  try {
    const wishes = readWishes();
    const wish = wishes.find(w => w.id === parseInt(req.params.id));
    if (!wish) return res.status(404).json({ success: false, message: 'Wish tidak ditemukan' });
    res.json({ success: true, data: wish });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

// DELETE wish by ID
app.delete('/api/wishes/:id', (req, res) => {
  try {
    let wishes = readWishes();
    const idx = wishes.findIndex(w => w.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Wish tidak ditemukan' });
    const deleted = wishes.splice(idx, 1);
    writeWishes(wishes);
    res.json({ success: true, data: deleted[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus wish', error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mbo-wedding-backend', port: PORT });
});

app.listen(PORT, () => {
  console.log(`MBO Wedding Backend running on port ${PORT}`);
});
