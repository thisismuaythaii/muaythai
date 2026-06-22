"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  ShieldCheck,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { useStudents } from "./hooks/useStudents";
import { StudentRow } from "./components/StudentRow";
import { StudentModal } from "./components/StudentModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Button } from "@repo/ui";

export default function StudentsPage() {
  const {
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
  } = useStudents();

  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-primary" />
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">
                Member Operations
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
              Students <span className="text-primary">Roster</span>
            </h1>
            <p className="text-white/40 mt-4 text-sm md:text-base max-w-lg leading-relaxed">
              Manage every registered athlete. Adjust roles, edit profiles, and
              control account access across the platform.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchUsers}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Total Members
              </p>
              <p className="text-2xl font-bold">{users.length} Athletes</p>
            </div>
          </div>
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Active Accounts
              </p>
              <p className="text-2xl font-bold">{activeCount} Active</p>
            </div>
          </div>
          <div className="glass-surface p-6 rounded-3xl border border-white/5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                Administrators
              </p>
              <p className="text-2xl font-bold">{adminCount} Admins</p>
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
            There was a problem syncing with the member registry.
          </p>
          <Button
            onClick={fetchUsers}
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
            Loading Roster...
          </span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Column headers (desktop) */}
          {users.length > 0 && (
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-1 text-[10px] font-black uppercase tracking-widest text-white/30">
              <div className="col-span-4">Athlete</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {users.length > 0 ? (
              users.map((user, index) => (
                <StudentRow
                  key={user.id}
                  user={user}
                  index={index}
                  isTogglingRole={togglingRoleId === user.id}
                  onEdit={handleOpenEdit}
                  onToggleRole={handleToggleRole}
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
                  <Users className="text-white/20 w-10 h-10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-white/40 font-black uppercase tracking-widest text-sm">
                    No Students Found
                  </span>
                  <span className="text-white/20 text-[10px] font-bold uppercase">
                    Members will appear here once they register
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <StudentModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        editingUser={editingUser}
        formData={formData}
        setFormData={setFormData}
      />

      {/* Soft-delete / Deactivation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        title="Deactivate Student?"
        message={
          userToDelete
            ? `This will deactivate ${
                userToDelete.full_name?.trim() || userToDelete.email
              }. Their account will be marked inactive and they will lose access until reactivated.`
            : "This will deactivate the student's account."
        }
        confirmText="Deactivate"
      />
    </div>
  );
}
