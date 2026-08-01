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

        request.onsuccess = async () => {
            const db = request.result;

            // AUTO-SEED DATA DEFAULT
            try {
                const tx = db.transaction('guru', 'readonly');
                const store = tx.objectStore('guru');
                const req = store.getAll();
                req.onsuccess = () => {
                    if (req.result.length === 0) {
                        const writeTx = db.transaction('guru', 'readwrite');
                        writeTx.objectStore('guru').add({
                            nip: "198203212008041002",
                            nama: "Edy Wenan S. Slarmanat, S.Pd",
                            mapel: "Kepala Sekolah",
                            hp: "082397523433"
                        });
                    }
                };
            } catch (err) {
                console.error("Gagal melakukan auto-seed:", err);
            }

            resolve(db);
        };

        request.onerror = () => reject(request.error);
    });
}

async function getAllData(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function addData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.add(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function updateData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function deleteData(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
