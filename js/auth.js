// ======================================
// SIGMA EDU PRO
// Modul Login
// ======================================

// Tombol tampil/sembunyikan password
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", function () {

        const type =
            passwordInput.getAttribute("type") === "password"
                ? "text"
                : "password";

        passwordInput.setAttribute("type", type);

        this.innerHTML =
            type === "password"
                ? '<i class="bi bi-eye"></i>'
                : '<i class="bi bi-eye-slash"></i>';

    });

}

// Login sederhana
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Username dan password sementara
        if (username === "admin" && password === "12345") {

            alert("Login berhasil!");

            window.location.href = "pages/dashboard.html";

        } else {

            alert("NIP/NIK atau Password salah!");

        }

    });

}
