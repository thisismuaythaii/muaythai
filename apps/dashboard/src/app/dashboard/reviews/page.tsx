"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Lock,
} from "lucide-react";
import { useReviews } from "./hooks/useReviews";
import { ReviewCard } from "./components/ReviewCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Button } from "@repo/ui";

export default function ReviewsPage() {
  const {
    reviews,
    isRefreshing,
    error,
    isSubmitting,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleOpenDelete,
    handleDelete,
    fetchReviews,
  } = useReviews();

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                Community Feedback
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
              Review <span className="text-primary">Moderation</span>
            </h1>
            <p className="text-white/40 mt-4 text-sm md:text-base max-w-lg leading-relaxed">
              Monitor and moderate athlete feedback across all training packages.
              Remove reviews that violate community guidelines.
            </p>
            <div className="flex items-center gap-2 mt-4 text-white/30 text-[11px] font-bold uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" />
              <span>
                Editing is disabled pending a backend permission fix — delete only.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchReviews}
              disabled={isRefreshing}
              className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:rotate-180 duration-500 disabled:opacity-50"
            >
              <RefreshCcw
                className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Total Reviews
              </p>
              <p className="text-2xl font-bold">{reviews.length} Entries</p>
            </div>
          </div>
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Average Rating
              </p>
              <p className="text-2xl font-bold">{averageRating} / 5</p>
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
          <p className="text-white/40 text-sm max-w-xs mb-6">
            There was a problem syncing with the feedback service.
          </p>
          <Button
            onClick={fetchReviews}
            variant="secondary"
            className="rounded-2xl px-10"
          >
            Try Again
          </Button>
        </div>
      ) : isRefreshing ? (
        <div className="h-96 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
          </div>
          <span className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
            Loading Feedback...
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={index}
                  onDelete={handleOpenDelete}
                />
              ))
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-surface border-2 border-dashed border-white/5 rounded-[3rem] p-20 flex flex-col items-center justify-center gap-6"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                  <MessageSquare className="text-white/20 w-10 h-10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/40 font-black uppercase tracking-widest text-sm">
                    No Reviews Found
                  </span>
                  <span className="text-white/20 text-[10px] font-bold uppercase">
                    Athlete feedback will appear here once submitted
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Global Deletion Security Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        title="Remove Review?"
        message="Are you sure you want to permanently remove this review? This operation cannot be reversed and the feedback will be deleted from the platform."
        confirmText="Delete Review"
      />
    </div>
  );
}
