"use client";

import { cn } from "@repo/utils";
import { PaymentStatus } from "@/services/payment.service";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  SUCCESS: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  FAILED: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  PENDING: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  REFUNDED: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const DOT_STYLES: Record<PaymentStatus, string> = {
  SUCCESS: "bg-emerald-400",
  FAILED: "bg-rose-400",
  PENDING: "bg-amber-400",
  REFUNDED: "bg-blue-400",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  const dot = DOT_STYLES[status] ?? DOT_STYLES.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
        style
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}
