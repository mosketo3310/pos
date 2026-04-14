'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import BillModal from '@/components/BillModal';

interface Sale {
  id: number; total: number; payment_method: string;
  received: number | null; change: number | null;
  created_at: number; items_summary: string;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);

  function load() {
    fetch('/api/sales').then(r => r.json()).then(data => {
      setSales(data); setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  async function openBill(sale: Sale) {
    const res = await fetch(`/api/sales?id=${sale.id}`);
    const data = await res.json();
    setBill({
      saleId: data.id,
      shopName: session?.user?.name ?? 'ร้านค้า',
      items: data.items,
      total: data.total,
      payment_method: data.payment_method,
      received: data.received,
      change: data.change,
      created_at: data.created_at,
    });
  }

  return (
    <div className="p-6">
      {bill && (
        <BillModal
          bill={bill}
          onClose={() => setBill(null)}
          onDelete={() => { setBill(null); load(); }}
        />
      )}

      <h1 className="text-xl font-medium text-gray-700 mb-6">ประวัติบิล</h1>
      {loading && <p className="text-gray-400 text-sm">กำลังโหลด...</p>}

      <div className="space-y-3">
        {sales.map(sale => (
          <div key={sale.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-teal-300 transition cursor-pointer"
            onClick={() => openBill(sale)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">บิล #{sale.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(sale.created_at * 1000).toLocaleString('th-TH')}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{sale.items_summary}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-teal-600 font-medium">฿{sale.total.toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                  sale.payment_method === 'cash'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-blue-50 text-blue-600'
                }`}>
                  {sale.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน'}
                </span>
                {sale.change != null && sale.change > 0 && (
                  <p className="text-xs text-gray-400 mt-1">ทอน ฿{sale.change.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {!loading && sales.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-16">ยังไม่มีประวัติการขาย</p>
        )}
      </div>
    </div>
  );
}