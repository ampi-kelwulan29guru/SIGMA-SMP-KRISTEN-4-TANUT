// Jalankan penghitung data saat halaman dashboard selesai dimuat
document.addEventListener('DOMContentLoaded', updateJumlahDashboard);

async function updateJumlahDashboard() {
    try {
        // Ambil data dari IndexedDB secara asynchronous
        const listGuru = await getAllData('guru') || [];
        const listSiswa = await getAllData('siswa') || [];
        const listKelas = await getAllData('kelas') || [];
        const listMapel = await getAllData('mapel') || [];

        // Ambil elemen HTML tempat angka statistik
        const elGuru = document.getElementById('totalGuru');
        const elSiswa = document.getElementById('totalSiswa');
        const elKelas = document.getElementById('totalKelas');
        const elMapel = document.getElementById('totalMapel');

        // Tampilkan jumlah data di dashboard
        if (elGuru) elGuru.innerText = listGuru.length;
        if (elSiswa) elSiswa.innerText = listSiswa.length;
        if (elKelas) elKelas.innerText = listKelas.length;
        if (elMapel) elMapel.innerText = listMapel.length;

    } catch (error) {
        console.error("Gagal memperbarui statistik dashboard:", error);
    }
}
