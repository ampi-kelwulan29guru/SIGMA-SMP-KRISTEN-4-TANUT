// ===================================
// SIGMA EDU PRO
// Dashboard Script
// ===================================

// Cek apakah pengguna sudah login
if (localStorage.getItem("login") !== "true") {
    window.location.href = "../index.html";
}

// Menampilkan tanggal
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

// Jam Digital
function updateJam() {

    const sekarang = new Date();

    const jam =
        String(sekarang.getHours()).padStart(2, "0");

    const menit =
        String(sekarang.getMinutes()).padStart(2, "0");

    const detik =
        String(sekarang.getSeconds()).padStart(2, "0");

    const jamElement = document.getElementById("jam");

    if (jamElement) {

        jamElement.innerHTML =
            jam + ":" + menit + ":" + detik;

    }

}

setInterval(updateJam, 1000);

updateJam();
