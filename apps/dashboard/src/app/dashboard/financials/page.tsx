"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  Receipt,
  Loader2,
  AlertCircle,
  RefreshCcw,
  IndianRupee,
} from "lucide-react";
import { usePayments } from "./hooks/usePayments";
import { PaymentRow } from "./components/PaymentRow";
import { Button } from "@repo/ui";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function FinancialsPage() {
  const { payments, isRefreshing, error, fetchPayments } = usePayments();

  const totalCollected = useMemo(
    () =>
      payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  const successCount = useMemo(
    () => payments.filter((p) => p.status === "SUCCESS").length,
    [payments]
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Revenue Ledger</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
              Financial <span className="text-primary">Records</span>
            </h1>
            <p className="text-white/40 mt-4 text-sm md:text-base max-w-lg leading-relaxed">
              Track every transaction processed through the Razorpay gateway. This ledger is read-only and reflects live payment history.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchPayments}
              disabled={isRefreshing}
              className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:rotate-180 duration-500 disabled:opacity-50"
            >
              <RefreshCcw className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Total Collected</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Transactions</p>
              <p className="text-2xl font-bold">
                {payments.length} Total
                <span className="text-sm text-white/30 font-bold ml-2">{successCount} Successful</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="glass-surface p-12 rounded-[3rem] border border-red-500/20 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">{error}</h3>
          <p className="text-white/40 text-sm max-w-xs mb-6">There was a problem syncing with the payment gateway.</p>
          <Button onClick={fetchPayments} variant="secondary" className="rounded-2xl px-10">Try Again</Button>
        </div>
      ) : isRefreshing ? (
        <div className="h-96 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
          </div>
          <span className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Loading Ledger...</span>
        </div>
      ) : payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {/* Table Header (desktop) */}
          <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 pb-2">
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-white/30">Payment ID</span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-white/30">Order</span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-white/30">Amount</span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-white/30">Status</span>
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Date</span>
          </div>

          {payments.map((payment, index) => (
            <PaymentRow key={payment.id} payment={payment} index={index} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-surface border-2 border-dashed border-white/5 rounded-[3rem] p-20 flex flex-col items-center justify-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
            <IndianRupee className="text-white/20 w-10 h-10" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-white/40 font-black uppercase tracking-widest text-sm">No Payments Recorded</span>
            <span className="text-white/20 text-[10px] font-bold uppercase">Transactions will appear here once orders are paid</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
