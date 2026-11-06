import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  nickname: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  balance: number;
}

interface CustomerCardProps {
  customer: Customer;
  onAddTransaction: (customerId: string, type: 'DEBT' | 'PAYMENT', amount: number) => Promise<void>;
}

export default function CustomerCard({ customer, onAddTransaction }: CustomerCardProps) {
  const { balance } = customer;
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'DEBT' | 'PAYMENT'>('DEBT');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('أدخل مبلغًا أكبر من صفر');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAddTransaction(customer.id, type, numericAmount);
      setAmount('');
      setShowForm(false);
    } catch {
      setError('تعذر حفظ المعاملة. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]" dir="rtl">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              {customer.name.trim().slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold tracking-tight text-slate-950">{customer.name}</h3>
              {customer.nickname && (
                <p className="mt-1 text-xs text-slate-500">اللقب: <span className="text-slate-700">{customer.nickname}</span></p>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
            {customer.status}
          </span>
        </div>

        <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-4 ${balance > 0 ? 'border-rose-100 bg-rose-50/70' : balance < 0 ? 'border-emerald-100 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'}`}>
          <div>
            <p className="text-xs font-medium text-slate-500">الرصيد الحالي</p>
            <p className={`mt-1 text-xs ${balance > 0 ? 'text-rose-700' : balance < 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
              {balance > 0 ? 'مطلوب منه' : balance < 0 ? 'رصيد دائن له' : 'الحساب متوازن'}
            </p>
          </div>
          <p dir="ltr" className={`shrink-0 text-2xl font-bold tabular-nums tracking-tight ${balance > 0 ? 'text-rose-700' : balance < 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
            {balance > 0 ? '+' : balance < 0 ? '−' : ''}{Math.abs(balance).toLocaleString('ar', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="ms-1 text-sm font-semibold text-slate-400">₪</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <p className="min-w-0 truncate rounded-lg bg-slate-50 px-3 py-2">الهاتف: <span className="font-mono text-slate-700" dir="ltr">{customer.phone || 'غير متوفر'}</span></p>
          <p className="min-w-0 truncate rounded-lg bg-slate-50 px-3 py-2">واتساب: <span className="font-mono text-slate-700" dir="ltr">{customer.whatsapp || 'غير متوفر'}</span></p>
        </div>

        {customer.notes && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="mb-1 font-semibold text-slate-500">ملاحظات:</p>
            <p>{customer.notes}</p>
          </div>
        )}
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">إضافة معاملة</h4>
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} aria-label="إغلاق النموذج" className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <label className="block space-y-1.5 text-xs font-medium text-slate-600">
            نوع المعاملة
            <select value={type} onChange={(event) => setType(event.target.value as 'DEBT' | 'PAYMENT')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
              <option value="DEBT">دين جديد — على العميل</option>
              <option value="PAYMENT">دفعة مستلمة — من العميل</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-xs font-medium text-slate-600">
            المبلغ
            <div className="flex items-center rounded-lg border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <input autoFocus type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400" dir="ltr" />
              <span className="px-3 text-sm text-slate-500">₪</span>
            </div>
          </label>
          {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
          <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60">
            <Plus aria-hidden="true" className="h-4 w-4" />
            {saving ? 'جارٍ الحفظ...' : 'حفظ المعاملة'}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          إضافة معاملة
        </button>
      )}

      <div className="mt-4 flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span>تاريخ الإنشاء: {new Date(customer.createdAt).toLocaleDateString('ar')}</span>
        <span className="font-mono">ID: {customer.id.slice(0, 8)}</span>
      </div>
    </article>
  );
}
