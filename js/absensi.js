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
