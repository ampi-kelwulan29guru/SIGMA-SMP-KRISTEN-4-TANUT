// Jalankan pembacaan data siswa saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', loadSiswa);

// Fungsi untuk membaca data siswa dari IndexedDB dan menampilkannya di tabel
async function loadSiswa() {
    const tbody = document.getElementById('tabelSiswa');
    if (!tbody) return;

    try {
        // Ambil data siswa dari IndexedDB (db.js)
        const listSiswa = await getAllData('siswa') || [];
        tbody.innerHTML = '';

        // Tampilan jika data masih kosong
        if (listSiswa.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data siswa tersimpan. Klik tombol <strong>+ Tambah Siswa Baru</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        // Render baris data siswa ke tabel
        listSiswa.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${item.nisn || '-'}</span></td>
                    <td class="fw-bold text-dark">${item.nama || '-'}</td>
                    <td><span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill">${item.kelas || '-'}</span></td>
                    <td>${item.gender || '-'}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0 rounded-2 px-2" onclick="hapusSiswa(${item.id})" title="Hapus">
                            <i class="bi bi-trash-fill fs-6"></i> Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Gagal memuat data siswa:", error);
    }
}

// Tangani Event Submit Form Modal Tambah Siswa
const formSiswa = document.getElementById('formSiswa');
if (formSiswa) {
    formSiswa.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil data dari form modal
        const dataBaru = {
            nisn: document.getElementById('inputNisn').value.trim(),
            nama: document.getElementById('inputNama').value.trim(),
            kelas: document.getElementById('inputKelas').value,
            gender: document.getElementById('inputGender').value
        };

        try {
            // Simpan ke IndexedDB
            await addData('siswa', dataBaru);

            // Bersihkan form
            formSiswa.reset();

            // Sembunyikan modal pop-up
            const modalElement = document.getElementById('modalTambahSiswa');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            // Muat ulang tabel
            loadSiswa();

        } catch (err) {
            alert("Gagal menyimpan data siswa: " + err);
        }
    });
}

// Fungsi Hapus Data Siswa berdasarkan ID
async function hapusSiswa(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        await deleteData('siswa', id);
        loadSiswa(); // Refresh tabel
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
