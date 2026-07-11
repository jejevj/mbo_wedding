const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const multer  = require('multer');

const app  = express();
const PORT = process.env.PORT || 8774;

// ── multer: simpan file di memory (tidak perlu disk) ──────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── Path resolvers ─────────────────────────────────────────────────
function resolvePath(envKey, dockerPath, localRelative) {
  if (process.env[envKey]) return process.env[envKey];
  if (fs.existsSync(dockerPath)) return dockerPath;
  return path.join(__dirname, localRelative);
}

const WISHES_FILE   = resolvePath('WISHES_PATH',   '/app/wishes.json',                '../wishes.json');
const TAMU_FILE     = resolvePath('TAMU_PATH',     '/app/backend/tamu.json',          'tamu.json');
const TEMPLATE_FILE = resolvePath('TEMPLATE_PATH', '/app/backend/template_pesan.json','template_pesan.json');

app.use(cors());
app.use(express.json());

// ── Generic helpers ────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════
//  WISHES
// ════════════════════════════════════════════════════════════════════
app.get('/api/wishes', (req, res) => {
  try { res.json({ success: true, data: readJSON(WISHES_FILE) }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal membaca wishes', error: err.message }); }
});
app.post('/api/wishes', (req, res) => {
  try {
    const { name, alamat, comment } = req.body;
    if (!name || !comment) return res.status(400).json({ success: false, message: 'name dan comment wajib' });
    const wishes = readJSON(WISHES_FILE);
    const newWish = { id: nextId(wishes), name, alamat: alamat || '', comment, created_at: new Date().toISOString() };
    wishes.push(newWish); writeJSON(WISHES_FILE, wishes);
    res.status(201).json({ success: true, data: newWish });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.get('/api/wishes/:id', (req, res) => {
  const wish = readJSON(WISHES_FILE).find(w => w.id === parseInt(req.params.id));
  if (!wish) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  res.json({ success: true, data: wish });
});
app.put('/api/wishes/:id', (req, res) => {
  const wishes = readJSON(WISHES_FILE);
  const idx = wishes.findIndex(w => w.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const { name, alamat, comment } = req.body;
  wishes[idx] = { ...wishes[idx], ...(name !== undefined && { name }), ...(alamat !== undefined && { alamat }), ...(comment !== undefined && { comment }) };
  writeJSON(WISHES_FILE, wishes);
  res.json({ success: true, data: wishes[idx] });
});
app.delete('/api/wishes/:id', (req, res) => {
  let wishes = readJSON(WISHES_FILE);
  const idx = wishes.findIndex(w => w.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const deleted = wishes.splice(idx, 1); writeJSON(WISHES_FILE, wishes);
  res.json({ success: true, data: deleted[0] });
});

// ════════════════════════════════════════════════════════════════════
//  TAMU
// ════════════════════════════════════════════════════════════════════
app.get('/api/tamu', (req, res) => {
  try { res.json({ success: true, data: readJSON(TAMU_FILE) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.post('/api/tamu', (req, res) => {
  try {
    const { nama, wa } = req.body;
    if (!nama) return res.status(400).json({ success: false, message: 'Nama tamu wajib diisi' });
    const list = readJSON(TAMU_FILE);
    const newTamu = { id: nextId(list), nama, wa: wa || '', created_at: new Date().toISOString() };
    list.push(newTamu); writeJSON(TAMU_FILE, list);
    res.status(201).json({ success: true, data: newTamu });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.get('/api/tamu/:id', (req, res) => {
  const tamu = readJSON(TAMU_FILE).find(t => t.id === parseInt(req.params.id));
  if (!tamu) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  res.json({ success: true, data: tamu });
});
app.put('/api/tamu/:id', (req, res) => {
  const list = readJSON(TAMU_FILE);
  const idx  = list.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const { nama, wa } = req.body;
  list[idx] = { ...list[idx], ...(nama !== undefined && { nama }), ...(wa !== undefined && { wa }) };
  writeJSON(TAMU_FILE, list);
  res.json({ success: true, data: list[idx] });
});
app.delete('/api/tamu/:id', (req, res) => {
  let list = readJSON(TAMU_FILE);
  const idx = list.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const deleted = list.splice(idx, 1); writeJSON(TAMU_FILE, list);
  res.json({ success: true, data: deleted[0] });
});

// ════════════════════════════════════════════════════════════════════
//  TEMPLATE PESAN
// ════════════════════════════════════════════════════════════════════
app.get('/api/template', (req, res) => {
  try { res.json({ success: true, data: readJSON(TEMPLATE_FILE) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.post('/api/template', (req, res) => {
  try {
    const { nama, isi } = req.body;
    if (!nama || !isi) return res.status(400).json({ success: false, message: 'nama dan isi wajib' });
    const list = readJSON(TEMPLATE_FILE);
    const newTmpl = { id: nextId(list), nama, isi, created_at: new Date().toISOString() };
    list.push(newTmpl); writeJSON(TEMPLATE_FILE, list);
    res.status(201).json({ success: true, data: newTmpl });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
app.get('/api/template/:id', (req, res) => {
  const tmpl = readJSON(TEMPLATE_FILE).find(t => t.id === parseInt(req.params.id));
  if (!tmpl) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  res.json({ success: true, data: tmpl });
});
app.put('/api/template/:id', (req, res) => {
  const list = readJSON(TEMPLATE_FILE);
  const idx  = list.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const { nama, isi } = req.body;
  list[idx] = { ...list[idx], ...(nama !== undefined && { nama }), ...(isi !== undefined && { isi }) };
  writeJSON(TEMPLATE_FILE, list);
  res.json({ success: true, data: list[idx] });
});
app.delete('/api/template/:id', (req, res) => {
  let list = readJSON(TEMPLATE_FILE);
  const idx = list.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
  const deleted = list.splice(idx, 1); writeJSON(TEMPLATE_FILE, list);
  res.json({ success: true, data: deleted[0] });
});

// ════════════════════════════════════════════════════════════════════
//  VCF — EXPORT: generate file .vcf dari semua tamu
// ════════════════════════════════════════════════════════════════════
app.get('/api/tamu/export/vcf', (req, res) => {
  try {
    const list = readJSON(TAMU_FILE);
    if (!list.length) return res.status(404).json({ success: false, message: 'Belum ada tamu' });

    const vcfLines = list.map(t => {
      // Format nomor: pastikan diawali +62 jika angka Indonesia
      let tel = t.wa || '';
      if (tel.startsWith('0'))  tel = '+62' + tel.slice(1);
      if (tel.startsWith('62')) tel = '+' + tel;

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${t.nama}`,
        `N:${t.nama};;;;`,
      ];
      if (tel) lines.push(`TEL;TYPE=CELL:${tel}`);
      lines.push('END:VCARD');
      return lines.join('\r\n');
    }).join('\r\n\r\n');

    const filename = `tamu_mbo_wedding_${Date.now()}.vcf`;
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcfLines);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal generate VCF', error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════════
//  VCF — IMPORT: upload file .vcf, parse, simpan ke tamu.json
// ════════════════════════════════════════════════════════════════════
app.post('/api/tamu/import/vcf', upload.single('vcf'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File VCF tidak ditemukan' });

    const content = req.file.buffer.toString('utf-8');
    const contacts = parseVCF(content);

    if (!contacts.length)
      return res.status(422).json({ success: false, message: 'Tidak ada kontak valid di file VCF' });

    const list    = readJSON(TAMU_FILE);
    const added   = [];
    const skipped = [];

    for (const c of contacts) {
      // Skip jika nama sudah ada (case-insensitive)
      const exists = list.some(t => t.nama.toLowerCase() === c.nama.toLowerCase());
      if (exists) { skipped.push(c.nama); continue; }

      const newTamu = {
        id: nextId([...list, ...added]),
        nama: c.nama,
        wa: c.wa || '',
        created_at: new Date().toISOString()
      };
      list.push(newTamu);
      added.push(newTamu);
    }

    writeJSON(TAMU_FILE, list);
    res.json({
      success: true,
      message: `${added.length} kontak berhasil diimpor, ${skipped.length} dilewati (duplikat)`,
      added: added.length,
      skipped: skipped.length,
      skipped_names: skipped
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memproses VCF', error: err.message });
  }
});

// ── Parser VCF sederhana (mendukung VCF 2.1, 3.0, 4.0) ────────────
function parseVCF(raw) {
  const contacts = [];
  // Pisah per blok VCARD
  const blocks = raw.split(/END:VCARD/i).filter(b => b.trim());

  for (const block of blocks) {
    let nama = '';
    let wa   = '';

    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim();
      // FN (Full Name)
      if (/^FN[;:]/i.test(line)) {
        nama = line.replace(/^FN[^:]*:/i, '').trim();
      }
      // N (jika FN kosong)
      if (!nama && /^N[;:]/i.test(line)) {
        const parts = line.replace(/^N[^:]*:/i, '').split(';');
        // Format N: Surname;Given;Middle;Prefix;Suffix
        nama = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
      }
      // TEL
      if (/^TEL[;:]/i.test(line) && !wa) {
        let tel = line.replace(/^TEL[^:]*:/i, '').trim().replace(/[\s\-().]/g, '');
        // Normalkan ke format 08xx
        if (tel.startsWith('+62')) tel = '0' + tel.slice(3);
        if (tel.startsWith('62') && tel.length > 10) tel = '0' + tel.slice(2);
        wa = tel;
      }
    }

    if (nama) contacts.push({ nama, wa });
  }
  return contacts;
}

// ════════════════════════════════════════════════════════════════════
//  Health check
// ════════════════════════════════════════════════════════════════════
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
  console.log(`Tamu file    : ${TAMU_FILE}`);
  console.log(`Template file: ${TEMPLATE_FILE}`);
});
