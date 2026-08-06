document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cek Sesi Login
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    
    // Tampilkan Profil Header & Batasi Akses Tombol
    if (typeof applyRolePermissions === 'function') applyRolePermissions(session);
    if (typeof renderUserProfileHeader === 'function') renderUserProfileHeader(session);

    // 2. Setup Elemen Filter
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');

    // Set tanggal hari ini jika kosong
    if (inputTanggal && !inputTanggal.value) {
        inputTanggal.value = new Date().toISOString().split('T')[0];
    }

    // Jika Wali Kelas, otomatis kunci dropdown ke kelas bimbingannya
    if (session.role === 'wali_kelas' && session.kelasBimbingan && selectKelas) {
        selectKelas.value = session.kelasBimbingan;
        selectKelas.disabled = true;
    }

    // 3. Event Listener untuk perubahan kelas / tanggal
    if (selectKelas) {
        selectKelas.addEventListener('change', () => muatTabelAbsensi());
    }
    if (inputTanggal) {
        inputTanggal.addEventListener('change', () => muatTabelAbsensi());
    }

    // 4. Jalankan langsung saat halaman dibuka untuk mengisi tabel
    await muatTabelAbsensi();
});

// =========================================================================
// FUNGSI UTAMA MEMUAT & MENAMPILKAN DATA ABSENSI (DENGAN LANGKAH 3)
// =========================================================================
async function muatTabelAbsensi() {
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');
    const tbody = document.getElementById('tbodyAbsensi') || document.querySelector('#tabelAbsensi tbody') || document.querySelector('table tbody');

    if (!tbody) return;

    // Ambil nilai kelas yang dipilih dari dropdown
    let kelasTerpilih = selectKelas ? selectKelas.value.trim() : '';

    // -------------------------------------------------------------
    // LANGKAH 3: PENCARIAN DATA SISWA 3 LAPIS (PASTI KETEMU DATA)
    // -------------------------------------------------------------
    let allSiswa = [];

    // Lapis 1: Ambil dari IndexedDB
    if (typeof getAllData === 'function') {
        allSiswa = await getAllData('siswa').catch(() => []);
    }

    // Lapis 2: Jika IndexedDB kosong, ambil dari LocalStorage (Hasil Tarik Data)
    if ((!allSiswa || allSiswa.length === 0)) {
        const cache = localStorage.getItem('sigma_cache_siswa');
        if (cache) {
            try { allSiswa = JSON.parse(cache); } catch(e){}
        }
    }

    // Lapis 3: Jika masih kosong, ambil dari variabel master js (window.dbSiswa / window.dataSiswa)
    if ((!allSiswa || allSiswa.length === 0)) {
        if (typeof window.dbSiswa !== 'undefined') allSiswa = window.dbSiswa;
        else if (typeof window.dataSiswa !== 'undefined') allSiswa = window.dataSiswa;
    }
    // -------------------------------------------------------------

    // Filter Siswa berdasarkan Kelas yang Dipilih
    let siswaFiltered = allSiswa;

    if (kelasTerpilih) {
        siswaFiltered = allSiswa.filter(s => {
            const kSiswa = (s.kelas || s.kelasSiswa || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            const kTarget = kelasTerpilih.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Pengujian fleksibel penulisan kelas (contoh: "kelas7" == "7" atau "7a")
            return kSiswa === kTarget || kSiswa.includes(kTarget) || kTarget.includes(kSiswa);
        });
    }

    // JIKA DATA SISWA SAMA SEKALI TIDAK ADA
    if (!siswaFiltered || siswaFiltered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Belum ada data siswa untuk kelas <strong>"${kelasTerpilih || 'pilihan'}"</strong>.<br>
                    <small class="text-secondary">Silakan klik tombol <strong>"Tarik Data Siswa"</strong> (Login sebagai Admin) untuk menyinkronkan data.</small>
                </td>
            </tr>`;
        updateRekap(0, 0, 0, 0);
        return;
    }

    // AMBIL DATA ABSENSI TERPINDAH HARI INI (Jika sudah pernah tersimpan)
    const tgl = inputTanggal ? inputTanggal.value : new Date().toISOString().split('T')[0];
    let dataAbsenTersimpan = [];
    if (typeof getAllData === 'function') {
        const allAbsen = await getAllData('absensi').catch(() => []);
        dataAbsenTersimpan = allAbsen.filter(a => a.tanggal === tgl);
    }

    // RENDER BARIS TABEL SISWA (BUKA BLOCKING)
    tbody.innerHTML = siswaFiltered.map((siswa, index) => {
        const nisn = siswa.nisn || siswa.nis || '-';
        const nama = siswa.nama || siswa.namaSiswa || 'Tanpa Nama';
        
        // Cek status absen siswa jika pernah disimpan
        const record = dataAbsenTersimpan.find(a => (a.nisn && a.nisn === nisn) || a.nama === nama) || {};
        const status = record.status || 'H'; // Default: Hadir (H)

        return `
            <tr>
                <td class="text-center align-middle">${index + 1}</td>
                <td class="align-middle">${nisn}</td>
                <td class="align-middle"><strong>${nama}</strong></td>
                <td class="text-center align-middle">
                    <div class="btn-group btn-group-sm" role="group" data-nisn="${nisn}" data-nama="${nama}">
                        <input type="radio" class="btn-check" name="absen_${index}" id="h_${index}" value="H" ${status === 'H' ? 'checked' : ''} onchange="hitungRekapOtomatis()">
                        <label class="btn btn-outline-success" for="h_${index}">H</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="s_${index}" value="S" ${status === 'S' ? 'checked' : ''} onchange="hitungRekapOtomatis()">
                        <label class="btn btn-outline-warning" for="s_${index}">S</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="i_${index}" value="I" ${status === 'I' ? 'checked' : ''} onchange="hitungRekapOtomatis()">
                        <label class="btn btn-outline-info" for="i_${index}">I</label>

                        <input type="radio" class="btn-check" name="absen_${index}" id="a_${index}" value="A" ${status === 'A' ? 'checked' : ''} onchange="hitungRekapOtomatis()">
                        <label class="btn btn-outline-danger" for="a_${index}">A</label>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Hitung ringkasan status di atas
    hitungRekapOtomatis();
}

// =========================================================================
// LANGKAH 2: FUNGSI TARIK DATA MASTER (DILAKUKAN OLEH ADMIN)
// =========================================================================
async function tarikDataMasterSiswa() {
    const btn = document.getElementById('btnTarikData');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Menarik Data...`;
    }

    try {
        let sourceSiswa = [];
        
        // Ambil data dari variabel global (db.js)
        if (typeof window.dbSiswa !== 'undefined' && Array.isArray(window.dbSiswa)) {
            sourceSiswa = window.dbSiswa;
        } else if (typeof window.dataSiswa !== 'undefined' && Array.isArray(window.dataSiswa)) {
            sourceSiswa = window.dataSiswa;
        }

        // Simpan ke IndexedDB
        if (typeof saveData === 'function') {
            for (const siswa of sourceSiswa) {
                await saveData('siswa', siswa).catch(() => {});
            }
        }

        // Simpan juga ke LocalStorage sebagai cadangan instan
        if (sourceSiswa.length > 0) {
            localStorage.setItem('sigma_cache_siswa', JSON.stringify(sourceSiswa));
        }

        alert(`Berhasil menarik ${sourceSiswa.length} data siswa ke database browser!`);
        
        // Muat ulang tabel
        await muatTabelAbsensi();

    } catch (err) {
        console.error(err);
        alert("Gagal menarik data: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-cloud-arrow-down-fill me-1"></i> Tarik Data Siswa`;
        }
    }
}

// =========================================================================
// FUNGSI HITUNG REKAP & COUNTER ATAS
// =========================================================================
function hitungRekapOtomatis() {
    const listRadioChecked = document.querySelectorAll('table tbody input[type="radio"]:checked');
    let h = 0, s = 0, i = 0, a = 0;

    listRadioChecked.forEach(radio => {
        if (radio.value === 'H') h++;
        if (radio.value === 'S') s++;
        if (radio.value === 'I') i++;
        if (radio.value === 'A') a++;
    });

    updateRekap(h, s, i, a);
}

function updateRekap(h, s, i, a) {
    document.querySelectorAll('.row .fw-bold, .card-body').forEach(box => {
        if (box.textContent.includes('Hadir:')) box.innerHTML = `Hadir: <strong>${h}</strong>`;
        if (box.textContent.includes('Sakit:')) box.innerHTML = `Sakit: <strong>${s}</strong>`;
        if (box.textContent.includes('Izin:')) box.innerHTML = `Izin: <strong>${i}</strong>`;
        if (box.textContent.includes('Alfa:')) box.innerHTML = `Alfa: <strong>${a}</strong>`;
    });
}
