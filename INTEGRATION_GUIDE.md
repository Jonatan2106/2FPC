# Integration Backend ke Frontend - Panduan Setup

Backend Anda telah berhasil diintegrasikan dengan frontend. Berikut adalah ringkasan perubahan:

## File yang Dibuat

### 1. **API Service** (`src/services/api.ts`)
- Menyediakan semua endpoint API untuk backend
- Mengelola token autentikasi
- Mencakup fetch calls untuk:
  - Auth (login, logout, reset password)
  - User management
  - Attendance
  - Leave requests
  - Reimburse requests

### 2. **Auth Context** (`src/context/AuthContext.tsx`)
- Global state management untuk authentication
- Menyimpan user dan token di localStorage
- Menyediakan `useAuth()` hook untuk akses di komponen

## File yang Diupdate

### Components yang Diintegrasikan:

1. **Login** (`src/pages/auth/Login.tsx`)
   - Memanggil API login dengan username & password
   - Menyimpan token dan user data
   - Redirect ke homepage setelah login

2. **Create Account Admin** (`src/pages/profile/CreateAccountAdmin.tsx`)
   - Memanggil API untuk create staff account
   - Menerima input: nama dan role (Staff/Manager)
   - Tampil error/success message

3. **Profile Management** (`src/pages/profile/ProfileManagement.tsx`)
   - Update profil user
   - Endpoint: update own profile (non-admin)
   - Upload foto profile

4. **Leave Request** (`src/pages/leave/LeaveManagementRequest.tsx`)
   - Submit leave request dengan tanggal start/end dan alasan
   - Validasi date range

5. **Reimburse List** (`src/reimburse/ReimburseList.tsx`)
   - View semua reimburse requests
   - Approve/Reject reimburse (untuk manager)
   - Display status dengan chip warna

6. **Create Reimburse** (`src/reimburse/CreateReimburse.tsx`)
   - Submit reimburse request dengan file evidence dan amount
   - Convert file ke base64

7. **Attendance View** (`src/pages/attendance/AttendanceView.tsx`)
   - Fetch attendance data dari API
   - Generate QR code untuk check-in
   - Tampil loading state

## Update di App & Router

### App.tsx
- Wrap Router dengan `<AuthProvider>`

### Router.tsx
- Add authentication check
- Redirect non-authenticated users ke login
- Protected routes hanya bisa diakses setelah login
- Add `/dashboard` alias untuk homepage

## Cara Menggunakan

### 1. Setup Environment Variable
Buat file `.env` atau update di `vite.config.ts`:
```
VITE_API_URL=http://localhost:8080/api/web
```

### 2. Testing
- Backend harus running di `http://localhost:8080`
- Frontend akan connect ke backend otomatis
- Coba login dengan username & password

### 3. Token Management
- Token disimpan di localStorage sebagai `authToken`
- Otomatis dikirim di header Authorization untuk setiap request
- Token akan clear saat logout

## API Endpoints yang Connected

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | GET | Login |
| `/auth/logout` | POST | Logout |
| `/admin/users/staff-account` | POST | Create staff account |
| `/staff/users/:id/profile` | PUT | Update profil |
| `/leave-requests` | POST | Create leave request |
| `/manager/leave-requests/:id/decision` | POST | Approve/Reject leave |
| `/reimburse-requests` | POST | Create reimburse request |
| `/manager/reimburse-requests/:id/decision` | POST | Approve/Reject reimburse |
| `/attendance` | GET | Get attendance data |
| `/attendance/qr` | GET | Generate QR code |

## Catatan

- UI tidak diubah, hanya ditambahkan API integration
- Loading states dan error handling sudah ditambahkan
- Success/error messages ditampilkan dengan Alert component
- Semua komponen cache-friendly dengan localStorage
