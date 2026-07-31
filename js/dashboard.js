document.addEventListener('DOMContentLoaded', async () => {
    await updateDashboardStats();
});

async function updateDashboardStats() {
    try {
        const listGuru = await getAllData('guru') || [];
        const listSiswa = await getAllData('siswa') || [];
        const listKelas = await getAllData('kelas') || [];
        const listMapel = await getAllData('mapel') || [];

        const elGuru = document.getElementById('totalGuru');
        const elSiswa = document.getElementById('totalSiswa');
        const elKelas = document.getElementById('totalKelas');
        const elMapel = document.getElementById('totalMapel');

        if (elGuru) elGuru.textContent = listGuru.length;
        if (elSiswa) elSiswa.textContent = listSiswa.length;
        if (elKelas) elKelas.textContent = listKelas.length;
        if (elMapel) elMapel.textContent = listMapel.length;

    } catch (error) {
        console.error("Gagal menghitung statistik dashboard:", error);
    }
}
