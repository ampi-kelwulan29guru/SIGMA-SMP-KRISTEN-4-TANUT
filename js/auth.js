document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // 1. Fitur Toggle Intip Password (Lihat/Sembunyikan)
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = togglePasswordBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    }

    // 2. Fitur Proses Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInputValue = passwordInput.value.trim();

            // Sederhana: Membuka akses masuk
            if (usernameInput !== "" && passwordInputValue !== "") {
                
                // Simpan status session login
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userNip', usernameInput);

                // PENGAHAN UTAMA: Langsung diarahkan ke Halaman Dashboard
                window.location.href = "pages/dashboard.html";
                
            } else {
                alert("Silakan masukkan NIP/NIK dan Password Anda.");
            }
        });
    }
});

// Fungsi Logout untuk digunakan di sidebar semua halaman
function logout() {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
        sessionStorage.clear();
        // Kembalikan ke halaman login utama (index.html)
        window.location.href = "../index.html";
    }
}
