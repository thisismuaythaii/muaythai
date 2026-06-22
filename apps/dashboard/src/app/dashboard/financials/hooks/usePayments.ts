"use client";

import { useState, useEffect, useCallback } from "react";
import { paymentService, Payment } from "@/services/payment.service";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await paymentService.getPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load payments. Please check your connection.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    isRefreshing,
    error,
    fetchPayments,
  };
}
