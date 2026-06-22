"use client";

import { useState, useEffect, useCallback } from "react";
import {
  userService,
  AdminUser,
  UpdateUserInput,
  UserRole,
} from "@/services/user.service";

const emptyForm: UpdateUserInput = {
  full_name: "",
  phone: "",
  age: null,
  gender: null,
  experience: null,
  weight: "",
  height: "",
  passport: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  medical_conditions: "",
  allergies: "",
  bio: "",
};

export function useStudents() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UpdateUserInput>(emptyForm);

  // Delete modal
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Per-row role toggle in-flight tracking
  const [togglingRoleId, setTogglingRoleId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load students. Please check your connection.");
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      age: user.age ?? null,
      gender: user.gender ?? null,
      experience: user.experience ?? null,
      weight: user.weight ?? "",
      height: user.height ?? "",
      passport: user.passport ?? "",
      emergency_contact_name: user.emergency_contact_name ?? "",
      emergency_contact_phone: user.emergency_contact_phone ?? "",
      medical_conditions: user.medical_conditions ?? "",
      allergies: user.allergies ?? "",
      bio: user.bio ?? "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      // Normalise empty strings to null/undefined-friendly values
      const payload: UpdateUserInput = {
        full_name: formData.full_name?.trim() || null,
        phone: formData.phone?.trim() || null,
        age:
          formData.age === null || formData.age === undefined
            ? null
            : Number(formData.age),
        gender: formData.gender || null,
        experience: formData.experience || null,
        weight: formData.weight === "" ? null : formData.weight,
        height: formData.height === "" ? null : formData.height,
        passport: formData.passport?.trim() || null,
        emergency_contact_name: formData.emergency_contact_name?.trim() || null,
        emergency_contact_phone: formData.emergency_contact_phone?.trim() || null,
        medical_conditions: formData.medical_conditions?.trim() || null,
        allergies: formData.allergies?.trim() || null,
        bio: formData.bio?.trim() || null,
      };
      await userService.updateUser(editingUser.id, payload);
      await fetchUsers();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || "Error saving student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRole = async (user: AdminUser) => {
    const nextRole: UserRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setTogglingRoleId(user.id);
    try {
      await userService.updateUserRole(user.id, nextRole);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error changing role");
    } finally {
      setTogglingRoleId(null);
    }
  };

  const handleOpenDelete = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert("Error deactivating student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    users,
    isRefreshing,
    error,
    isSubmitting,
    isEditModalOpen,
    editingUser,
    formData,
    setFormData,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    userToDelete,
    togglingRoleId,
    fetchUsers,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleToggleRole,
    handleOpenDelete,
    handleDelete,
  };
}
