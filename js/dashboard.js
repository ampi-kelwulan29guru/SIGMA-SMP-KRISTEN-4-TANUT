// Fungsi untuk memuat dan menghitung statistik
async function updateDashboardStats() {
    try {
        // Cek apakah fungsi getAllData dari db.js tersedia
        if (typeof getAllData !== 'function') {
            console.error("Fungsi getAllData dari db.js belum terdeteksi.");
            return;
        }

        // Ambil data dari IndexedDB
        const listGuru = await getAllData('guru') || [];
        const listSiswa = await getAllData('siswa') || [];
        const listKelas = await getAllData('kelas') || [];
        const listMapel = await getAllData('mapel') || [];

        // Ambil elemen HTML berdasarkan ID
        const elGuru = document.getElementById('totalGuru');
        const elSiswa = document.getElementById('totalSiswa');
        const elKelas = document.getElementById('totalKelas');
        const elMapel = document.getElementById('totalMapel');

        // Isi angka ke tampilan HTML
        if (elGuru) elGuru.textContent = listGuru.length;
        if (elSiswa) elSiswa.textContent = listSiswa.length;
        if (elKelas) elKelas.textContent = listKelas.length;
        if (elMapel) elMapel.textContent = listMapel.length;

    } catch (error) {
        console.error("Gagal menghitung statistik dashboard:", error);
    }
}

// Jalankan saat dokumen selesai dimuat
document.addEventListener('DOMContentLoaded', updateDashboardStats);

// Jalankan juga saat window selesai memuat seluruh asset
window.onload = updateDashboardStats;
