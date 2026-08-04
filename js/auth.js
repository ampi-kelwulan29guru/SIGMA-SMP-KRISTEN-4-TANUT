document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initLoginForm();
});

// Deteksi otomatis nama repositori GitHub Pages
function getRepoPath() {
    const pathParts = window.location.pathname.split('/');
    // Jika diakses via GitHub Pages (misal /SIGMA-SMPK4TANUT/...)
    if (pathParts.length > 1 && pathParts[1] !== '' && !pathParts[1].includes('.html')) {
        return `/${pathParts[1]}`;
    }
    return '';
}

// Cek Status Autentikasi Pengguna saat Halaman Dimuat
function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('login.html');
    const repoPath = getRepoPath();

    // 1. Jika BELUM login & mencoba buka halaman dalam -> lempar ke login
    if (!session && !isLoginPage) {
        window.location.href = `${repoPath}/index.html`;
        return;
    }

    // 2. Jika SUDAH login & membuka halaman login -> lempar ke dashboard
    if (session && isLoginPage) {
        window.location.href = `${repoPath}/pages/dashboard.html`;
        return;
    }

    // 3. Jika SUDAH login & sedang di halaman dalam
    if (session && !isLoginPage) {
        applyRolePermissions(session);
        renderUserProfileHeader(session);
    }
}

// Inisialisasi Event Listener Form Login
function initLoginForm() {
    const formLogin = document.getElementById('formLogin') || document.querySelector('form');
    if (!formLogin) return;

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Mengambil input dari form (Mendukung ID khusus atau selektor tipe)
        const userInput = document.getElementById('loginUser') || document.querySelector('input[type="text"]');
        const passInput = document.getElementById('loginPass') || document.querySelector('input[type="password"]');

        if (!userInput || !passInput) {
            alert('Elemen form login tidak ditemukan!');
            return;
        }

        const inputIdentity = userInput.value.trim();
        const inputPass = passInput.value.trim();

        if (!inputIdentity || !inputPass) {
            alert('Username/NIP/NIK dan Password tidak boleh kosong!');
            return;
        }

        // ==========================================
        // 1. CEK KHUSUS AKUN ADMIN (Prioritas Utama)
        // ==========================================
        const customPassAdmin = localStorage.getItem('sigma_pass_admin');
        const validAdminPass = customPassAdmin || 'admin123';

        if (inputIdentity.toLowerCase() === 'admin') {
            if (inputPass === validAdminPass) {
                // Hapus data sesi lama agar tidak bentrok
                localStorage.removeItem('sigma_session');

                saveSessionAndRedirect({
                    role: 'admin',
                    username: 'admin',
                    namaGuru: 'Administrator Sekolah',
                    kelasBimbingan: ''
                });
            } else {
                alert('Password Admin salah! Silakan coba lagi.');
            }
            return; // Hentikan eksekusi, jangan lanjut ke pencarian guru
        }

        // ==========================================
        // 2. CEK AKUN GURU (Pencarian Database Local/IndexedDB)
        // ==========================================
        let listGuru = [];
        if (typeof getAllData === 'function') {
            listGuru = await getAllData('guru').catch(() => []);
            if (!listGuru || listGuru.length === 0) {
                listGuru = await getAllData('data_guru').catch(() => []);
            }
        }

        // Cari Guru berdasarkan NIP, NIK, atau Username
        const foundGuru = listGuru.find(g => {
            const nip = (g.nip || g.nipGuru || '').toString().trim();
            const nik = (g.nik || g.nikGuru || '').toString().trim();
            const uname = (g.username || '').toString().trim();

            return (nip && nip === inputIdentity) || 
                   (nik && nik === inputIdentity) || 
                   (uname && uname.toLowerCase() === inputIdentity.toLowerCase());
        });

        if (foundGuru) {
            const isWaliKelas = foundGuru.isWaliKelas || 
                               (foundGuru.jabatan && foundGuru.jabatan.toLowerCase().includes('wali')) || 
                               Boolean(foundGuru.kelasBimbingan);
            const userRole = isWaliKelas ? 'wali_kelas' : 'guru_mapel';

            const defaultPass = isWaliKelas ? 'wali123' : 'guru123';
            const customPass = localStorage.getItem(`sigma_pass_${inputIdentity}`);
            const validPassword = customPass || defaultPass;

            if (inputPass === validPassword) {
                // Hapus data sesi lama agar tidak bentrok
                localStorage.removeItem('sigma_session');

                saveSessionAndRedirect({
                    role: userRole,
                    username: inputIdentity,
                    namaGuru: foundGuru.nama || foundGuru.namaGuru,
                    kelasBimbingan: foundGuru.kelasBimbingan || foundGuru.kelas || '',
                    mapel: foundGuru.mapel || foundGuru.mataPelajaran || '',
                    nipNik: inputIdentity
                });
            } else {
                alert('Password guru salah! Silakan coba lagi.');
            }
        } else {
            alert('Akses Ditolak: Username/NIP/NIK tidak terdaftar!');
        }
    });
}

// Simpan Sesi dan Alihkan Halaman ke Dashboard
function saveSessionAndRedirect(sessionData) {
    sessionData.loginTime = new Date().toISOString();
    localStorage.setItem('sigma_session', JSON.stringify(sessionData));
    
    const repoPath = getRepoPath();
    window.location.href = `${repoPath}/pages/dashboard.html`;
}

// Menerapkan Pembatasan Hak Akses (Role Permissions) di Interface
function applyRolePermissions(session) {
    const role = session.role;

    // -----------------------------------------------------------
    // Sembunyikan Tombol "Sinkron Data" khusus untuk Admin
    // -----------------------------------------------------------
    const btnSinkron = Array.from(document.querySelectorAll('button, a')).find(
        el => el.textContent.toLowerCase().includes('sinkron data')
    );

    if (btnSinkron) {
        if (role === 'admin') {
            btnSinkron.style.display = 'none'; // Sembunyikan jika Admin
        } else {
            btnSinkron.style.display = 'inline-flex'; // Tampilkan untuk Guru/Wali Kelas
        }
    }

    // Pembatasan elemen khusus admin
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    // Pembatasan menu navigasi untuk Guru Mapel
    if (role === 'guru_mapel') {
        const navGuru = document.querySelector('a[href="guru.html"]');
        const navKelas = document.querySelector('a[href="kelas.html"]');
        if (navGuru && navGuru.parentElement) navGuru.parentElement.style.display = 'none';
        if (navKelas && navKelas.parentElement) navKelas.parentElement.style.display = 'none';
    }

    // Sembunyikan tombol manajemen data master untuk non-admin
    if (role !== 'admin') {
        document.querySelectorAll('.btn-tambah-master, .btn-hapus-master, .btn-edit-master').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Menampilkan Badge Profil Pengguna di Header
function renderUserProfileHeader(session) {
    const userBadgeContainer = document.getElementById('userProfileBadge');
    if (!userBadgeContainer) return;

    const badgeColor = session.role === 'admin' ? 'bg-danger' : (session.role === 'wali_kelas' ? 'bg-warning text-dark' : 'bg-info text-dark');
    const labelRole = session.role === 'admin' ? 'ADMINISTRATOR' : (session.role === 'wali_kelas' ? `WALI KELAS (${session.kelasBimbingan})` : 'GURU MAPEL');

    userBadgeContainer.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span class="badge ${badgeColor} px-3 py-2 rounded-pill fw-bold">${labelRole}</span>
            <span class="fw-semibold text-dark">${session.namaGuru}</span>
        </div>
    `;
}

// Fungsi Logout Pengguna
function logout() {
    localStorage.removeItem('sigma_session');
    const repoPath = getRepoPath();
    window.location.href = `${repoPath}/index.html`;
}
