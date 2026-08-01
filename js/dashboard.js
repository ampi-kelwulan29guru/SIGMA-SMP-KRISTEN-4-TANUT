document.addEventListener("DOMContentLoaded", async function () {
    // Jalankan pembaruan data setelah halaman siap
    setTimeout(async () => {
        await updateDashboardStats();
    }, 100);
});

async function updateDashboardStats() {
    try {
        // Ambil data dari IndexedDB via db.js
        const dataGuru = typeof getAllData === "function" ? await getAllData('guru') : [];
        const dataSiswa = typeof getAllData === "function" ? await getAllData('siswa') : [];
        const dataKelas = typeof getAllData === "function" ? await getAllData('kelas') : [];
        const dataMapel = typeof getAllData === "function" ? await getAllData('mapel') : [];

        // Update ke HTML (sesuai ID: totalGuru, totalSiswa, totalKelas, totalMapel)
        const elGuru = document.getElementById("totalGuru");
        const elSiswa = document.getElementById("totalSiswa");
        const elKelas = document.getElementById("totalKelas");
        const elMapel = document.getElementById("totalMapel");

        if (elGuru) elGuru.innerText = dataGuru ? dataGuru.length : 0;
        if (elSiswa) elSiswa.innerText = dataSiswa ? dataSiswa.length : 0;
        if (elKelas) elKelas.innerText = dataKelas ? dataKelas.length : 0;
        if (elMapel) elMapel.innerText = dataMapel ? dataMapel.length : 0;

    } catch (err) {
        console.error("Gagal menghitung statistik dashboard:", err);
    }
}
