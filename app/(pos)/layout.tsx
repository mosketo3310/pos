'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/sales',     label: 'การขาย',      icon: '🛒' },
  { href: '/history',   label: 'ประวัติบิล',   icon: '📋' },
  { href: '/products',  label: 'จัดการสินค้า', icon: '📦' },
  { href: '/dashboard', label: 'Dashboard',    icon: '📊' },
  { href: '/help',      label: 'ช่วยเหลือ',    icon: '❓' },
];

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);

  // ปิด drawer เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <p className="text-teal-600">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ════════════════════════════════
          Desktop sidebar (md ขึ้นไป)
      ════════════════════════════════ */}
      <aside className="hidden md:flex w-56 bg-teal-700 text-white flex-col shrink-0">
        <div className="px-5 py-5 border-b border-teal-600">
          <h1 className="text-lg font-medium">KeToPOS</h1>
          <p className="text-xs text-teal-300 mt-0.5 truncate">{session?.user?.name}</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? 'bg-teal-500 text-white font-medium' : 'text-teal-100 hover:bg-teal-600'
                }`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-teal-600">
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 text-sm text-teal-200 hover:text-white hover:bg-teal-600 rounded-lg transition">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          Mobile: overlay + drawer
      ════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setDrawerOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-teal-700 text-white flex flex-col z-40 transition-transform duration-300 md:hidden ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-5 py-5 border-b border-teal-600 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium">KeToPOS</h1>
            <p className="text-xs text-teal-300 mt-0.5 truncate">{session?.user?.name}</p>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="text-teal-200 hover:text-white text-2xl leading-none">×</button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? 'bg-teal-500 text-white font-medium' : 'text-teal-100 hover:bg-teal-600'
                }`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-teal-600">
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 text-sm text-teal-200 hover:text-white hover:bg-teal-600 rounded-lg transition">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          Main content
      ════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-teal-700 text-white flex items-center gap-3 px-4 py-3">
          <button onClick={() => setDrawerOpen(true)} className="text-2xl leading-none">☰</button>
          <span className="font-medium">KeToPOS</span>
        </header>

        {/* เนื้อหา — เว้น bottom บนมือถือเพื่อกัน bottom nav */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom navbar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-20">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition ${
                  active ? 'text-teal-600' : 'text-gray-400'
                }`}>
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="truncate w-full text-center px-0.5 text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
