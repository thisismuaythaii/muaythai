"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import {
  AdminUser,
  UpdateUserInput,
  Gender,
  ExperienceLevel,
} from "@/services/user.service";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  editingUser: AdminUser | null;
  formData: UpdateUserInput;
  setFormData: (data: UpdateUserInput) => void;
}

const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PRO",
];

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";
const labelClass =
  "text-[10px] text-white/40 font-black uppercase tracking-widest ml-1";

export function StudentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  editingUser,
  formData,
  setFormData,
}: StudentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-black border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[min(90vh,840px)]"
          >
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">
                    Update <span className="text-primary">Student</span>
                  </h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">
                    {editingUser
                      ? `${editingUser.email} · #${editingUser.id}`
                      : "Modify athlete profile"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Saenchai"
                      className={inputClass}
                      value={formData.full_name ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +66 80 000 0000"
                      className={inputClass}
                      value={formData.phone ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 26"
                      className={inputClass}
                      value={formData.age ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Gender</label>
                    <select
                      className={`${inputClass} appearance-none`}
                      value={formData.gender ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: (e.target.value || null) as Gender | null,
                        })
                      }
                    >
                      <option value="" className="bg-black">
                        Unspecified
                      </option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g} className="bg-black">
                          {g.charAt(0) + g.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Experience</label>
                    <select
                      className={`${inputClass} appearance-none`}
                      value={formData.experience ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: (e.target.value ||
                            null) as ExperienceLevel | null,
                        })
                      }
                    >
                      <option value="" className="bg-black">
                        Unspecified
                      </option>
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl} className="bg-black">
                          {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="e.g. 67.50"
                      className={inputClass}
                      value={formData.weight ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Height (cm)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="e.g. 175.00"
                      className={inputClass}
                      value={formData.height ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          height: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Passport</label>
                    <input
                      type="text"
                      placeholder="e.g. AA1234567"
                      className={inputClass}
                      value={formData.passport ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, passport: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Emergency Contact</label>
                    <input
                      type="text"
                      placeholder="Contact name"
                      className={inputClass}
                      value={formData.emergency_contact_name ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Emergency Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +66 80 000 0000"
                      className={inputClass}
                      value={formData.emergency_contact_phone ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergency_contact_phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g. Peanuts"
                      className={inputClass}
                      value={formData.allergies ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, allergies: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Medical Conditions</label>
                  <textarea
                    placeholder="Any conditions trainers should be aware of..."
                    className={`${inputClass} h-24 resize-none`}
                    value={formData.medical_conditions ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medical_conditions: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 pb-6">
                  <label className={labelClass}>Bio</label>
                  <textarea
                    placeholder="Short athlete bio..."
                    className={`${inputClass} h-24 resize-none`}
                    value={formData.bio ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6" />
                      PROCESSING...
                    </>
                  ) : (
                    "UPDATE STUDENT"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
