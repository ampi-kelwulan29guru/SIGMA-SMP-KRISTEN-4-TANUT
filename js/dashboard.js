// ===================================
// SIGMA EDU PRO
// Dashboard Script
// ===================================

// Cek login
if (localStorage.getItem("login") !== "true") {
    window.location.href = "../index.html";
}

// =============================
// Tanggal
// =============================

const tanggal = new Date();

const opsi = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

const tanggalElement = document.getElementById("tanggal");

if (tanggalElement) {
    tanggalElement.innerHTML =
        tanggal.toLocaleDateString("id-ID", opsi);
}

// =============================
// Jam Digital
// =============================

function updateJam() {

    const sekarang = new Date();

    const jam = String(sekarang.getHours()).padStart(2, "0");
    const menit = String(sekarang.getMinutes()).padStart(2, "0");
    const detik = String(sekarang.getSeconds()).padStart(2, "0");

    const jamElement = document.getElementById("jam");

    if (jamElement) {
        jamElement.innerHTML = jam + ":" + menit + ":" + detik;
    }

}

setInterval(updateJam, 1000);
updateJam();

// =============================
// Statistik Dashboard
// =============================

const request = indexedDB.open("SIGMA_EDU_PRO", 1);

request.onsuccess = function (event) {

    const db = event.target.result;

    tampilkanTotal(db, "guru", "totalGuru");
    tampilkanTotal(db, "siswa", "totalSiswa");
    tampilkanTotal(db, "kelas", "totalKelas");

};

function tampilkanTotal(db, storeName, elementId) {

    if (!db.objectStoreNames.contains(storeName)) return;

    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const count = store.count();

    count.onsuccess = function () {

        const el = document.getElementById(elementId);

        if (el) {
            el.innerHTML = count.result;
        }

    };

}
// Fungsi Logout Global
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        // Hapus status login dari penyimpanan lokal
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userAdmin');
        
        // Arahkan kembali ke halaman login (index.html)
        window.location.href = '../index.html';
    }
}

// Fungsi Hitung Otomatis Total Guru, Siswa, dan Kelas dari IndexedDB
async function updateDashboardStats() {
    if (typeof getAllData === 'function') {
        try {
            const listGuru = await getAllData('guru');
            const listSiswa = await getAllData('siswa');
            const listKelas = await getAllData('kelas');

            if (document.getElementById('totalGuru')) {
                document.getElementById('totalGuru').innerText = listGuru.length;
            }
            if (document.getElementById('totalSiswa')) {
                document.getElementById('totalSiswa').innerText = listSiswa.length;
            }
            if (document.getElementById('totalKelas')) {
                document.getElementById('totalKelas').innerText = listKelas.length;
            }
        } catch (err) {
            console.log('Database belum siap untuk statistik:', err);
        }
    }
}

// Jalankan saat halaman Dashboard selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
});
