document.addEventListener('DOMContentLoaded', async () => {
    // Jalankan fungsi penghitung saat halaman dashboard dimuat
    await updateDashboardStats();
});

async function updateDashboardStats() {
    try {
        // 1. Ambil data dari IndexedDB
        const listGuru = await getAllData('guru');
        const listSiswa = await getAllData('siswa');
        const listKelas = await getAllData('kelas');
        const listMapel = await getAllData('mapel');

        // 2. Cari elemen badge/kartu statistik berdasarkan ID atau posisinya
        const totalGuruEl = document.getElementById('totalGuru');
        const totalSiswaEl = document.getElementById('totalSiswa');
        const totalKelasEl = document.getElementById('totalKelas');
        const totalMapelEl = document.getElementById('totalMapel');

        // Update angka jika elemen ID ditemukan
        if (totalGuruEl) totalGuruEl.textContent = listGuru.length;
        if (totalSiswaEl) totalSiswaEl.textContent = listSiswa.length;
        if (totalKelasEl) totalKelasEl.textContent = listKelas.length;
        if (totalMapelEl) totalMapelEl.textContent = listMapel.length;

        // Jika kartu di dashboard menggunakan class statistik bawaan (fallback query)
        const statCards = document.querySelectorAll('.card h2, .card .display-6, .card-title.fs-2');
        if (statCards.length >= 4) {
            statCards[0].textContent = listGuru.length;
            statCards[1].textContent = listSiswa.length;
            statCards[2].textContent = listKelas.length;
            statCards[3].textContent = listMapel.length;
        }

    } catch (error) {
        console.error("Gagal memuat statistik dashboard:", error);
    }
}
