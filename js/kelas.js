// Jalankan pembacaan data kelas saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadKelas);

// Fungsi membaca data kelas dari IndexedDB
async function loadKelas() {
    const tbody = document.getElementById('tabelKelas');
    if (!tbody) return;

    try {
        const listKelas = await getAllData('kelas') || [];
        tbody.innerHTML = '';

        if (listKelas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data kelas tersimpan. Klik tombol <strong>+ Tambah Kelas Baru</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        listKelas.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary">${index + 1}</td>
                    <td><span class="badge bg-warning bg-opacity-20 text-dark fw-bold px-3 py-1 rounded-pill border border-warning">${item.namaKelas || '-'}</span></td>
                    <td class="fw-bold text-dark">${item.waliKelas || '-'}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${item.ruangan || '-'}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0 rounded-2 px-2" onclick="hapusKelas(${item.id})" title="Hapus">
                            <i class="bi bi-trash-fill fs-6"></i> Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat data kelas:", error);
    }
}

// Tangani Submit Form Modal Tambah Kelas
const formKelas = document.getElementById('formKelas');
if (formKelas) {
    formKelas.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataBaru = {
            namaKelas: document.getElementById('inputNamaKelas').value.trim(),
            waliKelas: document.getElementById('inputWaliKelas').value.trim(),
            ruangan: document.getElementById('inputRuangan').value.trim()
        };

        try {
            await addData('kelas', dataBaru);

            formKelas.reset();

            const modalElement = document.getElementById('modalTambahKelas');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            loadKelas();

        } catch (err) {
            alert("Gagal menyimpan data kelas: " + err);
        }
    });
}

// Fungsi Hapus Data Kelas
async function hapusKelas(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
        await deleteData('kelas', id);
        loadKelas();
    }
}
