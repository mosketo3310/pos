'use client';
import { useRef } from 'react';

interface BillItem { name: string; qty: number; price: number; }
interface BillData {
  saleId: number | string;
  shopName: string;
  items: BillItem[];
  total: number;
  payment_method: string;
  received?: number | null;
  change?: number | null;
  created_at?: number;
}

export default function BillModal({
  bill, onClose, onDelete,
}: {
  bill: BillData;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const date = bill.created_at
    ? new Date(bill.created_at * 1000).toLocaleString('th-TH')
    : new Date().toLocaleString('th-TH');

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>บิล #${bill.saleId}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 13px; padding: 16px; max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; font-size: 16px; margin-bottom: 4px; }
        .sub { text-align: center; margin: 2px 0; font-size: 12px; color: #555; }
        hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
        table { width: 100%; font-size: 12px; border-collapse: collapse; }
        td { padding: 3px 0; vertical-align: top; }
        .r { text-align: right; }
        .bold { font-weight: bold; }
        .footer { text-align: center; font-size: 11px; color: #888; margin-top: 12px; }
      </style></head>
      <body>${content}
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  }
 
  async function handleDelete() {
  if (!confirm(`ลบบิล #${bill.saleId} ?`)) return;
  onDelete?.();
  onClose();
}

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]">

        <div ref={printRef} className="p-6 font-mono text-sm overflow-y-auto">
          <h2 className="text-center text-lg font-bold mb-1">{bill.shopName}</h2>
          <p className="text-center text-xs text-gray-400 mb-0.5">{date}</p>
          <p className="text-center text-xs text-gray-400 mb-3">บิล #{bill.saleId}</p>
          <hr className="border-dashed border-gray-300 mb-3" />

          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="text-gray-400">
                <td>รายการ</td>
                <td className="text-center w-10">จำนวน</td>
                <td className="text-right w-20">ราคา</td>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-1">{item.name}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">฿{(item.price * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr className="border-dashed border-gray-300 mb-2" />
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm">
              <span>ยอดรวม</span>
              <span className="text-teal-600">฿{bill.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ชำระ ({bill.payment_method === 'cash' ? 'เงินสด' : 'โอนเงิน'})</span>
              <span>฿{(bill.received ?? bill.total).toLocaleString()}</span>
            </div>
            {bill.change != null && bill.change > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>เงินทอน</span>
                <span>฿{bill.change.toLocaleString()}</span>
              </div>
            )}
          </div>
          <hr className="border-dashed border-gray-300 mt-3 mb-2" />
          <p className="text-center text-xs text-gray-400">ขอบคุณที่ใช้บริการ</p>
        </div>
        
        <div className="flex gap-2 px-5 pb-5 pt-2 border-t border-gray-100">
          <button onClick={handlePrint}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2.5 text-sm font-medium transition">
            🖨️ พิมพ์บิล
          </button>
          {onDelete && (
            <button onClick={handleDelete}
              className="px-4 border border-red-200 text-red-400 hover:bg-red-50 rounded-lg py-2.5 text-sm transition">
              🗑️ ลบ
            </button>
          )}
          <button onClick={onClose}
            className="px-4 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg py-2.5 text-sm transition">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}