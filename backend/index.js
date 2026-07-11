const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8774;

// ── Path resolvers ──────────────────────────────────────────────
function resolvePath(envKey, dockerPath, localRelative) {
  if (process.env[envKey]) return process.env[envKey];
  if (fs.existsSync(dockerPath)) return dockerPath;
  return path.join(__dirname, localRelative);
}

const WISHES_FILE   = resolvePath('WISHES_PATH',   '/app/wishes.json',           '../wishes.json');
const TAMU_FILE     = resolvePath('TAMU_PATH',     '/app/backend/tamu.json',     'tamu.json');
const TEMPLATE_FILE = resolvePath('TEMPLATE_PATH', '/app/backend/template_pesan.json', 'template_pesan.json');

app.use(cors());
app.use(express.json());

// ── Generic file helpers ─────────────────────────────────────────
function readJSON(file, fallback = []) {
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}
function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// ════════════════════════════════════════════════════════════════
//  WISHES endpoints (existing)
// ════════════════════════════════════════════════════════════════

app.get('/api/wishes', (req, res) => {
  try { res.json({ success: true, data: readJSON(WISHES_FILE) }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal membaca wishes', error: err.message }); }
});

app.post('/api/wishes', (req, res) => {
  try {
    const { name, alamat, comment } = req.body;
    if (!name || !comment)
      return res.status(400).json({ success: false, message: 'Field name dan comment wajib diisi' });
    const wishes = readJSON(WISHES_FILE);
    const newWish = { id: nextId(wishes), name, alamat: alamat || '', comment, created_at: new Date().toISOString() };
    wishes.push(newWish);
    writeJSON(WISHES_FILE, wishes);
    res.status(201).json({ success: true, data: newWish });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menyimpan wish', error: err.message }); }
});

app.get('/api/wishes/:id', (req, res) => {
  try {
    const wish = readJSON(WISHES_FILE).find(w => w.id === parseInt(req.params.id));
    if (!wish) return res.status(404).json({ success: false, message: 'Wish tidak ditemukan' });
    res.json({ success: true, data: wish });
  } catch (err) { res.status(500).json({ success: false, message: 'Error', error: err.message }); }
});

app.put('/api/wishes/:id', (req, res) => {
  try {
    const wishes = readJSON(WISHES_FILE);
    const idx = wishes.findIndex(w => w.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Wish tidak ditemukan' });
    const { name, alamat, comment } = req.body;
    wishes[idx] = { ...wishes[idx], ...(name !== undefined && { name }), ...(alamat !== undefined && { alamat }), ...(comment !== undefined && { comment }) };
    writeJSON(WISHES_FILE, wishes);
    res.json({ success: true, data: wishes[idx] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal mengupdate wish', error: err.message }); }
});

app.delete('/api/wishes/:id', (req, res) => {
  try {
    let wishes = readJSON(WISHES_FILE);
    const idx = wishes.findIndex(w => w.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Wish tidak ditemukan' });
    const deleted = wishes.splice(idx, 1);
    writeJSON(WISHES_FILE, wishes);
    res.json({ success: true, data: deleted[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menghapus wish', error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  TAMU endpoints
// ════════════════════════════════════════════════════════════════

// GET semua tamu
app.get('/api/tamu', (req, res) => {
  try { res.json({ success: true, data: readJSON(TAMU_FILE) }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal membaca data tamu', error: err.message }); }
});

// POST tambah tamu
app.post('/api/tamu', (req, res) => {
  try {
    const { nama, wa, kategori, kursi } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama tamu wajib diisi' });
    const list = readJSON(TAMU_FILE);
    const newTamu = {
      id: nextId(list),
      nama,
      wa: wa || '',
      kategori: kategori || 'umum',
      kursi: kursi || 2,
      created_at: new Date().toISOString()
    };
    list.push(newTamu);
    writeJSON(TAMU_FILE, list);
    res.status(201).json({ success: true, data: newTamu });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menyimpan tamu', error: err.message }); }
});

// GET tamu by ID
app.get('/api/tamu/:id', (req, res) => {
  try {
    const tamu = readJSON(TAMU_FILE).find(t => t.id === parseInt(req.params.id));
    if (!tamu) return res.status(404).json({ success: false, message: 'Tamu tidak ditemukan' });
    res.json({ success: true, data: tamu });
  } catch (err) { res.status(500).json({ success: false, message: 'Error', error: err.message }); }
});

// PUT update tamu
app.put('/api/tamu/:id', (req, res) => {
  try {
    const list = readJSON(TAMU_FILE);
    const idx = list.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tamu tidak ditemukan' });
    const { nama, wa, kategori, kursi } = req.body;
    list[idx] = {
      ...list[idx],
      ...(nama      !== undefined && { nama }),
      ...(wa        !== undefined && { wa }),
      ...(kategori  !== undefined && { kategori }),
      ...(kursi     !== undefined && { kursi }),
    };
    writeJSON(TAMU_FILE, list);
    res.json({ success: true, data: list[idx] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal mengupdate tamu', error: err.message }); }
});

// DELETE tamu
app.delete('/api/tamu/:id', (req, res) => {
  try {
    let list = readJSON(TAMU_FILE);
    const idx = list.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Tamu tidak ditemukan' });
    const deleted = list.splice(idx, 1);
    writeJSON(TAMU_FILE, list);
    res.json({ success: true, data: deleted[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menghapus tamu', error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  TEMPLATE PESAN endpoints
// ════════════════════════════════════════════════════════════════

// GET semua template
app.get('/api/template', (req, res) => {
  try { res.json({ success: true, data: readJSON(TEMPLATE_FILE) }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal membaca template', error: err.message }); }
});

// POST buat template baru
app.post('/api/template', (req, res) => {
  try {
    const { nama, isi } = req.body;
    if (!nama || !isi) return res.status(400).json({ success: false, message: 'Nama dan isi template wajib diisi' });
    const list = readJSON(TEMPLATE_FILE);
    const newTmpl = { id: nextId(list), nama, isi, created_at: new Date().toISOString() };
    list.push(newTmpl);
    writeJSON(TEMPLATE_FILE, list);
    res.status(201).json({ success: true, data: newTmpl });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menyimpan template', error: err.message }); }
});

// GET template by ID
app.get('/api/template/:id', (req, res) => {
  try {
    const tmpl = readJSON(TEMPLATE_FILE).find(t => t.id === parseInt(req.params.id));
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: tmpl });
  } catch (err) { res.status(500).json({ success: false, message: 'Error', error: err.message }); }
});

// PUT update template
app.put('/api/template/:id', (req, res) => {
  try {
    const list = readJSON(TEMPLATE_FILE);
    const idx = list.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const { nama, isi } = req.body;
    list[idx] = { ...list[idx], ...(nama !== undefined && { nama }), ...(isi !== undefined && { isi }) };
    writeJSON(TEMPLATE_FILE, list);
    res.json({ success: true, data: list[idx] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal mengupdate template', error: err.message }); }
});

// DELETE template
app.delete('/api/template/:id', (req, res) => {
  try {
    let list = readJSON(TEMPLATE_FILE);
    const idx = list.findIndex(t => t.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const deleted = list.splice(idx, 1);
    writeJSON(TEMPLATE_FILE, list);
    res.json({ success: true, data: deleted[0] });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menghapus template', error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
//  Health check
// ════════════════════════════════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mbo-wedding-backend',
    port: PORT,
    files: { wishes: WISHES_FILE, tamu: TAMU_FILE, template: TEMPLATE_FILE }
  });
});

app.listen(PORT, () => {
  console.log(`MBO Wedding Backend running on port ${PORT}`);
  console.log(`Wishes file  : ${WISHES_FILE}`);
  console.log(`Tamu file    : ${TAMU_FILE}`);
  console.log(`Template file: ${TEMPLATE_FILE}`);
});
