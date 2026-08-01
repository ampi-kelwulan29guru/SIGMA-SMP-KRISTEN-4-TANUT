<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SIGMA EDU PRO</title>

    <!-- Bootstrap & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- CSS Lokal -->
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/responsive.css">

    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f8f9fa;
            padding-top: 35px;
            padding-bottom: 110px;
            margin: 0;
        }

        /* BINGKAI MOTIF TANIMBAR */
        .frame-tanimbar-top {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 30px;
            background-image: url('../assets/motif-tanimbar.jpg');
            background-position: top center;
            background-size: 100% auto;
            background-repeat: no-repeat;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .frame-tanimbar-bottom {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 95px;
            background-image: url('../assets/motif-tanimbar.jpg');
            background-position: bottom center;
            background-size: 100% auto;
            background-repeat: no-repeat;
            z-index: 9999;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.15);
        }

        /* SIDEBAR TANIMBAR */
        .sidebar-tanimbar {
            background: linear-gradient(180deg, #1a1a1a 0%, #800020 100%);
            border-radius: 16px;
            padding: 20px 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        .hero-banner {
            background: linear-gradient(90deg, #800020 0%, #1a1a1a 100%);
            border-radius: 16px;
            color: white;
            padding: 25px;
        }
    </style>
</head>
<body>

<!-- Bingkai Motif Top & Bottom -->
<div class="frame-tanimbar-top"></div>
<div class="frame-tanimbar-bottom"></div>

<div class="container-fluid px-4">
    <div class="row g-3">

        <!-- KIRI: SIDEBAR -->
        <div class="col-lg-2 col-md-3">
            <div class="sidebar-tanimbar text-white text-center">
                <div class="mb-3">
                    <img src="../assets/logoSMPK4.png" alt="Logo SMP Kristen 4 Tanut" class="img-fluid mb-2" style="max-width: 80px;" onerror="this.style.display='none'">
                    <h5 class="fw-bold mb-0">SIGMA EDU</h5>
                    <span class="badge bg-warning text-dark fw-bold mb-1">PRO</span>
                    <p class="small text-white-50 mb-0" style="font-size: 11px;">SMP Kristen 4 Tanut</p>
                </div>

                <hr class="border-warning opacity-50 my-2">

                <div class="nav flex-column gap-1 text-start">
                    <a class="nav-link active bg-warning text-dark fw-bold rounded-3 py-2 px-3" href="dashboard.html">
                        <i class="bi bi-speedometer2 me-2"></i>Dashboard
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="guru.html">
                        <i class="bi bi-person-badge me-2"></i>Data Guru
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="siswa.html">
                        <i class="bi bi-mortarboard me-2"></i>Data Siswa
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="kelas.html">
                        <i class="bi bi-building me-2"></i>Data Kelas
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="mapel.html">
                        <i class="bi bi-book me-2"></i>Mata Pelajaran
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="absensi.html">
                        <i class="bi bi-calendar-check me-2"></i>Absensi
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="jurnal.html">
                        <i class="bi bi-journal-bookmark me-2"></i>Jurnal Mengajar
                    </a>
                    <a class="nav-link text-white opacity-75 rounded-3 py-2 px-3" href="nilai.html">
                        <i class="bi bi-award me-2"></i>Nilai Siswa
                    </a>
                    <button class="btn btn-danger w-100 fw-semibold rounded-3 mt-3 py-2 shadow-sm" onclick="logout()">
                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>

        <!-- KANAN: KONTEN UTAMA -->
        <div class="col-lg-10 col-md-9">

            <!-- Banner Welcome -->
            <div class="hero-banner shadow-sm mb-4">
                <span class="badge bg-warning text-dark fw-bold mb-2"><i class="bi bi-star-fill me-1"></i> SIGMA EDU PRO TANIMBAR</span>
                <h2 class="fw-bold mb-1">Selamat Datang di SIGMA EDU PRO 👋</h2>
                <p class="mb-0 opacity-75">Sistem Informasi Administrasi Guru & Sekolah — SMP Kristen 4 Tanut</p>
            </div>

            <!-- RINGKASAN STATISTIK -->
            <div class="row g-3 mb-4">
                <!-- Card Total Guru -->
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-danger">
                        <div class="d-flex align-items-center">
                            <div class="bg-danger bg-opacity-10 text-danger p-3 rounded-3 me-3 fs-3">
                                <i class="bi bi-person-badge-fill"></i>
                            </div>
                            <div>
                                <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 11px;">Total Guru</small>
                                <h3 class="fw-bold mb-0 text-dark" id="totalGuruCount">0</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Total Siswa -->
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-success">
                        <div class="d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 text-success p-3 rounded-3 me-3 fs-3">
                                <i class="bi bi-mortarboard-fill"></i>
                            </div>
                            <div>
                                <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 11px;">Total Siswa</small>
                                <h3 class="fw-bold mb-0 text-dark" id="totalSiswaCount">0</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Total Kelas -->
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-warning">
                        <div class="d-flex align-items-center">
                            <div class="bg-warning bg-opacity-10 text-warning p-3 rounded-3 me-3 fs-3">
                                <i class="bi bi-building-fill"></i>
                            </div>
                            <div>
                                <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 11px;">Total Kelas</small>
                                <h3 class="fw-bold mb-0 text-dark" id="totalKelasCount">0</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Mata Pelajaran -->
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm rounded-4 p-3 h-100 border-start border-4 border-primary">
                        <div class="d-flex align-items-center">
                            <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-3 me-3 fs-3">
                                <i class="bi bi-book-fill"></i>
                            </div>
                            <div>
                                <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 11px;">Mata Pelajaran</small>
                                <h3 class="fw-bold mb-0 text-dark" id="totalMapelCount">0</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AKSES CEPAT MODUL -->
            <div class="card border-0 shadow-sm rounded-4 p-4">
                <h6 class="fw-bold text-dark mb-3"><i class="bi bi-grid-fill me-2 text-danger"></i>Akses Cepat Modul Administrasi</h6>
                <div class="row g-3">
                    <div class="col-md-3">
                        <a href="guru.html" class="btn btn-outline-danger w-100 py-3 rounded-4 text-start fw-semibold shadow-sm h-100">
                            <i class="bi bi-person-badge fs-3 d-block mb-1"></i>
                            Kelola Data Guru
                        </a>
                    </div>
                    <div class="col-md-3">
                        <a href="siswa.html" class="btn btn-outline-success w-100 py-3 rounded-4 text-start fw-semibold shadow-sm h-100">
                            <i class="bi bi-mortarboard fs-3 d-block mb-1"></i>
                            Kelola Data Siswa
                        </a>
                    </div>
                    <div class="col-md-3">
                        <a href="absensi.html" class="btn btn-outline-warning w-100 py-3 rounded-4 text-start fw-semibold shadow-sm h-100">
                            <i class="bi bi-calendar-check fs-3 d-block mb-1"></i>
                            Input Absensi
                        </a>
                    </div>
                    <div class="col-md-3">
                        <a href="jurnal.html" class="btn btn-outline-primary w-100 py-3 rounded-4 text-start fw-semibold shadow-sm h-100">
                            <i class="bi bi-journal-bookmark fs-3 d-block mb-1"></i>
                            Jurnal Mengajar
                        </a>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="../js/db.js"></script>
<script src="../js/auth.js"></script>

<!-- SCRIPT PENGHITUNG DATA DASHBOARD (IndexedDB) -->
<script>
    document.addEventListener("DOMContentLoaded", async function () {
        // 1. Jalankan Seeding awal jika belum ada data guru sama sekali
        if (typeof initDefaultData === "function") {
            await initDefaultData();
        }
        
        // 2. Tampilkan Hitungan Statistik
        await updateDashboardStats();
    });

    async function updateDashboardStats() {
        try {
            const dataGuru = await getAllData('guru');
            const dataSiswa = await getAllData('siswa');
            const dataKelas = await getAllData('kelas');
            const dataMapel = await getAllData('mapel');

            document.getElementById("totalGuruCount").innerText = dataGuru.length;
            document.getElementById("totalSiswaCount").innerText = dataSiswa.length;
            document.getElementById("totalKelasCount").innerText = dataKelas.length;
            document.getElementById("totalMapelCount").innerText = dataMapel.length;
        } catch (err) {
            console.error("Gagal mengambil data IndexedDB:", err);
        }
    }
</script>

</body>
</html>
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains('guru')) {
                db.createObjectStore('guru', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('siswa')) {
                db.createObjectStore('siswa', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('kelas')) {
                db.createObjectStore('kelas', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('mapel')) {
                db.createObjectStore('mapel', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('absensi')) {
                db.createObjectStore('absensi', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('jurnal')) {
                db.createObjectStore('jurnal', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('nilai')) {
                db.createObjectStore('nilai', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = async () => {
            const db = request.result;
            
            // CEK & ISI DATA DEFAULT OTOMATIS
            const tx = db.transaction('guru', 'readonly');
            const store = tx.objectStore('guru');
            const req = store.getAll();
            req.onsuccess = () => {
                if (req.result.length === 0) {
                    const writeTx = db.transaction('guru', 'readwrite');
                    writeTx.objectStore('guru').add({
                        nip: "198203212008041002",
                        nama: "Edy Wenan S. Slarmanat, S.Pd",
                        mapel: "Kepala Sekolah",
                        hp: "082397523433"
                    });
                }
            };
            
            resolve(db);
        };
        
        request.onerror = () => reject(request.error);
    });
}
});
