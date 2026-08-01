// Database Helper untuk SIGMA EDU PRO (IndexedDB)
const DB_NAME = 'SigmaEduDB';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

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
            if (!db.objectStoreNames.contains('absensi')) {
                db.createObjectStore('absensi', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('jurnal')) {
                db.createObjectStore('jurnal', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('nilai')) {
                db.createObjectStore('nilai', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllData(storeName) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });
}

async function addData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.add(data);
        tx.oncomplete = () => resolve(true);
    });
}

// Tambahan: Update Data berdasarkan ID
async function updateData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(data);
        tx.oncomplete = () => resolve(true);
    });
}

async function deleteData(storeName, id) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
    });
}

// Inisialisasi Data Default jika IndexedDB masih kosong
async function initDefaultData() {
    const dataGuru = await getAllData('guru');
    if (dataGuru.length === 0) {
        await addData('guru', {
            nip: "198203212008041002",
            nama: "Edy Wenan S. Slarmanat, S.Pd",
            mapel: "Kepala Sekolah",
            hp: "082397523433"
        });
    }
}
