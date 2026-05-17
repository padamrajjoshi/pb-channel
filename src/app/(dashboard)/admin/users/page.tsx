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
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAllUsers, useUserProfile } from "@/hooks/useUser";
import { useRole, UserRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/useToast";
import { api, handleApiError } from "@/lib/api";
import { cn } from "@/utils/cn";
import Link from "next/link";

export default function UsersManagementPage() {
  const { profile } = useUserProfile();
  const { users, isLoading, mutate } = useAllUsers();
  const { hasPermission, getAllowedCreationRoles, isAgent } = useRole();
  const { success, error: toastError } = useToast();
  
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const filteredUsers = users.filter((u: any) => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.role?.toLowerCase().includes(search.toLowerCase())
  );


  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you absolutely certain you want to purge this staff member account?")) return;
    
    try {
      await api.delete(`/user/admin/account/${userId}`);
      success("Staff member account successfully purged.");
      await mutate();
      setActiveDropdown(null);
    } catch (err: any) {
      toastError(handleApiError(err));
    }
  };

  const activeUserRankings: Record<string, string> = {
    "SUPER_ADMIN": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "ADMIN": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    "SINGLE_PROPERTY_ADMIN": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "PROPERTY_ADMIN": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    "FRONT_DESK": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "RECEPTION": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    "MANAGER": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    "ACCOUNTANT": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    "EXTERNAL_AGENT": "bg-muted text-muted-foreground border-border",
    "AGENT": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "EDA": "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    "USER": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    "CUSTOMER": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
  };

  const roleLabels: Record<string, string> = {
    "SUPER_ADMIN": "HQ System Boss (Super Admin)",
    "ADMIN": "Global Administrator",
    "PROPERTY_ADMIN": "Regional Single Property Admin",
    "FRONT_DESK": "Reception & Front Desk Management",
    "RECEPTION": "Receptionist",
    "MANAGER": "Property Manager",
    "ACCOUNTANT": "Financial Accountant Head",
    "AGENT": "Agency Head",
    "EDA": "External Distributing Agent (EDA)",
    "CUSTOMER": "Standard User (App/Consumer)"
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-muted-foreground/60" />
             {isAgent ? "My Agency Team" : "Global Directory"}
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
             {isAgent ? "Manage your downline team members and delegates." : "Provision new staff accounts and control global system access."}
          </p>
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
           {getAllowedCreationRoles().length > 0 && (
             <Link 
                href="/admin/users/create"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
             >
                <Plus className="w-4 h-4" />
                Provision Account
             </Link>
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
                                    initial={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(8px)" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="absolute right-12 top-6 z-50 w-64 bg-background/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
                                  >
                                    <div className="p-2 space-y-1">
                                       <div className="px-3 py-2 border-b border-border/40 mb-2">
                                          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">Quick Actions</p>
                                       </div>
                                       
                                       <Link 
                                          href={`/admin/users/${user.id}`}
                                          className="w-full flex items-center gap-3 px-2 py-2 text-sm text-foreground hover:bg-muted/60 rounded-xl transition-all font-medium text-left group"
                                       >
                                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                             <ShieldCheck className="w-4 h-4" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-bold">Manage Access</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">Modify roles & modules</span>
                                          </div>
                                       </Link>

                                       <button 
                                         onClick={() => handleDeleteUser(user.id)}
                                         disabled={user.id === profile?.id}
                                         className="w-full flex items-center gap-3 px-2 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all font-medium text-left group"
                                       >
                                          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-300">
                                             <Trash2 className="w-4 h-4" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-bold">{user.id === profile?.id ? "Cannot Purge Self" : "Terminate Account"}</span>
                                            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-medium">Permanently remove access</span>
                                          </div>
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



    </div>
  );
}
