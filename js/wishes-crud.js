/**
 * wishes-crud.js
 * CRUD operations for wishes via Backend API
 * Backend: https://beikbalikha.ourtestcloud.my.id:8774/api/wishes
 * Terintegrasi dengan form#guestbook_form dan section.wishes-section di index.html
 */

const BACKEND_API = "https://beikbalikha.ourtestcloud.my.id:8774/api/wishes";

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function getCurrentISOTime() {
  return new Date().toISOString();
}

// ─── READ ─────────────────────────────────────────────────────────────────────

async function fetchWishes() {
  try {
    const res = await fetch(BACKEND_API);
    if (!res.ok) throw new Error("Gagal memuat wishes dari backend");
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("[WishesCRUD] fetchWishes error:", err);
    return [];
  }
}

async function renderWishes() {
  const wishes = await fetchWishes();
  const container = document.querySelector(".wishes-section .wishes-preview");
  if (!container) return;

  container.innerHTML = "";

  if (wishes.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">Belum ada ucapan. Jadilah yang pertama! 💌</p>`;
    return;
  }

  // Sort terbaru di atas
  const sorted = [...wishes].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  sorted.forEach((wish) => {
    const card = document.createElement("div");
    card.className = "card mb-3 wish-card";
    card.dataset.wishId = wish.id;
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="card-title mb-0 fw-bold">${escapeHtml(wish.name)}</h6>
            <small class="text-muted">${escapeHtml(wish.alamat)}</small>
          </div>
          <small class="text-muted wish-date">${formatWishDate(wish.created_at)}</small>
        </div>
        <p class="card-text mt-2 wishes">${escapeHtml(wish.comment)}</p>
        <div class="wish-actions mt-2">
          <button class="btn btn-sm btn-outline-warning me-1 btn-edit-wish" data-id="${wish.id}">✏️ Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete-wish" data-id="${wish.id}">🗑️ Hapus</button>
        </div>
      </div>
      <!-- Edit form (hidden by default) -->
      <div class="card-footer wish-edit-form d-none p-3">
        <div class="mb-2">
          <input type="text" class="form-control form-control-sm edit-name" value="${escapeHtml(wish.name)}" placeholder="Nama" />
        </div>
        <div class="mb-2">
          <input type="text" class="form-control form-control-sm edit-alamat" value="${escapeHtml(wish.alamat)}" placeholder="Alamat" />
        </div>
        <div class="mb-2">
          <textarea class="form-control form-control-sm edit-comment" rows="3" placeholder="Ucapan">${escapeHtml(wish.comment)}</textarea>
        </div>
        <button class="btn btn-sm btn-success btn-save-wish me-1" data-id="${wish.id}">💾 Simpan</button>
        <button class="btn btn-sm btn-secondary btn-cancel-edit">Batal</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Bind events setelah render
  bindWishEvents();
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

async function createWish(name, alamat, comment) {
  const res = await fetch(BACKEND_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      alamat: alamat.trim(),
      comment: comment.trim(),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menyimpan wish ke backend");
  }
  const json = await res.json();
  return json.data;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

async function updateWish(id, updatedFields) {
  const res = await fetch(`${BACKEND_API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal memperbarui wish");
  }
  const json = await res.json();
  return json.data;
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

async function deleteWish(id) {
  const res = await fetch(`${BACKEND_API}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus wish");
  }
}

// ─── EVENT BINDING ────────────────────────────────────────────────────────────

function bindWishEvents() {
  // Tombol Edit
  document.querySelectorAll(".btn-edit-wish").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".wish-card");
      card.querySelector(".wish-edit-form").classList.remove("d-none");
      card.querySelector(".wish-actions").classList.add("d-none");
    });
  });

  // Tombol Batal Edit
  document.querySelectorAll(".btn-cancel-edit").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".wish-card");
      card.querySelector(".wish-edit-form").classList.add("d-none");
      card.querySelector(".wish-actions").classList.remove("d-none");
    });
  });

  // Tombol Simpan Edit
  document.querySelectorAll(".btn-save-wish").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = this.dataset.id;
      const card = this.closest(".wish-card");
      const name = card.querySelector(".edit-name").value;
      const alamat = card.querySelector(".edit-alamat").value;
      const comment = card.querySelector(".edit-comment").value;

      if (!name || !comment) {
        alert("Nama dan ucapan tidak boleh kosong.");
        return;
      }

      try {
        await updateWish(id, { name, alamat, comment });
        showToast("Ucapan berhasil diperbarui! ✅");
        await renderWishes();
      } catch (err) {
        alert("Gagal memperbarui: " + err.message);
      }
    });
  });

  // Tombol Hapus
  document.querySelectorAll(".btn-delete-wish").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = this.dataset.id;
      if (!confirm("Yakin ingin menghapus ucapan ini?")) return;
      try {
        await deleteWish(id);
        showToast("Ucapan berhasil dihapus! 🗑️");
        await renderWishes();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    });
  });
}

// ─── FORM SUBMIT (CREATE) ─────────────────────────────────────────────────────

function bindGuestbookForm() {
  const form = document.getElementById("guestbook_form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = form.querySelector("input[name='name']")?.value || "";
    const alamat = form.querySelector("input[name='alamat']")?.value || "";
    const comment = form.querySelector("textarea[name='comment']")?.value || "";

    if (!name.trim() || !comment.trim()) {
      alert("Nama dan ucapan wajib diisi.");
      return;
    }

    const btn = form.querySelector("[type='submit'], button");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Menyimpan...";
    }

    try {
      await createWish(name, alamat, comment);
      form.reset();
      showToast("Ucapan berhasil dikirim! 💕");
      await renderWishes();
    } catch (err) {
      alert("Gagal menyimpan ucapan: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Kirim";
      }
    }
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

function formatWishDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function showToast(message) {
  let toast = document.getElementById("wishes-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "wishes-toast";
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      background: #333; color: #fff; padding: 12px 20px;
      border-radius: 8px; font-size: 14px; opacity: 0;
      transition: opacity 0.3s ease; max-width: 280px;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async function () {
  await renderWishes();
  bindGuestbookForm();
});
