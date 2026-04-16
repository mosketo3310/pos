'use client';
import { useEffect, useState, useRef } from 'react';

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; price: number; barcode: string;
  stock: number; category_id: number | null;
  category_name: string | null; image_url: string | null;
}
const emptyForm = { name: '', price: '', barcode: '', stock: '', category_id: '', image_url: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [newCat, setNewCat] = useState('');
  const [showCatForm, setShowCatForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [p, c] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]);
    setProducts(p);
    setCategories(c);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setForm(f => ({ ...f, image_url: data.url }));
    setUploading(false);
  }

  async function handleSave() {
    if (!form.name || !form.price) return;
    const body = {
      name: form.name,
      barcode: form.barcode || '',
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
      image_url: form.image_url || null,
    };
    if (editing) {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...body }),
      });
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('ลบสินค้านี้?')) return;
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function addCategory() {
    if (!newCat.trim()) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.trim() }),
    });
    setNewCat('');
    setShowCatForm(false);
    load();
  }

  async function deleteCategory(id: number) {
    if (!confirm('ลบหมวดหมู่นี้?')) return;
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const filtered = products.filter(p =>
  p.name.toLowerCase().includes(search.toLowerCase()) ||
  (p.barcode ?? '').toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-700">จัดการสินค้า</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowCatForm(v => !v)}
            className="border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg text-sm font-medium transition">
            หมวดหมู่
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            + เพิ่มสินค้า
          </button>
        </div>
      </div>

      {showCatForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">จัดการหมวดหมู่</p>
          <div className="flex gap-2 mb-3">
            <input value={newCat} onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="ชื่อหมวดหมู่ใหม่"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            <button onClick={addCategory}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              เพิ่ม
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <span key={c.id} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full">
                {c.name}
                <button onClick={() => deleteCategory(c.id)}
                  className="text-teal-400 hover:text-red-400 ml-1 leading-none">×</button>
              </span>
            ))}
            {categories.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีหมวดหมู่</p>}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="ค้นหาสินค้า..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value="">ทุกหมวดหมู่</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h2 className="font-medium text-gray-700 mb-4">{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500">ชื่อสินค้า</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="ชื่อสินค้า" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">รหัสสินค้า</label>
              <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="รหัสสินค้า" />
            </div>
            <div>
              <label className="text-xs text-gray-500">ราคา (฿)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-500">สต็อก</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">หมวดหมู่</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="">ไม่ระบุหมวดหมู่</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">รูปสินค้า</label>
              <div className="mt-1 flex gap-3 items-center">
                {form.image_url && (
                  <img src={form.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                )}
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="border border-dashed border-gray-300 hover:border-teal-400 rounded-lg px-4 py-3 text-sm text-gray-400 hover:text-teal-600 transition">
                  {uploading ? 'กำลังอัพโหลด...' : '+ เลือกรูป'}
                </button>
                {form.image_url && (
                  <button onClick={() => setForm({ ...form, image_url: '' })}
                    className="text-xs text-red-400 hover:text-red-500">ลบรูป</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              บันทึก
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-3 w-20">รูป</th>
              <th className="text-left px-4 py-3">ชื่อสินค้า</th>
              <th className="text-left px-4 py-3">รหัสสินค้า</th>
              <th className="text-left px-4 py-3">หมวดหมู่</th>
              <th className="text-right px-4 py-3">ราคา</th>
              <th className="text-right px-4 py-3">สต็อก</th>
              <th className="text-center px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                    : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">ไม่มีรูป</div>
                  }
                </td>
                <td className="px-4 py-3 font-medium text-gray-700">{p.name}</td>
                <td className="px-4 py-3 text-gray-700">{p.barcode}</td>
                <td className="px-4 py-3">
                  {p.category_name
                    ? <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">{p.category_name}</span>
                    : <span className="text-gray-300 text-xs">-</span>}
                </td>
                <td className="px-4 py-3 text-right text-teal-600">฿{p.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={p.stock < 20 ? 'text-red-500 font-medium' : 'text-gray-600'}>{p.stock}</span>
                  {p.stock < 20 && <span className="text-xs text-red-400 ml-1">ใกล้หมด</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => {
                      setEditing(p);
                      setForm({ name: p.name, price: String(p.price), barcode: String(p.barcode), stock: String(p.stock), category_id: p.category_id ? String(p.category_id) : '', image_url: p.image_url ?? '' });
                      setShowForm(true);
                    }} className="text-teal-600 hover:underline text-xs">แก้ไข</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:underline text-xs">ลบ</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-10">ยังไม่มีสินค้า</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}