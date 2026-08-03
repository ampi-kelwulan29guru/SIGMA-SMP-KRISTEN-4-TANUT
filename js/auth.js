document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
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

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('login.html');

    const repoPath = getRepoPath();

    // Jika belum login & mencoba buka halaman dalam -> lempar ke login
    if (!session && !isLoginPage) {
        window.location.href = `${repoPath}/index.html`;
        return;
    }

    // Jika sudah login & membuka halaman login -> lempar ke dashboard
    if (session && isLoginPage) {
        window.location.href = `${repoPath}/pages/dashboard.html`;
        return;
    }

    // Jika sudah login & ada di halaman dalam
    if (session && !isLoginPage) {
        applyRolePermissions(session);
        renderUserProfileHeader(session);
    }
}

// Logika Form Login
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputIdentity = document.getElementById('loginUser').value.trim();
        const inputPass = document.getElementById('loginPass').value.trim();

        // 1. Cek Akun Admin
        const customPassAdmin = localStorage.getItem('sigma_pass_admin');
        const validAdminPass = customPassAdmin || 'admin123';
        
        if (inputIdentity.toLowerCase() === 'admin' && inputPass === validAdminPass) {
            saveSessionAndRedirect({
                role: 'admin',
                username: 'admin',
                namaGuru: 'Administrator',
                kelasBimbingan: ''
            });
            return;
        }

        // 2. Ambil Daftar Guru dari Database Local/IndexedDB (bila ada)
        let listGuru = [];
        if (typeof getAllData === 'function') {
            listGuru = await getAllData('guru').catch(() => []);
            if (!listGuru || listGuru.length === 0) {
                listGuru = await getAllData('data_guru').catch(() => []);
            }
        }

        // 3. Cari Guru berdasarkan NIP, NIK, atau Username
        const foundGuru = listGuru.find(g => {
            const nip = (g.nip || g.nipGuru || '').toString().trim();
            const nik = (g.nik || g.nikGuru || '').toString().trim();
            const uname = (g.username || '').toString().trim();

            return (nip && nip === inputIdentity) || 
                   (nik && nik === inputIdentity) || 
                   (uname && uname.toLowerCase() === inputIdentity.toLowerCase());
        });

        if (foundGuru) {
            const isWaliKelas = foundGuru.isWaliKelas || foundGuru.jabatan?.toLowerCase().includes('wali') || Boolean(foundGuru.kelasBimbingan);
            const userRole = isWaliKelas ? 'wali_kelas' : 'guru_mapel';

            const defaultPass = isWaliKelas ? 'wali123' : 'guru123';
            const customPass = localStorage.getItem(`sigma_pass_${inputIdentity}`);
            const validPassword = customPass || defaultPass;

            if (inputPass === validPassword) {
                saveSessionAndRedirect({
                    role: userRole,
                    username: inputIdentity,
                    namaGuru: foundGuru.nama || foundGuru.namaGuru,
                    kelasBimbingan: foundGuru.kelasBimbingan || foundGuru.kelas || '',
                    mapel: foundGuru.mapel || foundGuru.mataPelajaran || '',
                    nipNik: inputIdentity
                });
            } else {
                alert('Password salah! Silakan coba lagi.');
            }
        } else {
            alert('Akses Ditolak: Username/NIP/NIK tidak terdaftar!');
        }
    });
}

function saveSessionAndRedirect(sessionData) {
    sessionData.loginTime = new Date().toISOString();
    localStorage.setItem('sigma_session', JSON.stringify(sessionData));
    
    const repoPath = getRepoPath();
    // Redirect langsung ke dashboard
    window.location.href = `${repoPath}/pages/dashboard.html`;
}

function applyRolePermissions(session) {
    const role = session.role;

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    if (role === 'guru_mapel') {
        const navGuru = document.querySelector('a[href="guru.html"]');
        const navKelas = document.querySelector('a[href="kelas.html"]');
        if (navGuru && navGuru.parentElement) navGuru.parentElement.style.display = 'none';
        if (navKelas && navKelas.parentElement) navKelas.parentElement.style.display = 'none';
    }

    if (role !== 'admin') {
        document.querySelectorAll('.btn-tambah-master, .btn-hapus-master, .btn-edit-master').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

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

function logout() {
    localStorage.removeItem('sigma_session');
    const repoPath = getRepoPath();
    window.location.href = `${repoPath}/index.html`;
}
