export type User = {
  user_id: string;
  name: string;
  email: string;
  password: string;
  alamat: string;
  nomor_telepon: string;
  foto: string | null;
  type: 'ADMIN' | 'STAFF';
};