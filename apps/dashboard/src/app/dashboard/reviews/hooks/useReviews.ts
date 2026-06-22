"use client";

import { useState, useEffect, useCallback } from "react";
import { reviewService, Review } from "@/services/review.service";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await reviewService.getReviews();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError("Failed to load reviews. Please check your connection.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleOpenDelete = (id: number) => {
    setReviewToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (reviewToDelete === null) return;
    setIsSubmitting(true);
    try {
      await reviewService.deleteReview(reviewToDelete);
      await fetchReviews();
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      alert("Error deleting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reviews,
    isRefreshing,
    error,
    isSubmitting,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleOpenDelete,
    handleDelete,
    fetchReviews,
  };
}
