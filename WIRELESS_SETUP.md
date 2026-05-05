# Wireless Development Setup - SIAP DIGUNAKAN ✅

Aplikasi **sudah bisa dijalankan tanpa kabel USB** dan tetap terhubung ke backend.

## Status Saat Ini

✅ **Wireless ADB**: Device `192.168.100.2:5555` aktif  
✅ **Backend**: Running di `http://10.19.173.126:8080`  
✅ **Mobile App**: Sudah terpasang di HP dengan API Base URL benar  
⚠️ **Database**: Belum terkoneksi (bisa di-fix nanti)  

## Cara Menjalankan

### 1️⃣ Terminal 1 - Backend
```bash
npm run backend:start
```

Output:
```
✅ Backend running on http://0.0.0.0:8080
📱 Mobile app can connect to http://10.19.173.126:8080/api
```

### 2️⃣ Terminal 2 - Mobile App
```bash
cd mobile
./run-wireless.ps1
```

Atau dengan IP manual:
```bash
./run-wireless.ps1 -LaptopIp 10.19.173.126
```

### 3️⃣ Akses dari HP
Aplikasi sudah terpasang dan siap dijalankan **tanpa kabel** dengan API yang benar.

---

## Konfigurasi Database (Opsional - Untuk Koneksi DB Penuh)

Jika ingin database terkoneksi, edit `config/.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=2fpc
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_PASSWORD
DATABASE_DIALECT=postgres
```

Lalu restart backend:
```bash
npm run backend:start
```

---

## Quick Commands

**Test backend health:**
```bash
curl http://10.19.173.126:8080/health
```

**Lihat devices terhubung:**
```bash
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb devices -l
```

**Lepas kabel anytime:**
Aplikasi tetap berjalan karena sudah wireless ADB!

---

## Struktur Setup

```
Laptop (Windows)
  ├─ Backend API: :8080
  │   └─ Database (PostgreSQL) - optional
  │
WiFi Network (192.168.100.x)
  └─ HP Android (192.168.100.2)
      └─ Mobile App
          └─ Connects to http://10.19.173.126:8080/api
```

---

## Troubleshooting

**Backend tidak start?**
- Pastikan `npm install` berhasil: `npm install`
- Check `.env` di `config/.env` sudah ada
- Restart VS Code terminal

**Mobile app timeout?**
- Pastikan laptop dan HP di WiFi yang sama
- Cek firewall laptop (port 8080 harus terbuka)
- Pastikan backend sudah running

**Database still failing?**
- PostgreSQL credentials di `config/.env` salah
- Backend tetap bisa berjalan tanpa database (API saja)
- Untuk DB penuh, setup PostgreSQL atau ubah credentials

---

**Done! 🎉 Aplikasi wireless siap pakai.**
