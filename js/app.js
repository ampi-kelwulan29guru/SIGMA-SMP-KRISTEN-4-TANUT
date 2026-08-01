// Menghilangkan screen loading setelah halaman selesai dimuat
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
});

// Pengecekan sederhana status login
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;

    // Jika belum login dan mencoba akses halaman di folder /pages/
    if (!isLoggedIn && currentPage.includes('/pages/')) {
        window.location.href = '../index.html';
    }
}

// Jalankan pengecekan auth
checkAuth();
