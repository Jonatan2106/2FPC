import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api/web';

async function run() {
  try {
    // login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Super Admin', password: 'admin123' }),
    });

    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }

    const token = loginJson.data.token;
    console.log('Got token, fetching reimburse list...');

    const res = await fetch(`${API_BASE}/all-reimburse-requests`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    console.log('Status:', res.status);
    console.dir(json, { depth: 5 });

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
