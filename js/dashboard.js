// Jalankan fungsi penghitung data saat halaman dashboard dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateJumlahDashboard();
});

function updateJumlahDashboard() {
    // Ambil data dari localStorage menggunakan fungsi di db.js (atau fallback array kosong)
    const dataGuru = getData('data_guru') || [];
    const dataSiswa = getData('data_siswa') || [];
    const dataKelas = getData('data_kelas') || [];
    const dataMapel = getData('data_mapel') || [];

    // Tampilkan total ke elemen HTML angka statistik di dashboard
    const elGuru = document.getElementById('totalGuru');
    const elSiswa = document.getElementById('totalSiswa');
    const elKelas = document.getElementById('totalKelas');
    const elMapel = document.getElementById('totalMapel');

    if (elGuru) elGuru.innerText = dataGuru.length;
    if (elSiswa) elSiswa.innerText = dataSiswa.length;
    if (elKelas) elKelas.innerText = dataKelas.length;
    if (elMapel) elMapel.innerText = dataMapel.length;
}
