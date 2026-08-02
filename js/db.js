// ==========================================
// 1. FUNGSI DATABASE LOKAL (LOCALSTORAGE)
// ==========================================

// Fungsi membaca data dari LocalStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Fungsi menyimpan data ke LocalStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ==========================================
// 2. FUNGSI BACKUP & RESTORE DATA (OFFLINE)
// ==========================================

// FUNGSI EKSPOR DATA KE JSON (BACKUP)
function backupDataAplikasi() {
    const dataBackup = {
        guru: getData('data_guru'),
        siswa: getData('data_siswa'),
        kelas: getData('data_kelas'),
        mapel: getData('data_mapel'),
        absensi: getData('data_absensi'),
        jurnal: getData('data_jurnal'),
        nilai: getData('data_nilai'),
        tanggalBackup: new Date().toISOString()
    };

    // Ubah data jadi file JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    
    // Format nama file otomatis beserta tanggal
    const tgl = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BACKUP_SIGMA_EDU_${tgl}.json`);
    document.body.appendChild(downloadAnchor);
    
    // Jalankan download
    downloadAnchor.click();
    downloadAnchor.remove();
}

// FUNGSI IMPOR DATA DARI JSON (RESTORE)
function restoreDataAplikasi(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dataRestored = JSON.parse(e.target.result);
            
            // Simpan kembali data ke LocalStorage
            if(dataRestored.guru) saveData('data_guru', dataRestored.guru);
            if(dataRestored.siswa) saveData('data_siswa', dataRestored.siswa);
            if(dataRestored.kelas) saveData('data_kelas', dataRestored.kelas);
            if(dataRestored.mapel) saveData('data_mapel', dataRestored.mapel);
            if(dataRestored.absensi) saveData('data_absensi', dataRestored.absensi);
            if(dataRestored.jurnal) saveData('data_jurnal', dataRestored.jurnal);
            if(dataRestored.nilai) saveData('data_nilai', dataRestored.nilai);

            alert("✅ Data berhasil dipulihkan (Restore)! Halaman akan dimuat ulang.");
            window.location.reload();
        } catch (error) {
            alert("❌ Format file backup tidak valid!");
        }
    };
    reader.readAsText(file);
}
