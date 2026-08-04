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
document.addEventListener('DOMContentLoaded', async () => {
    await initKelasDropdownFilter();
});

// 1. Memuat daftar kelas sesuai dengan Hak Akses / Role Pengguna
async function initKelasDropdownFilter() {
    const selectFilter = document.getElementById('selectKelasFilter');
    if (!selectFilter) return;

    const session = JSON.parse(localStorage.getItem('sigma_session'));
    if (!session) return;

    // Ambil semua master data kelas dari Database / IndexedDB
    let listKelas = [];
    if (typeof getAllData === 'function') {
        listKelas = await getAllData('kelas').catch(() => []);
    }

    // Bersihkan opsi lama
    selectFilter.innerHTML = '<option value="" disabled selected>-- Pilih Kelas --</option>';

    // Jika pengguna adalah WALI KELAS, kunci/prioritaskan kelas bimbingannya
    if (session.role === 'wali_kelas' && session.kelasBimbingan) {
        const option = document.createElement('option');
        option.value = session.kelasBimbingan;
        option.textContent = `Kelas ${session.kelasBimbingan} (Kelas Anda)`;
        selectFilter.appendChild(option);
        
        // Pilih otomatis kelas bimbingan wali kelas
        selectFilter.value = session.kelasBimbingan;
        onKelasFilterChange(); 
        return;
    }

    // Jika ADMIN atau GURU MAPEL, tampilkan seluruh daftar kelas yang ada
    if (listKelas.length > 0) {
        listKelas.forEach(k => {
            const namaKelas = k.namaKelas || k.nama || k;
            const option = document.createElement('option');
            option.value = namaKelas;
            option.textContent = `Kelas ${namaKelas}`;
            selectFilter.appendChild(option);
        });
    } else {
        // Fallback jika belum ada data kelas master
        ['7A', '7B', '8A', '8B', '9A', '9B'].forEach(k => {
            const option = document.createElement('option');
            option.value = k;
            option.textContent = `Kelas ${k}`;
            selectFilter.appendChild(option);
        });
    }
}

// 2. Trigger ketika Pilihan Kelas Berubah
function onKelasFilterChange() {
    const selectFilter = document.getElementById('selectKelasFilter');
    const selectedKelas = selectFilter.value;

    const labelInfo = document.getElementById('labelInfoKelas');
    const namaKelasAktif = document.getElementById('namaKelasAktif');

    if (labelInfo && namaKelasAktif) {
        labelInfo.classList.remove('d-none');
        namaKelasAktif.textContent = selectedKelas;
    }

    // Panggil fungsi muat/filter data spesifik halaman
    if (typeof loadDataByKelas === 'function') {
        loadDataByKelas(selectedKelas);
    }
}

// 3. Contoh Fungsi Memuat Data Spesifik per Kelas (Siswa/Absensi/Jurnal/Nilai)
async function loadDataByKelas(kelas) {
    console.log(`Memuat data untuk Kelas: ${kelas}`);

    // Contoh pengambilan data siswa berdasarkan kelas yang dipilih
    let listSiswa = [];
    if (typeof getAllData === 'function') {
        const allSiswa = await getAllData('siswa').catch(() => []);
        listSiswa = allSiswa.filter(s => s.kelas === kelas || s.kelasSiswa === kelas);
    }

    // Tampilkan data ke tabel sesuai modul (Absensi / Jurnal / Nilai)
    renderTableByKelas(listSiswa, kelas);
}
