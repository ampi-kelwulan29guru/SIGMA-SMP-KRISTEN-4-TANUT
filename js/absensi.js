document.addEventListener('DOMContentLoaded', async () => {
    // Set tanggal hari ini sebagai default
    const inputTanggal = document.getElementById('filterTanggal');
    if (inputTanggal) {
        inputTanggal.value = new Date().toISOString().split('T')[0];
    }

    await populasiDropdownKelasAndMapel();
});

// Fungsi memuat opsi Dropdown Kelas & Mapel otomatis dari IndexedDB
async function populasiDropdownKelasAndMapel() {
    // Opsi Kelas
    const selectKelas = document.getElementById('filterKelas');
    if (selectKelas) {
        let listKelas = await getAllData('kelas').catch(() => []);
        if (!listKelas || listKelas.length === 0) listKelas = await getAllData('data_kelas').catch(() => []);

        selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        listKelas.forEach(k => {
            const namaKelas = k.nama || k.namaKelas || k.kelas;
            selectKelas.innerHTML += `<option value="${namaKelas}">${namaKelas}</option>`;
        });
    }

    // Opsi Mapel
    const selectMapel = document.getElementById('filterMapel');
    if (selectMapel) {
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) listMapel = await getAllData('data_mapel').catch(() => []);

        selectMapel.innerHTML = '<option value="">-- Pilih Mapel --</option>';
        listMapel.forEach(m => {
            const namaMapel = m.nama || m.namaMapel;
            selectMapel.innerHTML += `<option value="${namaMapel}">${namaMapel}</option>`;
        });
    }
}

// Function menampilkan siswa untuk diabsen
async function muatDaftarSiswaAbsensi() {
    const kelasSelected = document.getElementById('filterKelas').value;
    const tbody = document.getElementById('tabelAbsensi');
    const areaSimpan = document.getElementById('areaSimpanAbsensi');

    if (!kelasSelected) {
        alert('Silakan pilih kelas terlebih dahulu!');
        return;
    }

    try {
        let listSiswa = await getAllData('siswa').catch(() => []);
        if (!listSiswa || listSiswa.length === 0) listSiswa = await getAllData('data_siswa').catch(() => []);

        // Filter siswa berdasarkan kelas jika ada properti kelas
        const siswaFiltered = listSiswa.filter(s => !s.kelas || s.kelas === kelasSelected);

        tbody.innerHTML = '';

        if (siswaFiltered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        Tidak ada siswa pada kelas ${kelasSelected}.
                    </td>
                </tr>`;
            areaSimpan.style.display = 'none';
            return;
        }

        siswaFiltered.forEach((siswa, idx) => {
            const nisn = siswa.nisn || '-';
            const nama = siswa.nama || siswa.namaSiswa || '-';

            tbody.innerHTML += `
                <tr data-id="${siswa.id}">
                    <td class="text-center fw-bold text-secondary">${idx + 1}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${nisn}</span></td>
                    <td class="fw-bold text-dark">${nama}</td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm w-100" role="group">
                            <input type="radio" class="btn-check" name="status_${siswa.id}" id="h_${siswa.id}" value="Hadir" checked>
                            <label class="btn btn-outline-success" for="h_${siswa.id}">Hadir</label>

                            <input type="radio" class="btn-check" name="status_${siswa.id}" id="i_${siswa.id}" value="Izin">
                            <label class="btn btn-outline-info" for="i_${siswa.id}">Izin</label>

                            <input type="radio" class="btn-check" name="status_${siswa.id}" id="s_${siswa.id}" value="Sakit">
                            <label class="btn btn-outline-warning" for="s_${siswa.id}">Sakit</label>

                            <input type="radio" class="btn-check" name="status_${siswa.id}" id="a_${siswa.id}" value="Alfa">
                            <label class="btn btn-outline-danger" for="a_${siswa.id}">Alfa</label>
                        </div>
                    </td>
                </tr>
            `;
        });

        areaSimpan.style.display = 'block';

    } catch (err) {
        console.error("Gagal memuat siswa absensi:", err);
    }
}

// Set semua radio button menjadi status yang dipilih
function setSemuaStatus(status) {
    const radios = document.querySelectorAll(`input[value="${status}"]`);
    radios.forEach(r => r.checked = true);
}

// Simpan data absensi ke IndexedDB
async function simpanAbsensi() {
    const tanggal = document.getElementById('filterTanggal').value;
    const kelas = document.getElementById('filterKelas').value;
    const mapel = document.getElementById('filterMapel').value;

    const rows = document.querySelectorAll('#tabelAbsensi tr');
    let rekapAbsensi = [];

    rows.forEach(row => {
        const idSiswa = row.getAttribute('data-id');
        if (idSiswa) {
            const statusChecked = document.querySelector(`input[name="status_${idSiswa}"]:checked`);
            if (statusChecked) {
                rekapAbsensi.push({
                    siswaId: idSiswa,
                    status: statusChecked.value
                });
            }
        }
    });

    const dataAbsen = {
        tanggal,
        kelas,
        mapel,
        detail: rekapAbsensi,
        createdAt: new Date().toISOString()
    };

    try {
        await addData('absensi', dataAbsen).catch(() => addData('data_absensi', dataAbsen));
        alert('Data absensi berhasil disimpan!');
    } catch (e) {
        alert('Gagal menyimpan absensi: ' + e);
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
