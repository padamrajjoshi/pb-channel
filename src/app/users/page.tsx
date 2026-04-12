"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Loader2,
  Trash2,
  CheckCircle2,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllUsers, useUserProfile } from "@/hooks/useUser";
import { api, handleApiError } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/utils/cn";

export default function UsersManagementPage() {
  const { profile } = useUserProfile();
  const { users, isLoading, mutate } = useAllUsers();
  
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EXTERNAL_AGENT");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  
  const filteredUsers = users.filter((u: any) => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/user/admin/create-account", {
        email,
        role,
        app_source: "pb-channel",
        password: password || undefined,
        first_name: firstName || undefined
      });
      
      await mutate();
      setIsModalOpen(false);
      setEmail("");
      setPassword("");
      setFirstName("");
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you absolutely certain you want to purge this staff member account?")) return;
    
    try {
      await api.delete(`/user/admin/account/${userId}`);
      await mutate();
      setActiveDropdown(null);
    } catch (err: any) {
      alert(handleApiError(err));
    }
  };

  const activeUserRankings: Record<string, string> = {
    "SUPER_ADMIN": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "SINGLE_PROPERTY_ADMIN": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "FRONT_DESK": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "ACCOUNTANT": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "EXTERNAL_AGENT": "bg-muted text-muted-foreground border-border",
    "USER": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-muted-foreground/60" />
             Staff & Accounts
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">Provision new staff accounts and control global system access.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff members..."
                className="bg-card border border-border rounded-xl py-2 pl-9 pr-4 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 shadow-sm"
              />
           </div>
           {profile?.role === "SUPER_ADMIN" && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
             >
                <Plus className="w-4 h-4" />
                Provision Account
             </button>
           )}
        </div>
      </div>

      {isLoading ? (
         <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
      ) : (
         <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <th className="p-6">Employee Details</th>
                        <th className="p-6">Role & Designation</th>
                        <th className="p-6">Status</th>
                        <th className="p-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {filteredUsers.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="p-12 text-center text-muted-foreground font-medium italic">
                              No staff matches the criteria found.
                           </td>
                        </tr>
                     ) : filteredUsers.map((user: any) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-foreground shadow-sm mt-1">
                                    {user.email ? user.email.substring(0, 2).toUpperCase() : "AA"}
                                 </div>
                                 <div className="space-y-1">
                                    <p className="font-bold">{user.first_name || "Unassigned"}</p>
                                    <p className="text-muted-foreground text-xs flex items-center gap-1.5"><Mail className="w-3 h-3" /> {user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className={cn(
                                 "text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest whitespace-nowrap",
                                 activeUserRankings[user.role] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              )}>
                                 {user.role.replace(/_/g, " ")}
                              </span>
                           </td>
                           <td className="p-6">
                              {user.is_verified ? (
                                 <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" /> Verified
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Pending Setup
                                 </span>
                              )}
                           </td>
                           <td className="p-6 text-right relative" onMouseLeave={() => setActiveDropdown(null)}>
                              <button 
                                 onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                 className="p-2 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border"
                              >
                                 <MoreVertical className="w-5 h-5" />
                              </button>
                              
                              <AnimatePresence>
                                {activeDropdown === user.id && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-12 top-6 z-50 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                                  >
                                    <div className="p-1">
                                      <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors font-bold text-left"
                                        disabled={user.id === profile?.id}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        {user.id === profile?.id ? "Cannot Purge Self" : "Terminate Account"}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Provisioning Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision Global Account">
         <form onSubmit={handleCreateUser} className="space-y-6">
            
            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-1" />
                <div>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-200 uppercase tracking-widest mb-1">Administrative Privileges</p>
                    <p className="text-blue-600/60 dark:text-blue-200/60 text-[11px] leading-relaxed">
                      Only Super Admins can issue credentials matching active global configurations.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">
                   Working Email Address
                 </label>
                 <input
                   required
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="e.g. jdoe@pebiglobe.com"
                   className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm placeholder:text-muted-foreground/40"
                 />
               </div>

               <div className="space-y-2 col-span-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">
                   Staff First Name (Optional)
                 </label>
                 <input
                   type="text"
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                   className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
                 />
               </div>

               <div className="space-y-2 col-span-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">
                   Role Designation
                 </label>
                 <select
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm"
                 >
                    <option value="SUPER_ADMIN" className="bg-card">HQ System Boss (Super Admin)</option>
                    <option value="SINGLE_PROPERTY_ADMIN" className="bg-card">Regional Single Property Admin</option>
                    <option value="FRONT_DESK" className="bg-card">Reception & Front Desk Management</option>
                    <option value="ACCOUNTANT" className="bg-card">Financial Accountant Head</option>
                    <option value="EXTERNAL_AGENT" className="bg-card">External Distributing Agent (OTA)</option>
                    <option value="USER" className="bg-card">Standard User (App/Consumer)</option>
                 </select>
               </div>

               <div className="space-y-2 col-span-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">
                   Initial Temporary Password
                 </label>
                 <input
                   required
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••••"
                   className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all text-sm placeholder:text-muted-foreground/40"
                 />
                 <p className="text-[10px] text-muted-foreground text-left">The employee should be prompted to reset their OTP stack after logging in securely via our authentication gate.</p>
               </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-left">
                {error}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
               <button 
                 type="button"
                 onClick={() => setIsModalOpen(false)}
                 className="px-5 py-2.5 rounded-xl font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
               >
                  Cancel Let
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>Provision & Invite Staff</>
                 )}
               </button>
            </div>
         </form>
      </Modal>

    </div>
  );
}
