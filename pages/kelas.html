// Memuat data siswa saat halaman dibuka
document.addEventListener('DOMContentLoaded', () => {
    tampilkanDataSiswa();
});

// FUNGSI UNTUK MENAMPILKAN DATA SISWA KE TABEL
function tampilkanDataSiswa() {
    const listSiswa = getData('data_siswa'); // Memanggil fungsi dari js/db.js
    const tbody = document.getElementById('tabelSiswa');
    
    if (!tbody) return;
    tbody.innerHTML = '';

    if (listSiswa.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada data siswa. Silakan tambah data baru!</td></tr>`;
        return;
    }

    listSiswa.forEach((siswa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${siswa.nisn}</strong></td>
            <td>${siswa.nama}</td>
            <td><span class="badge bg-info text-dark">${siswa.kelas}</span></td>
            <td>${siswa.gender}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="hapusSiswa(${index})">
                    <i class="bi bi-trash"></i> Hapus
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// FUNGSI UNTUK MENAMBAH DATA SISWA BARU
function tambahSiswa(event) {
    event.preventDefault();

    const nisn = document.getElementById('inputNisn').value;
    const nama = document.getElementById('inputNama').value;
    const kelas = document.getElementById('inputKelas').value;
    const gender = document.getElementById('inputGender').value;

    if (!nisn || !nama) {
        alert('Mohon isi NISN dan Nama Siswa!');
        return;
    }

    const listSiswa = getData('data_siswa');
    
    // Tambah data baru ke array
    listSiswa.push({ nisn, nama, kelas, gender });

    // Simpan kembali ke localStorage
    saveData('data_siswa', listSiswa);

    // Reset Form & Tutup Modal jika pakai Modal Bootstrap
    document.getElementById('formSiswa').reset();
    alert('✅ Data siswa berhasil disimpan!');

    // Refresh Tabel
    tampilkanDataSiswa();
}

// FUNGSI UNTUK MENGHAPUS DATA SISWA
function hapusSiswa(index) {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        const listSiswa = getData('data_siswa');
        listSiswa.splice(index, 1);
        saveData('data_siswa', listSiswa);
        tampilkanDataSiswa();
    }
}
