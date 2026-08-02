document.addEventListener('DOMContentLoaded', updateDashboardStats);

async function updateDashboardStats() {
    try {
        // 1. HITUNG DATA GURU (Cek store 'guru', 'data_guru', atau 'gurus')
        let totalGuruCount = 0;
        try {
            let dataGuru = await getAllData('guru');
            if (!dataGuru || dataGuru.length === 0) {
                dataGuru = await getAllData('data_guru');
            }
            if (!dataGuru || dataGuru.length === 0) {
                dataGuru = await getAllData('gurus');
            }
            totalGuruCount = dataGuru ? dataGuru.length : 0;
        } catch (e) {
            console.log("Mencoba membaca store guru...", e);
        }

        // Tampilkan angka Guru
        const elGuru = document.getElementById('totalGuru');
        if (elGuru) elGuru.textContent = totalGuruCount;

        // 2. HITUNG DATA SISWA
        try {
            let dataSiswa = await getAllData('siswa');
            if (!dataSiswa || dataSiswa.length === 0) dataSiswa = await getAllData('data_siswa');
            const elSiswa = document.getElementById('totalSiswa');
            if (elSiswa) elSiswa.textContent = dataSiswa ? dataSiswa.length : 0;
        } catch (e) {}

        // 3. HITUNG DATA KELAS
        try {
            let dataKelas = await getAllData('kelas');
            if (!dataKelas || dataKelas.length === 0) dataKelas = await getAllData('data_kelas');
            const elKelas = document.getElementById('totalKelas');
            if (elKelas) elKelas.textContent = dataKelas ? dataKelas.length : 0;
        } catch (e) {}

        // 4. HITUNG DATA MAPEL
        try {
            let dataMapel = await getAllData('mapel');
            if (!dataMapel || dataMapel.length === 0) dataMapel = await getAllData('data_mapel');
            const elMapel = document.getElementById('totalMapel');
            if (elMapel) elMapel.textContent = dataMapel ? dataMapel.length : 0;
        } catch (e) {}

    } catch (err) {
        console.error("Gagal memperbarui statistik dashboard:", err);
    }
}
