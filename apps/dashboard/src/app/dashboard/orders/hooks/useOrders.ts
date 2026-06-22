"use client";

import { useState, useEffect, useCallback } from "react";
import { orderService, Order, OrderStatus } from "@/services/order.service";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await orderService.getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Failed to load orders. Please check your connection.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      await orderService.updateOrderStatus(id, status);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || "Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDelete = (id: number) => {
    setOrderToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (orderToDelete === null) return;
    setIsSubmitting(true);
    try {
      await orderService.deleteOrder(orderToDelete);
      await fetchOrders();
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      alert("Error deleting order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    orders,
    isRefreshing,
    error,
    updatingId,
    isSubmitting,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleStatusChange,
    handleOpenDelete,
    handleDelete,
    fetchOrders,
  };
}
