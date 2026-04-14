'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push('/sales');
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-medium text-teal-700 mb-2 text-center">KeToPOS</h1>
        <p className="text-sm text-gray-400 text-center mb-6">ระบบจัดการร้านค้า</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="shop@email.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          ยังไม่มีบัญชี?{' '}
          <a href="/register" className="text-teal-600 hover:underline">สมัครสมาชิก</a>
        </p>
      </div>
    </div>
  );
}