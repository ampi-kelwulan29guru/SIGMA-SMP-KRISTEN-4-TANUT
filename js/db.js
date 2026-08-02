// ==========================================
// INISIALISASI INDEXEDDB (SIGMA EDU DB)
// ==========================================
const DB_NAME = 'SIGMA_EDU_DB';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Buat Store Data jika belum ada
            if (!db.objectStoreNames.contains('guru')) {
                db.createObjectStore('guru', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('siswa')) {
                db.createObjectStore('siswa', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('kelas')) {
                db.createObjectStore('kelas', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('mapel')) {
                db.createObjectStore('mapel', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 1. FUNGSI AMBIL SEMUA DATA (getAllData)
async function getAllData(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 2. FUNGSI TAMBAH DATA (addData)
async function addData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 3. FUNGSI HAPUS DATA (deleteData)
async function deleteData(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// FITUR BACKUP & RESTORE DATA (JSON)
// ==========================================
async function backupDataAplikasi() {
    try {
        const dataBackup = {
            guru: await getAllData('guru'),
            siswa: await getAllData('siswa'),
            kelas: await getAllData('kelas'),
            mapel: await getAllData('mapel'),
            tanggalBackup: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataBackup, null, 2));
        const downloadAnchor = document.createElement('a');
        const tgl = new Date().toISOString().split('T')[0];
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `BACKUP_SIGMA_EDU_${tgl}.json`);
        document.body.appendChild(downloadAnchor);
        
        downloadAnchor.click();
        downloadAnchor.remove();
    } catch (err) {
        alert("Gagal membuat backup data: " + err);
    }
}

async function restoreDataAplikasi(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const dataRestored = JSON.parse(e.target.result);
            
            if (dataRestored.guru) {
                for (let item of dataRestored.guru) { delete item.id; await addData('guru', item); }
            }
            if (dataRestored.siswa) {
                for (let item of dataRestored.siswa) { delete item.id; await addData('siswa', item); }
            }

            alert("✅ Data berhasil dipulihkan (Restore)! Halaman akan dimuat ulang.");
            window.location.reload();
        } catch (error) {
            alert("❌ Format file backup tidak valid!");
        }
    };
    reader.readAsText(file);
}
