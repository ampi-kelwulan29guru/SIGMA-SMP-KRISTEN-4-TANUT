document.addEventListener('DOMContentLoaded', async () => {
    // Default Tanggal Hari Ini
    const inputTanggal = document.getElementById('inputTanggalJurnal');
    if (inputTanggal) {
        inputTanggal.value = new Date().toISOString().split('T')[0];
    }

    await populasiDropdownJurnal();
    await loadJurnal();
});

// Mengisi dropdown Guru, Kelas, dan Mapel secara otomatis dari IndexedDB
async function populasiDropdownJurnal() {
    // Opsi Guru
    const selectGuru = document.getElementById('selectGuruJurnal');
    if (selectGuru) {
        let listGuru = await getAllData('guru').catch(() => []);
        if (!listGuru || listGuru.length === 0) listGuru = await getAllData('data_guru').catch(() => []);

        selectGuru.innerHTML = '<option value="">-- Pilih Guru --</option>';
        listGuru.forEach(g => {
            const nama = g.nama || g.namaGuru || '-';
            const nip = g.nip || g.nipGuru || '';
            selectGuru.innerHTML += `<option value="${nama}">${nama} ${nip ? '(' + nip + ')' : ''}</option>`;
        });
    }

    // Opsi Kelas
    const selectKelas = document.getElementById('selectKelasJurnal');
    if (selectKelas) {
        let listKelas = await getAllData('kelas').catch(() => []);
        if (!listKelas || listKelas.length === 0) listKelas = await getAllData('data_kelas').catch(() => []);

        selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        listKelas.forEach(k => {
            const nama = k.nama || k.namaKelas || k.kelas;
            selectKelas.innerHTML += `<option value="${nama}">${nama}</option>`;
        });
    }

    // Opsi Mapel
    const selectMapel = document.getElementById('selectMapelJurnal');
    if (selectMapel) {
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) listMapel = await getAllData('data_mapel').catch(() => []);

        selectMapel.innerHTML = '<option value="">-- Pilih Mapel --</option>';
        listMapel.forEach(m => {
            const nama = m.nama || m.namaMapel;
            selectMapel.innerHTML += `<option value="${nama}">${nama}</option>`;
        });
    }
}

// Memuat data Jurnal ke Tabel
async function loadJurnal() {
    const tbody = document.getElementById('tabelJurnal');
    if (!tbody) return;

    try {
        let listJurnal = await getAllData('jurnal').catch(() => []);
        if (!listJurnal || listJurnal.length === 0) {
            listJurnal = await getAllData('data_jurnal').catch(() => []);
        }

        tbody.innerHTML = '';

        if (!listJurnal || listJurnal.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Belum ada data jurnal. Klik tombol <strong>+ Isi Jurnal Harian</strong> di atas.
                    </td>
                </tr>`;
            return;
        }

        listJurnal.reverse(); // Menampilkan data terbaru di paling atas

        listJurnal.forEach((item, index) => {
            tbody.innerHTML += `
                <tr>
                    <td class="text-center fw-bold text-secondary">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border font-monospace">${item.tanggal || '-'}</span></td>
                    <td>
                        <strong class="text-dark d-block">${item.mapel || '-'}</strong>
                        <small class="text-muted">${item.guru || '-'} | ${item.kelas || '-'} (${item.fase || '-'}) Sem. ${item.semester || '-'}</small>
                    </td>
                    <td><span class="badge bg-info bg-opacity-10 text-info fw-bold px-2 py-1">${item.jamKe || '-'}</span></td>
                    <td class="small">${item.tp || '-'}</td>
                    <td class="fw-semibold text-dark small">${item.materi || '-'}</td>
                    <td class="text-secondary small">${item.catatan || '-'}</td>
                    <td class="text-center">
                        <span class="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">${item.paraf || 'Valid'}</span>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0 rounded-2 px-2" onclick="hapusJurnal(${item.id})" title="Hapus">
                            <i class="bi bi-trash-fill fs-6"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal memuat jurnal:", err);
    }
}

// Event handler simpan data jurnal
const formJurnal = document.getElementById('formJurnal');
if (formJurnal) {
    formJurnal.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataBaru = {
            guru: document.getElementById('selectGuruJurnal').value,
            sekolah: document.getElementById('inputSekolah').value,
            fase: document.getElementById('selectFase').value,
            kelas: document.getElementById('selectKelasJurnal').value,
            semester: document.getElementById('selectSemester').value,
            mapel: document.getElementById('selectMapelJurnal').value,
            tanggal: document.getElementById('inputTanggalJurnal').value,
            jamKe: document.getElementById('inputJamKe').value.trim(),
            tp: document.getElementById('inputTP').value.trim(),
            materi: document.getElementById('inputMateri').value.trim(),
            catatan: document.getElementById('inputCatatan').value.trim(),
            paraf: document.getElementById('selectParaf').value
        };

        try {
            try {
                await addData('jurnal', dataBaru);
            } catch (err) {
                await addData('data_jurnal', dataBaru);
            }

            formJurnal.reset();

            const modalElement = document.getElementById('modalTambahJurnal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) modalInstance.hide();
            }

            loadJurnal();
            alert("Data Jurnal Harian Berhasil Disimpan!");
        } catch (err) {
            alert("Gagal menyimpan jurnal: " + err);
        }
    });
}

async function hapusJurnal(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data jurnal ini?')) {
        try {
            await deleteData('jurnal', id);
        } catch (e) {
            await deleteData('data_jurnal', id);
        }
        loadJurnal();
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
