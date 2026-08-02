document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname.endsWith('index.html');

    if (!session && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    if (session && isLoginPage) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (session && !isLoginPage) {
        applyRolePermissions(session);
    }
}

// Logika Login Otomatis berdasarkan Identitas
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputIdentity = document.getElementById('loginUser').value.trim();
        const inputPass = document.getElementById('loginPass').value.trim();

        // 1. Cek jika Akun Administrator
        if (inputIdentity.toLowerCase() === 'admin' && inputPass === 'admin123') {
            saveSessionAndRedirect({
                role: 'admin',
                username: 'admin',
                namaGuru: 'Administrator',
                kelasBimbingan: ''
            });
            return;
        }

        // 2. Ambil Daftar Guru dari Database
        let listGuru = await getAllData('guru').catch(() => []);
        if (!listGuru || listGuru.length === 0) {
            listGuru = await getAllData('data_guru').catch(() => []);
        }

        // 3. Cari Guru Berdasarkan NIP, NIK, atau Username
        const foundGuru = listGuru.find(g => {
            const nip = (g.nip || g.nipGuru || '').toString().trim();
            const nik = (g.nik || g.nikGuru || '').toString().trim();
            const uname = (g.username || '').toString().trim();

            return (nip && nip === inputIdentity) || 
                   (nik && nik === inputIdentity) || 
                   (uname && uname.toLowerCase() === inputIdentity.toLowerCase());
        });

        if (foundGuru) {
            // Tentukan Peran Otomatis (Wali Kelas atau Guru Mapel)
            const isWaliKelas = foundGuru.isWaliKelas || foundGuru.jabatan?.toLowerCase().includes('wali') || Boolean(foundGuru.kelasBimbingan);
            const userRole = isWaliKelas ? 'wali_kelas' : 'guru_mapel';

            saveSessionAndRedirect({
                role: userRole,
                username: inputIdentity,
                namaGuru: foundGuru.nama || foundGuru.namaGuru,
                kelasBimbingan: foundGuru.kelasBimbingan || foundGuru.kelas || '',
                nipNik: inputIdentity
            });
        } else {
            alert('Akses Ditolak: NIP, NIK, atau Username tidak terdaftar dalam database guru!');
        }
    });
}

function saveSessionAndRedirect(sessionData) {
    sessionData.loginTime = new Date().toISOString();
    localStorage.setItem('sigma_session', JSON.stringify(sessionData));
    window.location.href = 'dashboard.html';
}

// Pembatasan Akses Menu Sesuai Peran Otomatis
function applyRolePermissions(session) {
    const currentPage = window.location.pathname.split('/').pop();

    if (session.role === 'guru_mapel') {
        hideSidebarLinks(['guru.html', 'siswa.html', 'kelas.html', 'mapel.html']);
        if (['guru.html', 'siswa.html', 'kelas.html', 'mapel.html'].includes(currentPage)) {
            alert('Akses Ditolak: Halaman Master Data khusus Administrator.');
            window.location.href = 'dashboard.html';
        }
    } else if (session.role === 'wali_kelas') {
        hideSidebarLinks(['guru.html', 'mapel.html']);
        if (['guru.html', 'mapel.html'].includes(currentPage)) {
            alert('Akses Ditolak: Fitur ini khusus Administrator.');
            window.location.href = 'dashboard.html';
        }
    }
}

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

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.removeItem('sigma_session');
        window.location.href = 'login.html';
    }
}
