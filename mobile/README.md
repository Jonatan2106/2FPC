# 2FPC Mobile (Android)

Project Flutter ini disiapkan khusus untuk Android.

## Menjalankan Aplikasi

1. Pastikan Android Studio + Android SDK sudah terpasang.
2. Pastikan emulator Android aktif atau device Android terhubung.
3. Jalankan perintah berikut dari folder ini:

```bash
flutter pub get
flutter run
```

## Jalankan Tanpa Kabel (Wireless) + Tetap Tersambung Backend

Gunakan langkah ini jika app dijalankan di HP fisik tanpa USB.

1. Pastikan laptop dan HP ada di jaringan Wi-Fi yang sama.
2. Jalankan backend dari root project:

```bash
npm run backend:start
```

3. Pair Wireless Debugging dari Android Studio:
	- Device Manager -> Pair Devices Using Wi-Fi
	- Ikuti kode pairing dari HP
4. Cari IP laptop (contoh `192.168.1.10`) lalu jalankan app dengan base URL backend:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8080/api
```

Alternatif cepat (otomatis deteksi IP lokal di Windows PowerShell):

```bash
./run-wireless.ps1
```

Atau isi manual jika ingin spesifik:

```bash
./run-wireless.ps1 -LaptopIp 192.168.1.10
```

Catatan:
- Jangan pakai `localhost` atau `127.0.0.1` untuk HP fisik.
- Default app saat tanpa `--dart-define` adalah `http://10.0.2.2:8080/api` (khusus emulator Android).
- Jika backend lokal memakai HTTP, Android sudah diizinkan lewat `usesCleartextTraffic=true`.

## Build APK Release

```bash
flutter build apk --release
```

Hasil APK ada di `build/app/outputs/flutter-apk/app-release.apk`.
