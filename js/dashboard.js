document.addEventListener("DOMContentLoaded", async function () {
    try {
        // 1. Pastikan data default diisi jika database masih kosong
        if (typeof initDefaultData === "function") {
            await initDefaultData();
        }
        
        // 2. Refresh angka di dashboard
        await updateDashboardStats();
    } catch (error) {
        console.error("Gagal memuat statistik dashboard:", error);
    }
});

async function updateDashboardStats() {
    try {
        // Ambil data dari IndexedDB (menggunakan helper dari db.js)
        const dataGuru = await getAllData('guru');
        const dataSiswa = await getAllData('siswa');
        const dataKelas = await getAllData('kelas');
        const dataMapel = await getAllData('mapel');

        // Elemen Total Guru
        const elGuru = document.getElementById("totalGuruCount");
        if (elGuru) elGuru.innerText = dataGuru.length;

        // Elemen Total Siswa
        const elSiswa = document.getElementById("totalSiswaCount");
        if (elSiswa) elSiswa.innerText = dataSiswa.length;

        // Elemen Total Kelas
        const elKelas = document.getElementById("totalKelasCount");
        if (elKelas) elKelas.innerText = dataKelas.length;

        // Elemen Total Mapel
        const elMapel = document.getElementById("totalMapelCount");
        if (elMapel) elMapel.innerText = dataMapel.length;

    } catch (err) {
        console.error("Gagal menghitung statistik:", err);
    }
}
