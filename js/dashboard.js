// =====================================
// SIGMA EDU PRO
// Dashboard JavaScript
// =====================================

// Jam Digital
function updateClock() {
    const now = new Date();

    const jam = String(now.getHours()).padStart(2, "0");
    const menit = String(now.getMinutes()).padStart(2, "0");
    const detik = String(now.getSeconds()).padStart(2, "0");

    const clock = document.getElementById("digitalClock");

    if (clock) {
        clock.innerHTML = `${jam}:${menit}:${detik}`;
    }
}

setInterval(updateClock, 1000);
updateClock();

// Tanggal
function updateDate() {
    const now = new Date();

    const hari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];

    const bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    const tanggal = document.getElementById("todayDate");
    const namaHari = document.getElementById("todayDay");

    if (tanggal) {
        tanggal.innerHTML =
            now.getDate() + " " +
            bulan[now.getMonth()] + " " +
            now.getFullYear();
    }

    if (namaHari) {
        namaHari.innerHTML = hari[now.getDay()];
    }
}

updateDate();

console.log("Dashboard SIGMA EDU PRO siap dijalankan.");
