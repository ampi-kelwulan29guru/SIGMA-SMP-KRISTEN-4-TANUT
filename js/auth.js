// ======================================
// SIGMA EDU PRO
// Sistem Login Guru
// ======================================

const USERNAME = "admin";
const PASSWORD = "12345";

// Fungsi Login
function loginGuru() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === USERNAME && password === PASSWORD) {

        localStorage.setItem("login", "true");

        alert("Login berhasil!");

        window.location.href = "pages/dashboard.html";

    } else {

        alert("Username atau Password salah!");

    }

}

// Tombol Enter
document.addEventListener("keydown", function(e){

    if(e.key==="Enter"){
        loginGuru();
    }

});

// Logout
function logout(){

    localStorage.removeItem("login");

    window.location.href="../index.html";

}
