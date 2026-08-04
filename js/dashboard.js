document.addEventListener('DOMContentLoaded', async () => {
    // 1. Muat Statistik Data (Siswa, Kelas, Mapel)
    await loadDashboardStats();

    // 2. Muat Riwayat Sinkronisasi
    await loadRiwayatSync();
});

/**
 * HANDLER TOMBOL TARIK DATA DARI ADMIN
 * Dipanggil dari tombol onclick="handlePullData()" di dashboard.html
 */
async function handlePullData() {
    // Tampilkan dialog konfirmasi
    const konfirmasi = confirm("Apakah Anda yakin ingin menarik data terbaru dari Admin? Data lokal di perangkat ini akan diperbarui.");
    if (!konfirmasi) return;

    try {
        console.log("Memulai proses penarikan data...");

        // Panggil fungsi penarikan data yang ada di db.js
        const sukses = await pullDataFromAdmin();

        if (sukses) {
            alert("✅ Berhasil! Data Siswa dan Absensi terbaru telah ditarik dari Admin.");

            // Perbarui UI statistik & riwayat secara instan tanpa reload halaman
            await loadDashboardStats();
            await loadRiwayatSync();
        }
    } catch (error) {
        console.error("Gagal menarik data:", error);
        alert("❌ Gagal menarik data dari Admin: " + error.message);
    }
}

/**
 * Fungsi untuk Menghitung & Menampilkan Statistik di Cards Dashboard
 */
async function loadDashboardStats() {
    try {
        // Ambil data dari IndexedDB (db.js)
        let listSiswa = await getAllData('siswa');
        if (!listSiswa || listSiswa.length === 0) {
            listSiswa = await getAllData('data_siswa');
        }

        let listKelas = await getAllData('kelas');
        if (!listKelas || listKelas.length === 0) {
            listKelas = await getAllData('data_kelas');
        }

        let listMapel = await getAllData('mapel');
        if (!listMapel || listMapel.length === 0) {
            listMapel = await getAllData('data_mapel');
        }

        // Tampilkan jumlah ke elemen HTML jika ada
        const elSiswa = document.getElementById('statTotalSiswa');
        const elKelas = document.getElementById('statTotalKelas');
        const elMapel = document.getElementById('statTotalMapel');

        if (elSiswa) elSiswa.textContent = listSiswa ? listSiswa.length : 0;
        if (elKelas) elKelas.textContent = listKelas ? listKelas.length : 0;
        if (elMapel) elMapel.textContent = listMapel ? listMapel.length : 0;

    } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
    }
}

/**
 * Fungsi untuk Menampilkan Tabel Riwayat Sinkronisasi Data
 */
async function loadRiwayatSync() {
    const tbody = document.getElementById('tabelRiwayatSync');
    if (!tbody) return;

    try {
        const riwayatList = await getAllData('riwayat_sync');

        tbody.innerHTML = '';

        if (!riwayatList || riwayatList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">
                        Belum ada riwayat pembaruan/sinkronisasi data.
                    </td>
                </tr>
            `;
            return;
        }

        // Salin array dulu dengan [...riwayatList], lalu reverse dan ambil 10 data terbaru
        [...riwayatList].reverse().slice(0, 10).forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><small class="fw-semibold text-secondary">${item.waktu || '-'}</small></td>
                    <td class="fw-bold">${item.pengirim || 'Sistem'}</td>
                    <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${item.peran || 'User'}</span></td>
                    <td class="small text-muted">${item.keterangan || 'Pembaruan data'}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal memuat riwayat sinkronisasi:", err);
    }
}
