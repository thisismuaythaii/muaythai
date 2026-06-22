"use client";

import { motion } from "motion/react";
import { Hash, CreditCard } from "lucide-react";
import { Payment } from "@/services/payment.service";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

interface PaymentRowProps {
  payment: Payment;
  index: number;
}

const formatAmount = (amount: string) => {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function PaymentRow({ payment, index }: PaymentRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.04 }}
      className="grid grid-cols-12 items-center gap-4 px-6 py-5 glass-surface rounded-2xl border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
    >
      {/* Side Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-primary/50 transition-all" />

      {/* Payment ID */}
      <div className="col-span-4 md:col-span-3 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-all border border-white/5">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Payment ID</p>
          <p className="text-sm font-mono text-white truncate" title={payment.razorpay_payment_id ?? undefined}>
            {payment.razorpay_payment_id ?? "—"}
          </p>
        </div>
      </div>

      {/* Order */}
      <div className="col-span-3 md:col-span-2 hidden sm:flex flex-col">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Order</p>
        <p className="text-sm font-bold text-white/70 flex items-center gap-1">
          <Hash className="w-3 h-3 text-white/30" />
          {payment.order}
        </p>
      </div>

      {/* Amount */}
      <div className="col-span-4 md:col-span-2 flex flex-col">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Amount</p>
        <p className="text-base font-black text-white tracking-tight">{formatAmount(payment.amount)}</p>
      </div>

      {/* Status */}
      <div className="col-span-4 md:col-span-2 flex flex-col gap-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 hidden md:block">Status</p>
        <PaymentStatusBadge status={payment.status} />
      </div>

      {/* Date */}
      <div className="col-span-12 md:col-span-3 hidden md:flex flex-col items-start md:items-end">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Date</p>
        <p className="text-sm font-bold text-white/70">{formatDate(payment.created_at)}</p>
        <p className="text-[10px] font-mono text-white/20">{formatTime(payment.created_at)}</p>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-all" />
    </motion.div>
  );
}
