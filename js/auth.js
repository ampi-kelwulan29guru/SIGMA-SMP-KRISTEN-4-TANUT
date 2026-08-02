// Memeriksa Sesi Login & Pembatasan Menu
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!session && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    if (session && !isLoginPage) {
        applyRolePermissions(session);
    }
}

// Logika Pembatasan Fitur Per Role (Guru Mapel, Wali Kelas, Admin)
function applyRolePermissions(session) {
    const currentPage = window.location.pathname.split('/').pop();

    if (session.role === 'guru_mapel') {
        // Guru Mapel: Sembunyikan Data Guru, Siswa, Kelas, Mapel
        hideSidebarLinks(['guru.html', 'siswa.html', 'kelas.html', 'mapel.html']);

        // Proteksi URL Langsung
        const restrictedPages = ['guru.html', 'siswa.html', 'kelas.html', 'mapel.html'];
        if (restrictedPages.includes(currentPage)) {
            alert('Akses Ditolak: Fitur Master Data tidak tersedia untuk Guru Mapel.');
            window.location.href = 'dashboard.html';
        }

    } else if (session.role === 'wali_kelas') {
        // Wali Kelas: Sembunyikan Data Guru dan Mapel
        hideSidebarLinks(['guru.html', 'mapel.html']);

        // Proteksi URL Langsung
        const restrictedPages = ['guru.html', 'mapel.html'];
        if (restrictedPages.includes(currentPage)) {
            alert('Akses Ditolak: Fitur ini tidak tersedia untuk Wali Kelas.');
            window.location.href = 'dashboard.html';
        }

    } else if (session.role === 'admin') {
        // Admin: Akses penuh ke seluruh halaman (tidak ada pembatasan/penyembunyian menu)
    }
}

// Helper Menyembunyikan Menu Sidebar
function hideSidebarLinks(pageList) {
    pageList.forEach(page => {
        const links = document.querySelectorAll(`a[href="${page}"]`);
        links.forEach(link => {
            if (link.parentElement && link.parentElement.tagName === 'LI') {
                link.parentElement.style.display = 'none';
            } else {
                link.style.display = 'none';
            }
        });
    });
}

// Handler Form Login
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        const role = document.getElementById('loginRole').value;
        const selectGuru = document.getElementById('selectGuruLogin');
        const selectKelas = document.getElementById('selectKelasWali');

        const sessionData = {
            role: role,
            username: document.getElementById('loginUser').value.trim(),
            namaGuru: role === 'admin' ? 'Administrator' : (selectGuru ? selectGuru.value : ''),
            kelasBimbingan: role === 'wali_kelas' ? (selectKelas ? selectKelas.value : '') : '',
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('sigma_session', JSON.stringify(sessionData));
        window.location.href = 'dashboard.html';
    });
}

// Fungsi Logout
function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('sigma_session');
        window.location.href = 'login.html';
    }
}
