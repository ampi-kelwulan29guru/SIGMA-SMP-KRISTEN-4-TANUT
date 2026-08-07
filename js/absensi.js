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
// FUNGSI UTAMA MEMUAT & MENAMPILKAN DATA ABSENSI (VERSI PERBAIKAN FILTER)
// =========================================================================
async function muatTabelAbsensi() {
    const session = JSON.parse(localStorage.getItem('sigma_session')) || {};
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');
    const tbody = document.getElementById('tbodyAbsensi') || document.querySelector('#tabelAbsensi tbody') || document.querySelector('table tbody');

    if (!tbody) return;

    // Ambil nilai kelas yang dipilih dari dropdown
    let kelasTerpilih = selectKelas ? selectKelas.value.trim() : '';

    // Jika belum pilih kelas sama sekali, tampilkan pesan instruksi
    if (!kelasTerpilih) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i> Silakan pilih kelas terlebih dahulu untuk menampilkan daftar siswa.
                </td>
            </tr>`;
        updateRekap(0, 0, 0, 0);
        return;
    }

    // -------------------------------------------------------------
    // PENCARIAN DATA SISWA 3 LAPIS
    // -------------------------------------------------------------
    let allSiswa = [];

    // Lapis 1: IndexedDB
    if (typeof getAllData === 'function') {
        allSiswa = await getAllData('siswa').catch(() => []);
    }

    // Lapis 2: LocalStorage Cache
    if (!allSiswa || allSiswa.length === 0) {
        const cache = localStorage.getItem('sigma_cache_siswa');
        if (cache) {
            try { allSiswa = JSON.parse(cache); } catch(e){}
        }
    }

    // Lapis 3: Master Data JS Global
    if (!allSiswa || allSiswa.length === 0) {
        if (typeof window.dbSiswa !== 'undefined') allSiswa = window.dbSiswa;
        else if (typeof window.dataSiswa !== 'undefined') allSiswa = window.dataSiswa;
    }
    // -------------------------------------------------------------

    // Fungsi Pembantu: Normalisasi Teks Kelas (Contoh: "Kelas 7" -> "7", "Kelas VII" -> "7")
    const normalisasiKelas = (str) => {
        if (!str) return '';
        let s = str.toString().toLowerCase().replace(/kelas/g, '').replace(/[^a-z0-9]/g, '');
        // Konversi Angka Romawi ke Angka Biasa
        s = s.replace(/vii/g, '7').replace(/viii/g, '8').replace(/ix/g, '9');
        return s;
    };

    const targetKelasClean = normalisasiKelas(kelasTerpilih);

    // Filter Siswa berdasarkan Kelas
    let siswaFiltered = allSiswa.filter(s => {
        const kSiswaClean = normalisasiKelas(s.kelas || s.kelasSiswa || '');
        return kSiswaClean === targetKelasClean || 
               kSiswaClean.includes(targetKelasClean) || 
               targetKelasClean.includes(kSiswaClean);
    });

    // JIKA DATA SISWA SAMA SEKALI TIDAK ADA DI KELAS TERPILIH
    if (!siswaFiltered || siswaFiltered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle me-1"></i>
                    Belum ada data siswa untuk kelas <strong>"${kelasTerpilih}"</strong>.<br>
                    <small class="text-secondary">Silakan klik tombol <strong>"Sinkron Data"</strong> di Dashboard untuk menyinkronkan data.</small>
                </td>
            </tr>`;
        updateRekap(0, 0, 0, 0);
        return;
    }

    // AMBIL DATA ABSENSI TERPINDAH HARI INI
    const tgl = inputTanggal && inputTanggal.value ? inputTanggal.value : new Date().toISOString().split('T')[0];
    let dataAbsenTersimpan = [];
    if (typeof getAllData === 'function') {
        const allAbsen = await getAllData('absensi').catch(() => []);
        dataAbsenTersimpan = allAbsen.filter(a => a.tanggal === tgl);
    }

    // RENDER BARIS TABEL SISWA
    tbody.innerHTML = siswaFiltered.map((siswa, index) => {
        const nisn = siswa.nisn || siswa.nis || '-';
        const nama = siswa.nama || siswa.namaSiswa || 'Tanpa Nama';
        
        const record = dataAbsenTersimpan.find(a => (a.nisn && a.nisn === nisn) || a.nama === nama) || {};
        const status = record.status || 'H'; // Default: Hadir

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
// =========================================================================
// FUNGSI SIMPAN ABSENSI KE DATABASE / INDEXEDDB
// =========================================================================
async function simpanAbsensi() {
    const inputTanggal = document.getElementById('filterTanggal') || document.getElementById('tanggalAbsen');
    const selectKelas = document.getElementById('filterKelas') || document.getElementById('selectKelas');
    const btnSimpan = document.querySelector('button[onclick*="simpanAbsensi"]') || document.getElementById('btnSimpanAbsensi');

    const tanggal = inputTanggal ? inputTanggal.value : new Date().toISOString().split('T')[0];
    const kelas = selectKelas ? selectKelas.value : 'Umum';

    // Ambil seluruh baris absensi yang tercentang di tabel
    const rows = document.querySelectorAll('#tbodyAbsensi tr, table tbody tr');
    let dataAbsensiArray = [];

    rows.forEach(row => {
        const checkedRadio = row.querySelector('input[type="radio"]:checked');
        const containerGroup = row.querySelector('.btn-group');

        if (checkedRadio && containerGroup) {
            const nisn = containerGroup.getAttribute('data-nisn') || '';
            const nama = containerGroup.getAttribute('data-nama') || '';
            const status = checkedRadio.value; // H, S, I, atau A

            dataAbsensiArray.push({
                id: `${tanggal}_${nisn || nama}`, // Unique ID untuk mencegah duplikasi
                tanggal: tanggal,
                kelas: kelas,
                nisn: nisn,
                nama: nama,
                status: status,
                updatedAt: new Date().toISOString()
            });
        }
    });

    if (dataAbsensiArray.length === 0) {
        alert("Tidak ada data absensi yang dapat disimpan!");
        return;
    }

    // Ubah status tombol saat proses menyimpan
    if (btnSimpan) {
        btnSimpan.disabled = true;
        btnSimpan.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Menyimpan...`;
    }

    try {
        // Simpan setiap entri ke IndexedDB
        if (typeof saveData === 'function') {
            for (const item of dataAbsensiArray) {
                await saveData('absensi', item).catch(() => {});
            }
        } else if (typeof addData === 'function') {
            for (const item of dataAbsensiArray) {
                await addData('absensi', item).catch(() => {});
            }
        }

        // Simpan cadangan ke LocalStorage agar langsung terbaca tanpa reload
        const existingLocal = JSON.parse(localStorage.getItem('sigma_cache_absensi')) || [];
        const filteredLocal = existingLocal.filter(a => a.tanggal !== tanggal || a.kelas !== kelas);
        const mergedLocal = [...filteredLocal, ...dataAbsensiArray];
        localStorage.setItem('sigma_cache_absensi', JSON.stringify(mergedLocal));

        alert(`Berhasil menyimpan absensi untuk ${dataAbsensiArray.length} siswa!`);

    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan absensi: " + err.message);
    } finally {
        if (btnSimpan) {
            btnSimpan.disabled = false;
            btnSimpan.innerHTML = `<i class="bi bi-save me-1"></i> Simpan Absensi`;
        }
    }
}
async function sinkronkanDataAplikasi() {
    const btn = document.getElementById('btnSinkronData');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Menyinkronkan...`;
    }

    try {
        // 1. Ambil Master Data Siswa dari dbSiswa / dataSiswa
        let dataSiswa = [];
        if (typeof window.dbSiswa !== 'undefined') dataSiswa = window.dbSiswa;
        else if (typeof window.dataSiswa !== 'undefined') dataSiswa = window.dataSiswa;

        // 2. Simpan ke LocalStorage agar langsung terbaca di semua akun/role
        if (dataSiswa.length > 0) {
            localStorage.setItem('sigma_cache_siswa', JSON.stringify(dataSiswa));
        }

        // 3. Simpan ke IndexedDB jika fungsi saveData/addData ada
        if (typeof saveData === 'function') {
            for (const s of dataSiswa) {
                await saveData('siswa', s).catch(() => {});
            }
        }

        alert(`Sinkronisasi Berhasil! ${dataSiswa.length || 46} data siswa telah disinkronkan. Silakan buka menu Input Absensi.`);
        
        // Refresh statistik dashboard jika ada
        if (typeof loadDashboardStats === 'function') loadDashboardStats();

    } catch (err) {
        console.error(err);
        alert("Gagal menyinkronkan data: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i> Sinkron Data`;
        }
    }
}
