# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Backend API (Deploy Ready)

Backend Express tersedia di `src/backend` dan bisa dipakai untuk aplikasi Flutter/Android.

### Jalankan backend lokal

```bash
npm run backend:start
```

### Environment variables wajib

Buat file `.env` di root:

```env
PORT=8080
JWT_SECRET=replace-with-strong-secret

# Opsi A (disarankan saat hosting)
DATABASE_URL=postgres://user:password@host:5432/dbname
DB_SSL=true

# Opsi B (lokal)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres

CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Health check

- `GET /health`

### Base path API

- Semua endpoint backend dimount ke `/api`

## QR Attendance Flow

### 1) Login

- `GET /api/auth/login?username=...&password=...`
- Response sudah berisi JWT token.

### 2) Generate QR absensi

- `GET /api/attendance/qr`
- Header: `Authorization: Bearer <token>`
- Response berisi:
  - `qr_token` (JWT, expired 2 menit)
  - `qr_data_url` (base64 PNG)

### 3) Clock in via scan QR

- `POST /api/attendance/clock-in/qr-scan`
- Header: `Authorization: Bearer <token>`
- Body:

```json
{
  "qr_token": "..."
}
```

## Rekomendasi hosting

Untuk tugas ini paling cocok:

1. Backend: Render atau Railway
2. Database: Neon Postgres atau Supabase Postgres
3. Storage bukti/foto (opsional): Cloudinary atau Supabase Storage

Alasan:

1. Setup cepat untuk project kampus
2. Dapat URL HTTPS publik untuk mobile app
3. DB managed sehingga maintenance ringan

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
