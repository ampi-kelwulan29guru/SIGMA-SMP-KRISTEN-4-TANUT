document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('login.html');

    // Jika belum login dan tidak sedang di halaman utama/login
    if (!session && !isLoginPage) {
        window.location.href = path.includes('/pages/') ? '../index.html' : 'index.html';
        return;
    }

    // Jika sudah login tapi masih di halaman utama/login
    if (session && isLoginPage) {
        window.location.href = path.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
        return;
    }

    // Jalankan hak akses & render profil jika sudah login
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

        // 2. Ambil Daftar Guru dari Database Local/IndexedDB
        let listGuru = await getAllData('guru').catch(() => []);
        if (!listGuru || listGuru.length === 0) {
            listGuru = await getAllData('data_guru').catch(() => []);
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

            // Password default & password kustom
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
            alert('Akses Ditolak: NIP, NIK, atau Username tidak terdaftar!');
        }
    });
}

function saveSessionAndRedirect(sessionData) {
    sessionData.loginTime = new Date().toISOString();
    localStorage.setItem('sigma_session', JSON.stringify(sessionData));
    
    // Deteksi lokasi path agar tidak terjadi penumpukan '/pages/pages/'
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'pages/dashboard.html';
    }
}

// ==========================================
// KONTROL HAK AKSES PERAN (RBAC INTEGRATION)
// ==========================================

function applyRolePermissions(session) {
    const role = session.role;

    if (role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }

    if (role === 'guru_mapel') {
        const navGuru = document.querySelector('a[href="guru.html"]');
        const navKelas = document.querySelector('a[href="kelas.html"]');
        if (navGuru) navGuru.parentElement.style.display = 'none';
        if (navKelas) navKelas.parentElement.style.display = 'none';
    }

    if (role !== 'admin') {
        document.querySelectorAll('.btn-tambah-master, .btn-hapus-master, .btn-edit-master').forEach(btn => {
            btn.style.display = 'none';
        });
    }

    filterFormOptionsByRole(session);
}

function filterFormOptionsByRole(session) {
    const selectKelas = document.getElementById('selectKelas');
    const selectMapel = document.getElementById('selectMapel');

    if (session.role === 'wali_kelas' && selectKelas && session.kelasBimbingan) {
        selectKelas.value = session.kelasBimbingan;
        selectKelas.setAttribute('disabled', 'disabled');
    }

    if (session.role === 'guru_mapel' && selectMapel && session.mapel) {
        selectMapel.value = session.mapel;
        selectMapel.setAttribute('disabled', 'disabled');
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
            <button class="btn btn-sm btn-outline-secondary rounded-circle ms-1" onclick="openChangePasswordModal()" title="Ganti Password">
                <i class="bi bi-key-fill"></i>
            </button>
        </div>
    `;
}

function openChangePasswordModal() {
    let modalElement = document.getElementById('modalChangePassword');
    if (!modalElement) {
        const modalHtml = `
        <div class="modal fade" id="modalChangePassword" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title"><i class="bi bi-key-fill me-2"></i>Ganti Password</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formGantiPassword">
                            <div class="mb-3">
                                <label class="form-label small fw-semibold">Password Saat Ini</label>
                                <input type="password" id="oldPassword" class="form-control" required placeholder="Masukkan password lama">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-semibold">Password Baru</label>
                                <input type="password" id="newPassword" class="form-control" minlength="6" required placeholder="Minimal 6 karakter">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-semibold">Konfirmasi Password Baru</label>
                                <input type="password" id="confirmPassword" class="form-control" minlength="6" required placeholder="Ulangi password baru">
                            </div>
                            <button type="submit" class="btn btn-primary w-100 mt-2">Simpan Password Baru</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalElement = document.getElementById('modalChangePassword');
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    document.getElementById('formGantiPassword').onsubmit = (e) => {
        e.preventDefault();
        const session = JSON.parse(localStorage.getItem('sigma_session'));
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        const defaultPass = session.role === 'admin' ? 'admin123' : (session.role === 'wali_kelas' ? 'wali123' : 'guru123');
        const customPass = localStorage.getItem(`sigma_pass_${session.username}`);
        const currentValidPass = customPass || defaultPass;

        if (oldPass !== currentValidPass) {
            alert('Password saat ini salah!');
            return;
        }

        if (newPass !== confirmPass) {
            alert('Konfirmasi password baru tidak cocok!');
            return;
        }

        localStorage.setItem(`sigma_pass_${session.username}`, newPass);
        alert('Password berhasil diperbarui! Gunakan password baru untuk login berikutnya.');
        modal.hide();
    };
}

function logout() {
    const path = window.location.pathname;
    window.location.href = path.includes('/pages/') ? 'logout.html' : 'pages/logout.html';
}
