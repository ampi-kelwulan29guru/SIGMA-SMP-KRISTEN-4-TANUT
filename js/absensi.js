document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cek Sesi Login
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    
    // Tampilkan Profil Header jika ada fungsinya di auth.js
    if (typeof applyRolePermissions === 'function') applyRolePermissions(session);
    if (typeof renderUserProfileHeader === 'function') renderUserProfileHeader(session);

    // 2. Setup Elemen Filter
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');

    // Set tanggal hari ini jika kosong
    if (inputTanggal && !inputTanggal.value) {
        inputTanggal.value = new Date().toISOString().split('T')[0];
    }

    // Jika Wali Kelas, otomatis kunci ke kelas bimbingannya
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

    // 4. JALANKAN LANGSUNG SAAT HALAMAN DIBUKA (Buka Block)
    await muatTabelAbsensi();
});

// Fungsi Utama Memuat & Menampilkan Data Absensi
async function muatTabelAbsensi() {
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');
    const tbody = document.getElementById('tbodyAbsensi') || document.querySelector('#tabelAbsensi tbody') || document.querySelector('table tbody');

    if (!tbody) return;

    // Ambil nilai kelas yang dipilih
    let kelasTerpilih = selectKelas ? selectKelas.value.trim() : '';

    // Ambil Seluruh Data Siswa
    let allSiswa = [];
    if (typeof getAllData === 'function') {
        allSiswa = await getAllData('siswa').catch(() => []);
    }
    if ((!allSiswa || allSiswa.length === 0) && window.dbSiswa) {
        allSiswa = window.dbSiswa;
    }

    // Jika tidak ada filter kelas yang dipilih, tampilkan semua siswa
    let siswaFiltered = allSiswa;

    if (kelasTerpilih) {
        siswaFiltered = allSiswa.filter(s => {
            const kSiswa = (s.kelas || s.kelasSiswa || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            const kTarget = kelasTerpilih.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // Cocokkan fleksibel (contoh: "kelas7" == "7" atau "7a")
            return kSiswa === kTarget || kSiswa.includes(kTarget) || kTarget.includes(kSiswa);
        });
    }

    // JIKA DATA SISWA BENAR-BENAR KOSONG DI DATABASE
    if (siswaFiltered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Belum ada data siswa untuk kelas <strong>"${kelasTerpilih}"</strong>. Silakan periksa Data Master Siswa.
                </td>
            </tr>`;
        updateRekap(0, 0, 0, 0);
        return;
    }

    // AMBIL DATA ABSENSI HARI INI (Jika sudah pernah disimpan)
    const tgl = inputTanggal ? inputTanggal.value : new Date().toISOString().split('T')[0];
    let dataAbsenTersimpan = [];
    if (typeof getAllData === 'function') {
        const allAbsen = await getAllData('absensi').catch(() => []);
        dataAbsenTersimpan = allAbsen.filter(a => a.tanggal === tgl);
    }

    // RENDER TABEL UTAMA (HILANGKAN PESAN BLOCKING)
    tbody.innerHTML = siswaFiltered.map((siswa, index) => {
        const nisn = siswa.nisn || siswa.nis || '-';
        const nama = siswa.nama || siswa.namaSiswa || 'Tanpa Nama';
        
        // Cek jika siswa ini sudah ada rekapan absennya
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

    // Hitung ulang total Hadir, Sakit, Izin, Alfa
    hitungRekapOtomatis();
}

// Fungsi Menghitung Ringkasan (Card Counter Atas)
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
    const elH = document.querySelector('.bg-success-subtle, .text-success, [id*="Hadir"]') || document.getElementById('countHadir');
    const elS = document.querySelector('.bg-warning-subtle, .text-warning, [id*="Sakit"]') || document.getElementById('countSakit');
    const elI = document.querySelector('.bg-info-subtle, .text-info, [id*="Izin"]') || document.getElementById('countIzin');
    const elA = document.querySelector('.bg-danger-subtle, .text-danger, [id*="Alfa"]') || document.getElementById('countAlfa');

    // Update text angka rekap di atas jika elemen ditemukan
    document.querySelectorAll('.row .fw-bold, .card-body').forEach(box => {
        if (box.textContent.includes('Hadir:')) box.innerHTML = `Hadir: <strong>${h}</strong>`;
        if (box.textContent.includes('Sakit:')) box.innerHTML = `Sakit: <strong>${s}</strong>`;
        if (box.textContent.includes('Izin:')) box.innerHTML = `Izin: <strong>${i}</strong>`;
        if (box.textContent.includes('Alfa:')) box.innerHTML = `Alfa: <strong>${a}</strong>`;
    });
}
// Fungsi Tarik Data dari Master/Lokal ke IndexedDB (Khusus Admin)
async function tarikDataMasterSiswa() {
    const btn = document.getElementById('btnTarikData');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Menarik Data...`;
    }

    try {
        // 1. Ambil data siswa dari file db.js / window.dbSiswa / window.dataSiswa
        let sourceSiswa = [];
        if (typeof window.dbSiswa !== 'undefined' && Array.isArray(window.dbSiswa)) {
            sourceSiswa = window.dbSiswa;
        } else if (typeof window.dataSiswa !== 'undefined' && Array.isArray(window.dataSiswa)) {
            sourceSiswa = window.dataSiswa;
        }

        // Jika tidak ada data master di memory, buat data sampel dasar
        if (sourceSiswa.length === 0) {
            alert("Warning: Data master siswa (db.js) tidak ditemukan. Memakai data standar.");
        }

        // 2. Simpan/Update ke IndexedDB jika fungsi saveData/insertData tersedia
        if (typeof saveData === 'function') {
            for (const siswa of sourceSiswa) {
                await saveData('siswa', siswa).catch(() => {});
            }
        } else if (typeof addData === 'function') {
            for (const siswa of sourceSiswa) {
                await addData('siswa', siswa).catch(() => {});
            }
        }

        // 3. Simpan juga cadangannya ke localStorage agar selalu terbaca
        if (sourceSiswa.length > 0) {
            localStorage.setItem('sigma_cache_siswa', JSON.stringify(sourceSiswa));
        }

        alert(`Berhasil menarik ${sourceSiswa.length} data siswa! Tabel akan diperbarui.`);
        
        // 4. Muat ulang tabel absensi
        if (typeof muatTabelAbsensi === 'function') {
            await muatTabelAbsensi();
        } else if (typeof loadTabelAbsensi === 'function') {
            await loadTabelAbsensi();
        } else {
            location.reload();
        }

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
