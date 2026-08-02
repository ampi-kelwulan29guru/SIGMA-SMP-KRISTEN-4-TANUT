document.addEventListener('DOMContentLoaded', () => {
    // Memberikan jeda agar IndexedDB selesai diproses
    setTimeout(updateDashboardStats, 400);
});

async function updateDashboardStats() {
    // 1. HITUNG DATA GURU
    await hitungTotal(['guru', 'data_guru', 'gurus', 'tb_guru'], 'totalGuru');

    // 2. HITUNG DATA SISWA
    await hitungTotal(['siswa', 'data_siswa', 'siswas', 'tb_siswa'], 'totalSiswa');

    // 3. HITUNG DATA KELAS
    await hitungTotal(['kelas', 'data_kelas', 'kelass', 'tb_kelas'], 'totalKelas');

    // 4. HITUNG DATA MAPEL
    await hitungTotal(['mapel', 'data_mapel', 'mapels', 'tb_mapel'], 'totalMapel');
}

async function hitungTotal(kumpulanNamaStore, elementId) {
    let totalData = 0;

    for (const storeName of kumpulanNamaStore) {
        try {
            const data = await getAllData(storeName);
            if (data && Array.isArray(data) && data.length > 0) {
                totalData = data.length;
                break; // Hentikan pencarian jika data ditemukan pada salah satu store
            }
        } catch (err) {
            // Lanjut mencoba nama store berikutnya jika store ini belum ada
        }
    }

    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = totalData;
    }
}
