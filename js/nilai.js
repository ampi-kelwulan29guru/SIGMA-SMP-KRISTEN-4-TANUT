let globalSiswaList = [];

document.addEventListener('DOMContentLoaded', async () => {
    await populasiDropdownNilai();
    await loadNilai();
});

// Populasikan Dropdown Kelas dan Mapel
async function populasiDropdownNilai() {
    // Load Kelas
    const selectKelas = document.getElementById('selectKelasNilai');
    if (selectKelas) {
        let listKelas = await getAllData('kelas').catch(() => []);
        if (!listKelas || listKelas.length === 0) listKelas = await getAllData('data_kelas').catch(() => []);

        selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        listKelas.forEach(k => {
            const nama = k.nama || k.namaKelas || k.kelas;
            selectKelas.innerHTML += `<option value="${nama}">${nama}</option>`;
        });
    }

    // Load Mapel
    const selectMapel = document.getElementById('selectMapelNilai');
    if (selectMapel) {
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) listMapel = await getAllData('data_mapel').catch(() => []);

        selectMapel.innerHTML = '<option value="">-- Pilih Mapel --</option>';
        listMapel.forEach(m => {
            const nama = m.nama || m.namaMapel;
            selectMapel.innerHTML += `<option value="${nama}">${nama}</option>`;
        });
    }

    // Load Data Siswa global untuk disaring per kelas
    globalSiswaList = await getAllData('siswa').catch(() => []);
    if (!globalSiswaList || globalSiswaList.length === 0) {
        globalSiswaList = await getAllData('data_siswa').catch(() => []);
    }
}

// Filter Siswa berdasarkan Kelas yang dipilih
function filterSiswaByKelas() {
    const kelasTerpilih = document.getElementById('selectKelasNilai').value;
    const selectSiswa = document.getElementById('selectSiswaNilai');
    if (!selectSiswa) return;

    selectSiswa.innerHTML = '<option value="">-- Pilih Siswa --</option>';

    if (!kelasTerpilih) {
        selectSiswa.innerHTML = '<option value="">-- Pilih Kelas Terlebih Dahulu --</option>';
        return;
    }

    const filtered = globalSiswaList.filter(s => {
        const k = s.kelas || s.namaKelas || '';
        return k.toString().toLowerCase() === kelasTerpilih.toString().toLowerCase();
    });

    if (filtered.length === 0) {
        selectSiswa.innerHTML = '<option value="">-- Tidak Ada Siswa di Kelas Ini --</option>';
        return;
    }

    filtered.forEach(s => {
        const nama = s.nama || s.namaSiswa || '-';
        const nisn = s.nisn || s.nis || '';
        selectSiswa.innerHTML += `<option value="${nama}" data-nisn="${nisn}">${nama} ${nisn ? '(' + nisn + ')' : ''}</option>`;
    });
}

// Memuat data Nilai ke Tabel
async function loadNilai() {
    const tbody = document.getElementById('tabelNilai');
    if (!tbody) return;

    try {
        let listNilai = await getAllData('nilai').catch(() => []);
        if (!listNilai || listNilai.length === 0) {
            listNilai = await getAllData('data_nilai').catch(() => []);
        }

        tbody.innerHTML = '';

        if (!listNilai || listNilai.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data nilai. Klik tombol <strong>+ Input Nilai Baru</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        listNilai.reverse();

        listNilai.forEach((item, index) => {
            const na = parseFloat(item.nilaiAkhir || 0).toFixed(1);
            let predikatBadge = '<span class="badge bg-danger">D</span>';
            if (na >= 90) predikatBadge = '<span class="badge bg-success">A (Sangat Baik)</span>';
            else if (na >= 80) predikatBadge = '<span class="badge bg-primary">B (Baik)</span>';
            else if (na >= 70) predikatBadge = '<span class="badge bg-warning text-dark">C (Cukup)</span>';

            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary">${index + 1}</td>
                    <td>
                        <strong class="text-dark d-block">${item.siswa || '-'}</strong>
                        <small class="text-muted">NISN: ${item.nisn || '-'}</small>
                    </td>
                    <td><span class="badge bg-light text-dark border">${item.kelas || '-'}</span></td>
                    <td class="fw-semibold text-dark">${item.mapel || '-'}</td>
                    <td class="text-center font-monospace">${item.tugas || 0}</td>
                    <td class="text-center font-monospace">${item.pts || 0}</td>
                    <td class="text-center font-monospace">${item.pas || 0}</td>
                    <td class="text-center fw-bold text-primary font-monospace" style="font-size: 14px;">${na}</td>
                    <td class="text-center">${predikatBadge}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0 rounded-2 px-2" onclick="hapusNilai(${item.id})" title="Hapus">
                            <i class="bi bi-trash-fill fs-6"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal memuat nilai:", err);
    }
}

// Handler Submit Form Nilai
const formNilai = document.getElementById('formNilai');
if (formNilai) {
    formNilai.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectSiswa = document.getElementById('selectSiswaNilai');
        const selectedOption = selectSiswa.options[selectSiswa.selectedIndex];
        const nisn = selectedOption ? selectedOption.getAttribute('data-nisn') : '';

        const tugas = parseFloat(document.getElementById('inputTugas').value) || 0;
        const pts = parseFloat(document.getElementById('inputPTS').value) || 0;
        const pas = parseFloat(document.getElementById('inputPAS').value) || 0;

        // Formula Nilai Akhir: 40% Tugas + 30% PTS + 30% PAS
        const nilaiAkhir = (tugas * 0.4) + (pts * 0.3) + (pas * 0.3);

        const dataBaru = {
            kelas: document.getElementById('selectKelasNilai').value,
            mapel: document.getElementById('selectMapelNilai').value,
            siswa: selectSiswa.value,
            nisn: nisn || '-',
            tugas: tugas,
            pts: pts,
            pas: pas,
            nilaiAkhir: nilaiAkhir,
            catatan: document.getElementById('inputCatatanNilai').value.trim()
        };

        try {
            try {
                await addData('nilai', dataBaru);
            } catch (err) {
                await addData('data_nilai', dataBaru);
            }

            formNilai.reset();

            const modalElement = document.getElementById('modalTambahNilai');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
            }

            loadNilai();
            alert("Data Nilai Berhasil Disimpan!");
        } catch (err) {
            alert("Gagal menyimpan nilai: " + err);
        }
    });
}

async function hapusNilai(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data nilai ini?')) {
        try {
            await deleteData('nilai', id);
        } catch (e) {
            await deleteData('data_nilai', id);
        }
        loadNilai();
    }
}
