'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', shop_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.error || 'เกิดข้อผิดพลาด');
    }
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-medium text-teal-700 mb-2 text-center">KeToPOS</h1>
        <p className="text-sm text-gray-400 text-center mb-6">สมัครสมาชิกใหม่</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">ชื่อร้านค้า</label>
            <input
              type="text"
              value={form.shop_name}
              onChange={e => setForm({ ...form, shop_name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="ร้านของฉัน"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">อีเมล</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="shop@email.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">รหัสผ่าน</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          มีบัญชีแล้ว?{' '}
          <a href="/login" className="text-teal-600 hover:underline">เข้าสู่ระบบ</a>
        </p>
      </div>
    </div>
  );
}