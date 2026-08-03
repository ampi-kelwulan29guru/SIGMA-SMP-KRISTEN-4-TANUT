// Dapatkan nama repositori secara dinamis (contoh: "/SIGMA-SMPK4TANUT")
const REPO_NAME = window.location.pathname.split('/')[1] 
    ? `/${window.location.pathname.split('/')[1]}` 
    : '';

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('sigma_session'));
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('login.html');

    // Jika belum login, paksa ke index.html di root repositori
    if (!session && !isLoginPage) {
        window.location.href = `${REPO_NAME}/index.html`;
        return;
    }

    // Jika sudah login tapi ada di halaman login, paksa ke dashboard
    if (session && isLoginPage) {
        window.location.href = `${REPO_NAME}/pages/dashboard.html`;
        return;
    }

    if (session && !isLoginPage) {
        applyRolePermissions(session);
        renderUserProfileHeader(session);
    }
}

function saveSessionAndRedirect(sessionData) {
    sessionData.loginTime = new Date().toISOString();
    localStorage.setItem('sigma_session', JSON.stringify(sessionData));
    
    // Pengalihan absolut ke dashboard
    window.location.href = `${REPO_NAME}/pages/dashboard.html`;
}

function logout() {
    // Pengalihan absolut ke halaman logout
    window.location.href = `${REPO_NAME}/pages/logout.html`;
}
