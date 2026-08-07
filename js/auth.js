document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initLoginForm();
});

// -----------------------------------------------------------
// DAFTAR AKUN LOKAL UTAMA (GURU MAPEL & WALI KELAS)
// -----------------------------------------------------------
const users = [
  // ================= GURU MAPEL =================
  // Password default untuk semua Guru Mapel: guru123
  {
    username: "Ester Nonia Leanwatu, S.th.Pak",
    nip: "198311062011012016",
    password: "guru123",
    nama: "Ester Nonia Leanwatu, S.th.Pak",
    role: "GURU MAPEL"
  },
  {
    username: "Abraham Kelwulan",
    nip: "8171012904000003",
    password: "guru123",
    nama: "Abraham Kelwulan",
    role: "GURU MAPEL"
  },
    {
    username: "Edy Wenan S. Slarmanat, S.Pd",
    nip: "198203212008041002",
    password: "guru123",
    nama: "Edy Wenan S. Slarmanat, S.Pd",
    role: "GURU MAPEL"
  },
{
    username: "Yakomina Wahelatoan, S.Pd",
    nip: "8103067112960001",
    password: "guru123",
    nama: "Yakomina Wahelatoan, S.Pd",
    role: "GURU MAPEL"
  },
{
    username: "Susi Selpisina Enus",
    nip: "8171036508930005",
    password: "guru123",
    nama: "Susi Selpisina Enus",
    role: "GURU MAPEL"
  },
{
    username: "Desiana Walun, S.Pd",
    nip: "8103067012990001",
    password: "guru123",
    nama: "Desiana Walun, S.Pd",
    role: "GURU MAPEL"
  },
{
    username: "Baceria Werluka, S.Pd",
    nip: "8103066207030001",
    password: "guru123",
    nama: "Baceria Werluka, S.Pd",
    role: "GURU MAPEL"
  },
{
    username: "Samuel Lamberth Talik, S.Pd",
    nip: "8103052804940002",
    password: "guru123",
    nama: "Samuel Lamberth Talik, S.Pd",
    role: "GURU MAPEL"
  },

  // ================= WALI KELAS =================
  // Password default untuk semua Wali Kelas: wali123
  {
    username: "Samuel Lamberth Talik, S.Pd",
    nip: "8103052804940002",
    password: "wali123",
    nama: "Samuel Lamberth Talik, S.Pd",
    role: "WALI KELAS",
    kelasBimbingan: "7A"
  },
  {
    username: "Ester Nonia Leanwatu, S.th.Pak",
    nip: "198311062011012016",
    password: "wali123",
    nama: "Ester Nonia Leanwatu, S.th.Pak",
    role: "WALI KELAS",
    kelasBimbingan: "8A"
  },
 {
    username: "Desiana Walun, S.Pd",
    nip: "8103067012990001",
    password: "wali123",
    nama: "Desiana Walun, S.Pd",
    role: "WALI KELAS",
    kelasBimbingan: "9A"
  },
];

// Deteksi otomatis nama repositori GitHub Pages
function getRepoPath() {
    const pathParts = window.location.pathname.split('/');
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
            return;
        }

        // ==========================================
        // 2. CEK AKUN GURU (Array Users + Variable Global + IndexedDB)
        // ==========================================
        let listGuru = [...users];

        // Ambil data dari variabel global db.js (jika ada)
        if (typeof window.dbGuru !== 'undefined' && Array.isArray(window.dbGuru)) {
            listGuru = [...listGuru, ...window.dbGuru];
        }
        if (typeof window.dataGuru !== 'undefined' && Array.isArray(window.dataGuru)) {
            listGuru = [...listGuru, ...window.dataGuru];
        }

        // Ambil data dari IndexedDB (jika fungsi tersedia)
        if (typeof getAllData === 'function') {
            const dbGuru = await getAllData('guru').catch(() => []);
            const dbDataGuru = await getAllData('data_guru').catch(() => []);
            listGuru = [...listGuru, ...dbGuru, ...dbDataGuru];
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
            // Tentukan Peran (Wali Kelas / Guru Mapel)
            const isWaliKelas = foundGuru.role === 'WALI KELAS' || 
                               foundGuru.isWaliKelas || 
                               (foundGuru.jabatan && foundGuru.jabatan.toLowerCase().includes('wali')) || 
                               Boolean(foundGuru.kelasBimbingan);

            const userRole = isWaliKelas ? 'wali_kelas' : 'guru_mapel';
            
            // Password bawaan: wali123 atau guru123
            const defaultPass = foundGuru.password || (isWaliKelas ? 'wali123' : 'guru123');
            const customPass = localStorage.getItem(`sigma_pass_${inputIdentity}`);
            const validPassword = customPass || defaultPass;

            if (inputPass === validPassword) {
                localStorage.removeItem('sigma_session');

                saveSessionAndRedirect({
                    role: userRole,
                    username: inputIdentity,
                    namaGuru: foundGuru.nama || foundGuru.namaGuru || 'Guru SIGMA',
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

    // 1. Sembunyikan Tombol "Sinkron Data" khusus untuk Admin
    const btnSinkron = Array.from(document.querySelectorAll('button, a')).find(
        el => el.textContent.toLowerCase().includes('sinkron data')
    );

    if (btnSinkron) {
        btnSinkron.style.display = role === 'admin' ? 'none' : 'inline-flex';
    }

    // 2. Sembunyikan Elemen Khusus Admin & Tombol "Tambah Siswa Baru"
    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.btn-tambah-master, .btn-hapus-master, .btn-edit-master').forEach(btn => {
            btn.style.display = 'none';
        });

        Array.from(document.querySelectorAll('button, a')).forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes('tambah siswa') || text.includes('tambah peserta')) {
                el.style.display = 'none';
            }
        });
    }

    // 3. Pembatasan menu navigasi untuk Guru Mapel
    if (role === 'guru_mapel') {
        const navGuru = document.querySelector('a[href="guru.html"]');
        const navKelas = document.querySelector('a[href="kelas.html"]');
        if (navGuru && navGuru.parentElement) navGuru.parentElement.style.display = 'none';
        if (navKelas && navKelas.parentElement) navKelas.parentElement.style.display = 'none';
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
