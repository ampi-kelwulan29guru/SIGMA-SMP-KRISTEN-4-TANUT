// Jalankan penghitungan data setelah halaman & database siap
document.addEventListener('DOMContentLoaded', () => {
    // Memberikan jeda singkat agar db.js selesai inisialisasi IndexedDB
    setTimeout(hitungStatistikDashboard, 300);
});

async function hitungStatistikDashboard() {
    try {
        // 1. HITUNG GURU
        let guru = await getAllData('guru').catch(() => []);
        if (!guru || guru.length === 0) {
            guru = await getAllData('data_guru').catch(() => []);
        }
        setJumlah('totalGuru', guru ? guru.length : 0);

        // 2. HITUNG SISWA
        let siswa = await getAllData('siswa').catch(() => []);
        if (!siswa || siswa.length === 0) {
            siswa = await getAllData('data_siswa').catch(() => []);
        }
        setJumlah('totalSiswa', siswa ? siswa.length : 0);

        // 3. HITUNG KELAS
        let kelas = await getAllData('kelas').catch(() => []);
        if (!kelas || kelas.length === 0) {
            kelas = await getAllData('data_kelas').catch(() => []);
        }
        setJumlah('totalKelas', kelas ? kelas.length : 0);

        // 4. HITUNG MAPEL
        let mapel = await getAllData('mapel').catch(() => []);
        if (!mapel || mapel.length === 0) {
            mapel = await getAllData('data_mapel').catch(() => []);
        }
        setJumlah('totalMapel', mapel ? mapel.length : 0);

    } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
    }
}

// Fungsi pembantu memperbarui elemen HTML
function setJumlah(elementId, jumlah) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = jumlah;
    }
}
