// Jalankan pembacaan data saat halaman dashboard siap
document.addEventListener('DOMContentLoaded', updateJumlahDashboard);

async function updateJumlahDashboard() {
    try {
        // 1. Hitung Total Guru (mencoba nama tabel 'guru' atau 'data_guru')
        let listGuru = await getAllData('guru').catch(() => []);
        if (!listGuru || listGuru.length === 0) {
            listGuru = await getAllData('data_guru').catch(() => []);
        }
        const elGuru = document.getElementById('totalGuru');
        if (elGuru) elGuru.textContent = listGuru.length;

        // 2. Hitung Total Siswa
        let listSiswa = await getAllData('siswa').catch(() => []);
        if (!listSiswa || listSiswa.length === 0) {
            listSiswa = await getAllData('data_siswa').catch(() => []);
        }
        const elSiswa = document.getElementById('totalSiswa');
        if (elSiswa) elSiswa.textContent = listSiswa.length;

        // 3. Hitung Total Kelas
        let listKelas = await getAllData('kelas').catch(() => []);
        if (!listKelas || listKelas.length === 0) {
            listKelas = await getAllData('data_kelas').catch(() => []);
        }
        const elKelas = document.getElementById('totalKelas');
        if (elKelas) elKelas.textContent = listKelas.length;

        // 4. Hitung Total Mapel
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) {
            listMapel = await getAllData('data_mapel').catch(() => []);
        }
        const elMapel = document.getElementById('totalMapel');
        if (elMapel) elMapel.textContent = listMapel.length;

    } catch (err) {
        console.error("Gagal menghitung statistik dashboard:", err);
    }
}
