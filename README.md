# 🩺 HealVelo PhysioKit & Clinical EHR
---

## 📂 Struktur Modul & Fitur Aplikasi

---

### 1. 🔐 Modul Autentikasi & Manajemen Akun (`Auth`)
* **Registrasi Akun Praktisi:** Pendaftaran akun baru bagi mahasiswa praktikan maupun dosen/clinical educator dengan validasi ketat.
* **Manajemen Peran (*Role-Based Access*):** Pembagian hak akses terstruktur antara `mahasiswa` dan `supervisor`.
* **Relasi Pembimbing Otomatis:** Akun mahasiswa terhubung langsung ke supervisor yang membimbingnya untuk validasi dokumen klinis.
* **Keamanan Sesi & Kredensial:** Dilengkapi proteksi *rate limiting* untuk mencegah brute-force login, opsi *remember me*, serta fitur intip kata sandi (*toggle password visibility*).

---

### 2. 📊 Modul Dashboard Overview (`Dashboard`) BELUM DI PERBARUI LEBIH LANJUT
* **Statistik Cepat Klinis:** Kartu metrik *real-time* yang menampilkan total pasien terdaftar, asesmen yang tersimpan, program intervensi FITT yang aktif, serta laporan ICF yang diterbitkan.
* **Akses Pintas Cepat (*Quick Actions*):** Tombol pintas untuk segera memulai pendaftaran pasien baru, membuka formulir asesmen fisioterapi, atau melihat rekam jejak evaluasi.
* **Identitas Pengguna Aktif:** Menampilkan nama praktisi yang sedang bertugas beserta badge perannya (`Mahasiswa` atau `Supervisor`).

---

### 3. 👥 Modul Direktori Pasien (`Patients`)
* **Pendaftaran Pasien Baru:** Input terstruktur mencakup identitas personal (Nama, Usia, Jenis Kelamin, Pekerjaan, Agama, Alamat), diagnosis rujukan medis, serta instruksi umum.
* **Generator No. Rekam Medis (RM) Otomatis:** Sistem penomoran nomor rekam medis berurutan berbasis basis data.
* **Pencarian & Paginasi Data:** Daftar pasien dilengkapi penomoran halaman (*pagination*) dan status keluhan terkini.
* **Lampiran Dokumen Medis:** Fitur unggah berkas penunjang (hasil rontgen, radiologi, atau surat rujukan dokter) dengan penyajian berkas yang aman.
* **Profil Pasien Komprehensif (`Patients/Show`):** Halaman riwayat terpadu yang merangkum seluruh asesmen fisioterapi sebelumnya, laporan ICF, dan grafik evaluasi perkembangan pasien.

---

### 4. 🧰 Modul PhysioKit & Asesmen Klinis (`PhysioKit/Assessment`)
* **Smart Age Detection (Deteksi Usia Cerdas):**
  * **Usia $\le$ 12 Tahun:** Sistem secara otomatis mengunci formulir ke **Mode Pediatrik (Tumbuh Kembang Anak)**.
  * **Usia $>$ 12 Tahun:** Sistem secara otomatis mengunci ke **Mode Dewasa / Muskuloskeletal Umum**.
* **Alur Formulir 3 Tahap Terarah:**
  * **Tahap 1 (Data Subjektif):** Keluhan utama, RPS, anamnesis sistemik organ tubuh, serta pemisahan otomatis antara riwayat *Prenatal, Natal, Postnatal* (kasus anak) dan *RPD, RPP, Riwayat Keluarga* (kasus dewasa).
  * **Tahap 2 (Data Objektif):** Tanda-tanda vital lengkap, inspeksi statis/dinamis, palpasi, perkusi refleks, dan tabel Gerakan Dasar 1.6 (Aktif, Pasif dengan *End-Feel*, dan Isometrik melawan tahanan).
  * **Tahap 3 (Pengukuran Terstandar & Uji Klinis):** Penilaian derajat nyeri (NRS Diam, Tekan, Gerak), tabel Manual Muscle Testing (MMT), Lingkup Gerak Sendi (LGS/ROM metode SFTR dengan format strip otomatis), instrumen sensorik terpadu (*Sensibilitas 5 Sistem*), serta uji klinis spesifik (*Special Tests* dinamis).
* **Audit Formulir Mandiri (*Check Form Modal*):** Fitur inspeksi kelengkapan form sebelum disimpan, memandu praktisi langsung ke kolom yang belum lengkap dengan animasi sorot fokus.
* **Penyimpanan Draf Lokal Otomatis (*Auto-Save & Restore Draft*):** Menjaga data input praktisi di *localStorage* agar tidak hilang jika terjadi kendala browser atau jaringan.

---

### 5. 📄 Modul Lembar Status Klinik ICF (`PhysioKit/TreatmentPlan`)
* **Tata Letak Baku Form Kepaniteraan Klinis II UMS:** Format matriks tabel formal yang disesuaikan secara presisi dengan berkas standar laporan klinik kepaniteraan fisioterapi.
* **Kop Surat Dinamis & Fleksibel:**
  * Pilihan Kop Resmi UMS.
  * Pilihan Tanpa Kop (Polos).
  * Pilihan Unggah Banner/Logo Kop Fasilitas Kesehatan (RS/Klinik) yang tersimpan permanen per akun pengguna.
* **Panah Dua Arah $(\longleftrightarrow)$:** Penanda visual sejajar di garis pembatas tengah yang memisahkan seksi *Subjective (S)* dan *Objective (O)*.
* **Pemetaan Diagnosis 5 Pilar ICF:** Tabel terstruktur mencakup *Body Function & Structure (A)*, *Activities (B)*, *Participation (C)*, serta faktor kontekstual *Personal (D)* dan *Environmental (E)*.
* **Program Terapi Dosis FITT:** Perumusan tujuan jangka pendek/panjang serta kartu program terapi terukur (*Frequency, Intensity, Time, Type*).
* **Tabel Komparasi Evaluasi Presisi:** Matriks berkala pemantau kemajuan terapi ($T_1, T_2, T_3, \dots$) pada skor GMFM, tingkat GMFCS, spastisitas otot (Modified Ashworth Scale), dan kekuatan otot (MMT) dengan lebar kolom terkunci (*fixed layout*) dan teks terpusat.
* **Catatan Bebas Terapis:** Kolom catatan klinis yang dapat langsung disunting dari layar utama dan menyatu rapi tanpa kotak *border* saat dicetak.
* **Sistem Tanda Tangan Cerdas:** Deteksi otomatis penandatangan dokumen (Fisioterapis Pembimbing dan Mahasiswa Praktikan) dengan fleksibilitas tata letak 1 atau 2 kolom.

---

### 6. 📈 Modul Pemantauan Evaluasi Berkala (`ProgressTracking`)
* **Pencatatan Sesi Terapi Lanjutan ($T_1, T_2, \dots$):** Form evaluasi periodik untuk memantau respons pasien terhadap program intervensi yang telah dijalankan.
* **Pembaruan Metrik Motorik & Nyeri:** Input berkala untuk nilai NRS, rekam skor MMT, derajat spastisitas Ashworth, serta capaian persentase skor GMFM.
* **Riwayat Perkembangan Pasien:** Penyimpanan terpusat yang terhubung langsung ke profil pasien dan tabel evaluasi pada laporan status klinik.

---

### 7. 🧪 Modul Pengujian & Data Awal (`Seeder`)
* **Seeder Kasus Pediatrik Terpadu (`PediatricCaseSeeder`):** Data siap uji untuk kasus anak nyata (**An. Fahreza**, 4 tahun, diagnosis *Cerebral Palsy Hemiplegi Spastik Sinistra*).
* **Cakupan Data Lengkap:** Otomatis mengisi akun pembimbing klinis, akun mahasiswa, profil pasien, asesmen pediatrik lengkap (*Prenatal/Natal/Postnatal, TTV, MMT, Ashworth, Sensibilitas*), laporan ICF, hingga 3 sesi evaluasi berkala ($T_1$ s/d $T_3$).

---
