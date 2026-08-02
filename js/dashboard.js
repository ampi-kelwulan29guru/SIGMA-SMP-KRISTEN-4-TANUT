// Jalankan pembacaan data saat halaman dashboard siap
document.addEventListener('DOMContentLoaded', updateJumlahDashboard);

async function updateJumlahDashboard() {
    try {
        // Ambil data guru (mencoba 'guru' atau 'data_guru')
        let listGuru = await getAllData('guru').catch(() => []);
        if (!listGuru || listGuru.length === 0) {
            listGuru = await getAllData('data_guru').catch(() => []);
        }

        // Ambil data siswa (mencoba 'siswa' atau 'data_siswa')
        let listSiswa = await getAllData('siswa').catch(() => []);
        if (!listSiswa || listSiswa.length === 0) {
            listSiswa = await getAllData('data_siswa').catch(() => []);
        }

        // Ambil data kelas (mencoba 'kelas' atau 'data_kelas')
        let listKelas = await getAllData('kelas').catch(() => []);
        if (!listKelas || listKelas.length === 0) {
            listKelas = await getAllData('data_kelas').catch(() => []);
        }

        // Ambil data mapel (mencoba 'mapel' atau 'data_mapel')
        let listMapel = await getAllData('mapel').catch(() => []);
        if (!listMapel || listMapel.length === 0) {
            listMapel = await getAllData('data_mapel').catch(() => []);
        }

        // Tampilkan total data ke angka statistik dashboard
        const elGuru = document.getElementById('totalGuru');
        const elSiswa = document.getElementById('totalSiswa');
        const elKelas = document.getElementById('totalKelas');
        const elMapel = document.getElementById('totalMapel');

        if (elGuru) elGuru.innerText = listGuru ? listGuru.length : 0;
        if (elSiswa) elSiswa.innerText = listSiswa ? listSiswa.length : 0;
        if (elKelas) elKelas.innerText = listKelas ? listKelas.length : 0;
        if (elMapel) elMapel.innerText = listMapel ? listMapel.length : 0;

    } catch (error) {
        console.error("Gagal memperbarui statistik dashboard:", error);
    }
}
