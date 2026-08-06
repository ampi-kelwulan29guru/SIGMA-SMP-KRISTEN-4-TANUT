// Fungsi Utama Memuat Tabel Absensi
async function loadTabelAbsensi() {
    // 1. Ambil Sesi Pengguna
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    const role = session.role;
    const kelasBimbingan = session.kelasBimbingan || '';

    // 2. Ambil Elemen Filter Kelas & Tanggal (Jika ada di halaman HTML)
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');
    
    let targetKelas = '';

    // Tentukan Kelas yang Akan Ditampilkan:
    if (role === 'wali_kelas') {
        targetKelas = kelasBimbingan;
        if (selectKelas) {
            selectKelas.value = kelasBimbingan;
            selectKelas.disabled = true; // Lock dropdown kelas untuk wali kelas
        }
    } else {
        // Untuk Guru Mapel atau Admin, ambil dari Dropdown Filter Kelas
        targetKelas = selectKelas ? selectKelas.value : '';
    }

    // 3. Ambil Master Data Siswa dari IndexedDB / Storage
    let listSiswa = [];
    if (typeof getAllData === 'function') {
        listSiswa = await getAllData('siswa').catch(() => []);
    } else if (window.dbSiswa) {
        listSiswa = window.dbSiswa;
    }

    // 4. Filter Siswa Berdasarkan Kelas Target
    if (targetKelas) {
        listSiswa = listSiswa.filter(s => {
            const kelasSiswa = (s.kelas || s.kelasSiswa || '').toString().replaceAll(' ', '').toUpperCase();
            const kelasTargetFormatted = targetKelas.toString().replaceAll(' ', '').toUpperCase();
            return kelasSiswa === kelasTargetFormatted;
        });
    }

    // 5. Ambil Data Absensi yang Sudah Tersimpan (Jika ada)
    const tanggalAktif = inputTanggal ? inputTanggal.value : new Date().toISOString().split('T')[0];
    let dataAbsensiTersimpan = [];
    
    if (typeof getAllData === 'function') {
        const allAbsen = await getAllData('absensi').catch(() => []);
        dataAbsensiTersimpan = allAbsen.filter(a => a.tanggal === tanggalAktif);
    }

    // 6. Render Tabel Absensi
    renderTabelAbsensi(listSiswa, dataAbsensiTersimpan);
}

// Fungsi Render Baris Tabel Absensi Ke HTML
function renderTabelAbsensi(listSiswa, dataAbsensi) {
    const tbody = document.getElementById('tbodyAbsensi') || document.querySelector('#tabelAbsensi tbody');
    if (!tbody) return;

    if (!listSiswa || listSiswa.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Silakan pilih kelas terlebih dahulu atau data siswa untuk kelas ini belum ada.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = listSiswa.map((siswa, index) => {
        // Cek status absensi siswa jika sudah pernah diinput sebelumnya
        const absenSiswa = dataAbsensi.find(a => a.nisn === siswa.nisn || a.nama === siswa.nama) || {};
        const status = absenSiswa.status || 'H'; // Default: Hadir (H)

        return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${siswa.nisn || siswa.nis || '-'}</td>
                <td><strong>${siswa.nama || siswa.namaSiswa}</strong></td>
                <td class="text-center">${siswa.kelas || '-'}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <input type="radio" class="btn-check" name="absen_${index}" id="h_${index}" value="H" ${status === 'H' ? 'checked' : ''}>
                        <label class="btn btn-outline-success" for="h_${index}">H</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="i_${index}" value="I" ${status === 'I' ? 'checked' : ''}>
                        <label class="btn btn-outline-info" for="i_${index}">I</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="s_${index}" value="S" ${status === 'S' ? 'checked' : ''}>
                        <label class="btn btn-outline-warning" for="s_${index}">S</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="a_${index}" value="A" ${status === 'A' ? 'checked' : ''}>
                        <label class="btn btn-outline-danger" for="a_${index}">A</label>
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Keterangan..." value="${absenSiswa.keterangan || ''}">
                </td>
            </tr>
        `;
    }).join('');
}

// Event Listener Otomatis Jalankan Saat Filter Kelas / Tanggal Berubah
document.addEventListener('DOMContentLoaded', () => {
    loadTabelAbsensi();

    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');

    if (selectKelas) selectKelas.addEventListener('change', loadTabelAbsensi);
    if (inputTanggal) inputTanggal.addEventListener('change', loadTabelAbsensi);
});
