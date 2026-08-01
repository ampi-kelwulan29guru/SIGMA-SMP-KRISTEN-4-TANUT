// Jalankan pembacaan data guru saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadGuru);

// Fungsi untuk membaca data dari database (db.js) dan menampilkannya di tabel
async function loadGuru() {
    const tbody = document.getElementById('tabelGuru');
    if (!tbody) return;

    try {
        // Ambil data guru dari IndexedDB
        const listGuru = await getAllData('guru') || [];
        tbody.innerHTML = '';

        // Tampilan jika data masih kosong
        if (listGuru.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data guru tersimpan. Klik tombol <strong>Tambah Guru Baru</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        // Tampilkan setiap item data guru ke dalam baris tabel
        listGuru.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td class="ps-3 fw-bold text-secondary">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border">${item.nip || '-'}</span></td>
                    <td class="fw-bold text-dark">${item.nama || '-'}</td>
                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${item.jabatan || 'Guru'}</span></td>
                    <td>${item.hp ? `<a href="https://wa.me/${formatWA(item.hp)}" target="_blank" class="text-decoration-none text-success fw-semibold"><i class="bi bi-whatsapp me-1"></i>${item.hp}</a>` : '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" onclick="hapusGuru(${item.id})">
                            <i class="bi bi-trash me-1"></i>Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat data guru:", error);
    }
}

// Format nomor WhatsApp agar otomatis bisa diklik
function formatWA(number) {
    let cleaned = ('' + number).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
}

// Tangani Event Submit Form Modal Tambah Guru
const formGuru = document.getElementById('formGuru');
if (formGuru) {
    formGuru.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil nilai input dari formulir modal
        const dataBaru = {
            nip: document.getElementById('nip').value.trim(),
            nama: document.getElementById('nama').value.trim(),
            jabatan: document.getElementById('jabatan').value,
            hp: document.getElementById('hp').value.trim()
        };

        try {
            // Simpan ke IndexedDB menggunakan fungsi addData() dari db.js
            await addData('guru', dataBaru);

            // Bersihkan form input
            formGuru.reset();

            // Sembunyikan modal pop-up secara otomatis
            const modalElement = document.getElementById('modalGuru');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Muat ulang isi tabel secara instan
            loadGuru();

        } catch (err) {
            alert("Gagal menyimpan data guru: " + err);
        }
    });
}

// Fungsi Hapus Data Guru berdasarkan ID
async function hapusGuru(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
        await deleteData('guru', id);
        loadGuru(); // Refresh tabel setelah hapus
    }
}
