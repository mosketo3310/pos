'use client';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [Chart, setChart] = useState<any>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function load(f?: string, t?: string) {
    const params = f && t ? `?from=${f}&to=${t}` : '';
    fetch(`/api/dashboard${params}`).then(r => r.json()).then(setData);
  }

  useEffect(() => {
    load();
    import('recharts').then(m => setChart(m));
  }, []);

  function exportExcel() {
    if (!data?.salesDetail) return;
    const rows = data.salesDetail.map((r: any) => ({
      'บิล #': r.id,
      'วันที่': new Date(r.created_at * 1000).toLocaleString('th-TH'),
      'สินค้า': r.item_name,
      'จำนวน': r.qty,
      'ราคา/ชิ้น': r.price,
      'รวม': r.qty * r.price,
      'วิธีชำระ': r.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน',
      'ยอดบิล': r.total,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงานการขาย');
    XLSX.writeFile(wb, `sales-${from || 'all'}.xlsx`);
  }

  if (!data) return <div className="p-6 text-gray-400 text-sm">กำลังโหลด...</div>;

  const t = data.todayTotal;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-700">Dashboard</h1>
        <button onClick={exportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          📥 Export Excel
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400">ตั้งแต่วันที่</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div>
          <label className="text-xs text-gray-400">ถึงวันที่</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <button onClick={() => load(from, to)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          ค้นหา
        </button>
        <button onClick={() => { setFrom(''); setTo(''); load(); }}
          className="border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition">
          รีเซ็ต
        </button>
      </div>

      {/* summary cards วันนี้ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'รายรับวันนี้', value: `฿${Number(t?.total ?? 0).toLocaleString()}`, color: 'text-teal-600' },
          { label: 'จำนวนบิล', value: `${t?.bills ?? 0} บิล`, color: 'text-gray-700' },
          { label: 'เงินสด', value: `฿${Number(t?.cash_total ?? 0).toLocaleString()}`, color: 'text-green-600' },
          { label: 'โอนเงิน', value: `฿${Number(t?.transfer_total ?? 0).toLocaleString()}`, color: 'text-blue-600' },
          { label: 'เงินทอนรวม', value: `฿${Number(t?.change_total ?? 0).toLocaleString()}`, color: 'text-orange-500' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className={`text-xl font-medium ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* กราฟ */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-medium text-gray-700 mb-4">ยอดขายรายวัน</p>
        {Chart ? (
          <Chart.ResponsiveContainer width="100%" height={220}>
            <Chart.BarChart data={data.dailySales}>
              <Chart.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Chart.XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <Chart.YAxis tick={{ fontSize: 11 }} />
              <Chart.Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Chart.Legend />
              <Chart.Bar dataKey="cash_total" name="เงินสด" fill="#0d9488" stackId="a" />
              <Chart.Bar dataKey="transfer_total" name="โอนเงิน" fill="#3b82f6" stackId="a" />
            </Chart.BarChart>
          </Chart.ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm">กำลังโหลดกราฟ...</div>
        )}
      </div>

      {/* ตารางสรุปรายวัน */}
<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-5 py-3 border-b border-gray-100">
    <p className="text-sm font-medium text-gray-700">สรุปรายวัน</p>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm min-w-[500px]">
      <thead className="bg-gray-50 text-xs text-gray-500">
        <tr>
          <th className="text-left px-4 py-3">วันที่</th>
          <th className="text-right px-4 py-3">บิล</th>
          <th className="text-right px-4 py-3">รายรับรวม</th>
          <th className="text-right px-4 py-3">เงินสด</th>
          <th className="text-right px-4 py-3">โอนเงิน</th>
          <th className="text-right px-4 py-3">เงินทอน</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {[...data.dailySales].reverse().map((d: any) => (
          <tr key={d.day} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{d.day}</td>
            <td className="px-4 py-3 text-right text-gray-500">{d.bill_count}</td>
            <td className="px-4 py-3 text-right font-medium text-teal-600 whitespace-nowrap">฿{Number(d.revenue).toLocaleString()}</td>
            <td className="px-4 py-3 text-right text-green-600 whitespace-nowrap">฿{Number(d.cash_total).toLocaleString()}</td>
            <td className="px-4 py-3 text-right text-blue-600 whitespace-nowrap">฿{Number(d.transfer_total).toLocaleString()}</td>
            <td className="px-4 py-3 text-right text-orange-500 whitespace-nowrap">฿{Number(d.change_total).toLocaleString()}</td>
          </tr>
        ))}
        {data.dailySales.length === 0 && (
          <tr><td colSpan={6} className="text-center text-gray-400 py-8">ยังไม่มีข้อมูล</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>

{/* รายละเอียดการขาย */}
<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-5 py-3 border-b border-gray-100">
    <p className="text-sm font-medium text-gray-700">รายละเอียดการขาย</p>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full text-sm min-w-[500px]">
      <thead className="bg-gray-50 text-xs text-gray-500">
        <tr>
          <th className="text-left px-4 py-3">บิล</th>
          <th className="text-left px-4 py-3 whitespace-nowrap">วันที่</th>
          <th className="text-left px-4 py-3">สินค้า</th>
          <th className="text-right px-4 py-3">จำนวน</th>
          <th className="text-right px-4 py-3">รวม</th>
          <th className="text-center px-4 py-3 whitespace-nowrap">วิธีชำระ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.salesDetail?.slice(0, 100).map((r: any, i: number) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 text-gray-400 whitespace-nowrap">#{r.id}</td>
            <td className="px-4 py-2 text-xs text-gray-400 whitespace-nowrap">
              {new Date(r.created_at * 1000).toLocaleDateString('th-TH')}
            </td>
            <td className="px-4 py-2">{r.item_name}</td>
            <td className="px-4 py-2 text-right">{r.qty}</td>
            <td className="px-4 py-2 text-right text-teal-600 whitespace-nowrap">
              ฿{(r.qty * r.price).toLocaleString()}
            </td>
            <td className="px-4 py-2 text-center">
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                r.payment_method === 'cash'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                {r.payment_method === 'cash' ? 'เงินสด' : 'โอน'}
              </span>
            </td>
          </tr>
        ))}
        {(!data.salesDetail || data.salesDetail.length === 0) && (
          <tr><td colSpan={6} className="text-center text-gray-400 py-8">ยังไม่มีข้อมูล</td></tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      
    </div>
  );
}