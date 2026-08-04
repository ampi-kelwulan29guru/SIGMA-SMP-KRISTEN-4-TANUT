const DB_NAME = 'SigmaEduDB';
const DB_VERSION = 3; // Naikkan ke versi 3 untuk menambahkan store absensi & riwayat_sync

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Daftar store wajib (ditambah 'absensi' dan 'riwayat_sync')
            const stores = [
                'guru', 'data_guru', 
                'siswa', 'data_siswa', 
                'kelas', 'data_kelas', 
                'mapel', 'data_mapel',
                'absensi', 'data_absensi',
                'riwayat_sync'
            ];
            
            stores.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                }
            });
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function addData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function getAllData(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function deleteData(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

// FUNGSI TAMBAHAN: Untuk Mengosongkan Store (Dipakai saat Timpa/Sinkron Data)
async function clearStore(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}
// FUNGSI TARIK DATA DARI ADMIN (PULL DATA)
async function pullDataFromAdmin() {
    try {
        // 1. Ambil data mentah dari Admin (Contoh: mengambil dari localStorage/Server/Master JSON)
        const rawSiswa = localStorage.getItem('sigma_admin_siswa');
        const rawAbsensi = localStorage.getItem('sigma_admin_absensi');

        const dataSiswaAdmin = rawSiswa ? JSON.parse(rawSiswa) : [];
        const dataAbsensiAdmin = rawAbsensi ? JSON.parse(rawAbsensi) : [];

        if (dataSiswaAdmin.length === 0 && dataAbsensiAdmin.length === 0) {
            alert('⚠️ Tidak ada data baru dari Admin yang tersedia untuk ditarik.');
            return false;
        }

        // 2. Kosongkan store lokal sebelum menimpa data baru
        await clearStore('siswa');
        await clearStore('absensi');

        // 3. Masukkan Data Siswa Baru ke IndexedDB
        for (const item of dataSiswaAdmin) {
            await addData('siswa', item);
        }

        // 4. Masukkan Data Absensi Baru ke IndexedDB
        for (const item of dataAbsensiAdmin) {
            await addData('absensi', item);
        }

        // 5. Catat Log Sinkronisasi
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        const logData = {
            waktu: new Date().toLocaleString('id-ID'),
            pengirim: currentUser.nama || 'Guru/Wali Kelas',
            peran: currentUser.role || 'User',
            keterangan: `Berhasil menarik ${dataSiswaAdmin.length} data siswa & ${dataAbsensiAdmin.length} data absensi dari Admin.`
        };
        await addData('riwayat_sync', logData);

        return true;
    } catch (err) {
        console.error('Gagal menarik data dari Admin:', err);
        throw err;
    }
}
