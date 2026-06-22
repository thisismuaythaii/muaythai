"use client";

import { motion } from "motion/react";
import {
  Star,
  User,
  Mail,
  Package as PackageIcon,
  Calendar,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Review } from "@/services/review.service";

interface ReviewCardProps {
  review: Review;
  index: number;
  onDelete: (id: number) => void;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function ReviewCard({ review, index, onDelete }: ReviewCardProps) {
  const reviewer = review.user_full_name?.trim() || review.user_email || "Anonymous";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: index * 0.05 }}
      className="glass-surface rounded-[2rem] p-4 pr-8 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden flex items-start gap-6 w-full"
    >
      {/* Side Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-primary/50 transition-all" />

      {/* Icon Area */}
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-all border border-white/5">
        <MessageSquare className="text-primary w-8 h-8" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {/* Star Rating */}
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "text-primary fill-primary"
                    : "text-white/10 fill-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            {review.rating} / 5
          </span>
        </div>

        <p className="text-sm text-white/70 leading-relaxed mb-3 line-clamp-3">
          {review.comment}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-white/50 truncate max-w-xs">
            <User className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{reviewer}</span>
          </div>

          {review.user_email && (
            <div className="flex items-center gap-2 text-xs text-white/30 truncate max-w-xs">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{review.user_email}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-tighter shrink-0">
            <PackageIcon className="w-3.5 h-3.5" />
            Package #{review.package}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-tighter shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(review.created_at)}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4 shrink-0 self-center">
        <div className="h-10 w-px bg-white/5 mx-2 hidden md:block" />

        <div className="flex items-center gap-2 relative z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(review.id);
            }}
            className="w-12 h-12 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all active:scale-95 pointer-events-auto"
            title="Delete Review"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 blur-[50px] pointer-events-none group-hover:bg-primary/10 transition-all" />
    </motion.div>
  );
}
