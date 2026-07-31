document.addEventListener('DOMContentLoaded', loadGuru);

// Fungsi memuat data dari IndexedDB ke tabel
async function loadGuru() {
    const list = await getAllData('guru');
    const tbody = document.getElementById('tabelGuru');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                    Belum ada data guru tersimpan.
                </td>
            </tr>`;
        return;
    }

    list.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td class="ps-3 fw-bold">${index + 1}</td>
                <td><span class="badge bg-light text-dark border">${item.nip}</span></td>
                <td class="fw-bold text-dark">${item.nama}</td>
                <td><span class="badge bg-info text-dark">${item.mapel}</span></td>
                <td>${item.hp ? `<i class="bi bi-whatsapp text-success me-1"></i>${item.hp}` : '-'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusGuru(${item.id})">
                        <i class="bi bi-trash me-1"></i>Hapus
                    </button>
                </td>
            </tr>
        `;
    });
}

// Event listener form tambah guru
const formGuru = document.getElementById('formGuru');
if (formGuru) {
    formGuru.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            nip: document.getElementById('nip').value,
            nama: document.getElementById('nama').value,
            mapel: document.getElementById('mapel').value,
            hp: document.getElementById('hp').value
        };

        await addData('guru', data);
        
        document.getElementById('formGuru').reset();
        
        const modalEl = document.getElementById('modalGuru');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        loadGuru();
    });
}

// Fungsi Hapus Guru
async function hapusGuru(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
        await deleteData('guru', id);
        loadGuru();
    }
}
