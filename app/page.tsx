"use client";

import React, { useEffect, useState } from 'react';
import { customers as initialCustomers, transactions } from '../data/data';
import CustomerCard from './components/customercard';
import { TrendingUp, TrendingDown, DollarSign, BookOpenText, Users } from 'lucide-react';
import { addTransaction, getAllTransactions } from '@/lib/db';

export default function Home() {
  const [receivable, setReceivable] = useState(0);
  const [payable, setPayable] = useState(0);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [customers, setCustomers] = useState(() => initialCustomers.map((customer) => ({
    ...customer,
    balance: transactions.reduce((total, transaction) => {
      if (transaction.customerId !== customer.id) return total;
      return total + (transaction.type === 'DEBT' ? transaction.amount : -transaction.amount);
    }, 0),
  })));

  async function handleAddTransaction(customerId: string, type: 'DEBT' | 'PAYMENT', amount: number) {
    await addTransaction({
      id: crypto.randomUUID(),
      customerId,
      type,
      amount,
      note: null,
      createdAt: new Date().toISOString(),
    });

    if (type === 'DEBT') setReceivable((current) => current + amount);
    else setPayable((current) => current + amount);

    const balanceChange = type === 'DEBT' ? amount : -amount;
    setCustomers((current) => current.map((customer) => customer.id === customerId
      ? { ...customer, balance: customer.balance + balanceChange }
      : customer));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadTransactionTotals() {
      try {
        const totals = await getAllTransactions();
        if (!cancelled) {
          setReceivable(totals.Receivable);
          setPayable(totals.Payable);
        }
      } catch (error) {
        console.error('Failed to load transaction totals:', error);
      } finally {
        if (!cancelled) setTotalsLoading(false);
      }
    }

    void loadTransactionTotals();
    return () => {
      cancelled = true;
    };
  }, []);

  const netBalance = receivable - payable;

  return (
    <div className="min-h-screen bg-[#f5f7f6] px-4 py-7 text-slate-900 sm:px-7 sm:py-10" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-9">
        
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <BookOpenText className="h-4 w-4" />
              <span>دفتر</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">دفتر الحسابات</h1>
            <p className="text-sm text-slate-500">تابع حسابات العملاء والدفعات من مكان واحد.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            <Users className="h-4 w-4 text-emerald-700" />
            <span>{customers.length} عملاء</span>
          </div>
        </header>

        {/* 3 Summary Cards (Receivable, Payable, Net Balance) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-busy={totalsLoading}>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-semibold text-slate-500">إجمالي المستحقات</p>
              {totalsLoading ? (
                <div role="status" aria-label="جاري تحميل الإجمالي" className="mt-3 h-8 w-36 animate-pulse rounded-lg bg-rose-100" />
              ) : (
                <p className="mt-2 text-2xl font-bold tabular-nums text-rose-700">{receivable.toLocaleString()} <span className="text-sm font-semibold text-slate-400">₪</span></p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-semibold text-slate-500">إجمالي الدفعات المستلمة</p>
              {totalsLoading ? (
                <div role="status" aria-label="جاري تحميل الإجمالي" className="mt-3 h-8 w-36 animate-pulse rounded-lg bg-emerald-100" />
              ) : (
                <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700">{payable.toLocaleString()} <span className="text-sm font-semibold text-slate-400">₪</span></p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-900 bg-emerald-950 p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-semibold text-emerald-100/70">صافي الحسابات</p>
              {totalsLoading ? (
                <div role="status" aria-label="جاري تحميل الإجمالي" className="mt-3 h-8 w-36 animate-pulse rounded-lg bg-white/15" />
              ) : (
                <p className={`mt-2 text-2xl font-bold tabular-nums ${netBalance >= 0 ? 'text-white' : 'text-amber-300'}`}>
                  {netBalance.toLocaleString()} <span className="text-sm font-semibold text-emerald-100/50">₪</span>
                </p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">العملاء</h2>
              <p className="mt-1 text-sm text-slate-500">اختر إضافة معاملة لتسجيل دين أو دفعة.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onAddTransaction={handleAddTransaction}
              />
          ))}
          </div>
        </section>

      </div>
    </div>
  );
}
