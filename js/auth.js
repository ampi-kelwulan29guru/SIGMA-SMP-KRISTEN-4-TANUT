// ======================================
// SIGMA EDU PRO - LOGIN
// ======================================

console.log("AUTH.JS BERHASIL DIMUAT");

const USERNAME = "admin";
const PASSWORD = "12345";

// Tunggu halaman selesai dimuat
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        console.log(username, password);

        if (username === USERNAME && password === PASSWORD) {

            localStorage.setItem("login", "true");

            alert("Login berhasil!");

            window.location.href = "pages/dashboard.html";

        } else {

            alert("Username atau Password salah!");

        }

    });

});
