'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cartStore';
import BillModal from '@/components/BillModal';

interface Product {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category_id: number | null;
  image_url?: string | null;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'transfer'>('cash');
  const [received, setReceived] = useState('');
  const [billDone, setBillDone] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { items, addItem, removeItem, updateQty, clearCart, total } = useCartStore();

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        payment_method: payMethod,
        received: payMethod === 'cash' ? Number(received) : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setBillDone(data);
      clearCart();
      setReceived('');
      setCartOpen(false);
    }
  }

  const change = payMethod === 'cash' && received ? Number(received) - total() : null;

 if (billDone) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <BillModal
        bill={{
          saleId: billDone.saleId,
          shopName: 'ร้านค้า',
          items: billDone.items ?? [],
          total: billDone.total,
          payment_method: billDone.payment_method,
          received: billDone.received,
          change: billDone.change,
        }}
        onClose={() => setBillDone(null)}
      />
    </div>
  );
}

  /* ── Cart panel (shared between desktop sidebar & mobile drawer) ── */
  const CartPanel = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">ยังไม่มีสินค้า</p>
        )}
        {items.map(item => (
          <div key={item.product_id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-teal-600">฿{(item.price * item.qty).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => updateQty(item.product_id, item.qty - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-sm flex items-center justify-center">−</button>
              <span className="text-sm w-6 text-center">{item.qty}</span>
              <button onClick={() => updateQty(item.product_id, item.qty + 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-sm flex items-center justify-center">+</button>
            </div>
            <button onClick={() => removeItem(item.product_id)}
              className="text-gray-300 hover:text-red-400 text-xl leading-none">×</button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm font-medium">
          <span>ยอดรวม</span>
          <span className="text-teal-600 text-lg">฿{total().toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          {(['cash', 'transfer'] as const).map(m => (
            <button key={m} onClick={() => setPayMethod(m)}
              className={`flex-1 py-2 rounded-lg text-sm border transition ${
                payMethod === m ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-500 hover:border-teal-400'
              }`}>
              {m === 'cash' ? '💵 เงินสด' : '📲 โอนเงิน'}
            </button>
          ))}
        </div>
        {payMethod === 'cash' && (
            <div>
              <input type="number" placeholder="รับมา..." value={received}
                onChange={e => setReceived(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              {change !== null && change >= 0 && <p className="text-sm text-teal-600 mt-1">เงินทอน ฿{change.toLocaleString()}</p>}
              {change !== null && change < 0 && <p className="text-sm text-red-400 mt-1">รับมาไม่พอ</p>}
            </div>
          )}
          <button onClick={handleCheckout}
            disabled={items.length === 0 || loading || (payMethod === 'cash' && change !== null && change < 0)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-medium transition disabled:opacity-40">
            {loading ? 'กำลังบันทึก...' : 'ชำระเงิน'}
          </button>
          {items.length > 0 && (
            <button onClick={clearCart} className="w-full text-sm text-gray-400 hover:text-red-400 transition">ล้างตะกร้า</button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full min-h-screen">

      {/* ── Product grid ── */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-w-0">
        <div className="mb-4">
          <input type="text" placeholder="ค้นหาสินค้า..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pb-4">
          {filtered.map(product => (
            <button key={product.id}
              onClick={() => addItem({ product_id: product.id, name: product.name, price: product.price, barcode: product.barcode ?? '' })}
              disabled={product.stock === 0}
              className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-teal-400 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full h-50 object-cover rounded-lg mb-2" />
              )}
              <p className="text-sm font-medium text-gray-700 mb-1 truncate">{product.name}</p>
              <p className="text-teal-600 font-medium text-sm">฿{product.price.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">คงเหลือ {product.stock}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center text-gray-400 py-16 text-sm">ไม่พบสินค้า</div>
          )}
        </div>
      </div>

      {/* ── Desktop cart sidebar ── */}
      <div className="hidden md:flex w-80 bg-white border-l border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">ตะกร้า</h2>
        </div>
        <CartPanel />
      </div>

      {/* ── Mobile: FAB button ── */}
      {!cartOpen && (
        <button onClick={() => setCartOpen(true)}
          className="md:hidden fixed bottom-20 right-4 bg-teal-600 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 z-20 text-sm font-medium">
          🛒
          {items.length > 0
            ? <span>{items.length} · ฿{total().toLocaleString()}</span>
            : <span>ตะกร้า</span>
          }
        </button>
      )}

      {/* ── Mobile: cart drawer overlay ── */}
      {cartOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setCartOpen(false)} />
      )}

      {/* ── Mobile: cart drawer ── */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 bg-white rounded-t-2xl z-40 flex flex-col transition-transform duration-300 ${
        cartOpen ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">ตะกร้า</h2>
          <button onClick={() => setCartOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <CartPanel />
      </div>

    </div>
  );
}
