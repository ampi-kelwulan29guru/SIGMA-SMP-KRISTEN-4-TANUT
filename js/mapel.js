document.addEventListener('DOMContentLoaded', loadMapel);

async function loadMapel() {
    const tbody = document.getElementById('tabelMapel');
    if (!tbody) return;

    try {
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) {
            listMapel = await getAllData('data_mapel').catch(() => []);
        }

        tbody.innerHTML = '';

        if (!listMapel || listMapel.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data mata pelajaran. Klik tombol <strong>+ Tambah Mapel Baru</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        listMapel.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${item.kode || item.kodeMapel || '-'}</span></td>
                    <td class="fw-bold text-dark">${item.nama || item.namaMapel || '-'}</td>
                    <td><span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-1 rounded-pill">${item.kategori || item.kelompok || 'Wajib'}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0 rounded-2 px-2" onclick="hapusMapel(${item.id})" title="Hapus">
                            <i class="bi bi-trash-fill fs-6"></i> Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat data mapel:", error);
    }
}

const formMapel = document.getElementById('formMapel');
if (formMapel) {
    formMapel.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataBaru = {
            kode: document.getElementById('inputKodeMapel').value.trim(),
            nama: document.getElementById('inputNamaMapel').value.trim(),
            kategori: document.getElementById('selectKategori').value
        };

        try {
            await addData('mapel', dataBaru);
            formMapel.reset();

            const modalElement = document.getElementById('modalTambahMapel');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            loadMapel();
        } catch (err) {
            alert("Gagal menyimpan data mata pelajaran: " + err);
        }
    });
}

async function hapusMapel(id) {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
        await deleteData('mapel', id);
        loadMapel();
    }
}
