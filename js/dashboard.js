document.addEventListener('DOMContentLoaded', updateDashboardStats);

async function updateDashboardStats() {
    try {
        // Ambil data dari IndexedDB
        const listGuru = (typeof getAllData === 'function') ? await getAllData('guru') : [];
        const listSiswa = (typeof getAllData === 'function') ? await getAllData('siswa') : [];
        const listKelas = (typeof getAllData === 'function') ? await getAllData('kelas') : [];

        // Update angka di kartu dashboard jika elemen ada
        const elGuru = document.getElementById('totalGuru');
        const elSiswa = document.getElementById('totalSiswa');
        const elKelas = document.getElementById('totalKelas');

        if (elGuru) elGuru.textContent = listGuru.length || 0;
        if (elSiswa) elSiswa.textContent = listSiswa.length || 0;
        if (elKelas) elKelas.textContent = listKelas.length || 0;
    } catch (err) {
        console.error("Gagal memperbarui statistik dashboard:", err);
    }
}
