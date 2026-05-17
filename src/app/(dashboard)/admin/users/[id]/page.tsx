"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2,
  ArrowLeft,
  Save,
  Loader2,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { useRole } from "@/hooks/useRole";
import { useUserProfile } from "@/hooks/useUser";
import { api, handleApiError } from "@/lib/api";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { MODULES } from "@/config/modules";

const MODULES_LIST = MODULES.map(m => m.id);

const ROLE_MAX_PERMISSIONS: Record<string, string[]> = {
  "SUPER_ADMIN": ["*"],
  "ADMIN": ["MANAGE_USERS", "VIEW_FINANCIALS", "SYSTEM_CONFIG", "MANAGE_ROOMS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "PROPERTY_ADMIN": ["MANAGE_USERS", "MANAGE_ROOMS", "VIEW_FINANCIALS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "MANAGER": ["MANAGE_ROOMS", "CREATE_BOOKING", "VIEW_BOOKING"],
  "AGENT": ["CREATE_BOOKING", "VIEW_BOOKING", "VIEW_FINANCIALS"],
  "FRONT_DESK": ["CREATE_BOOKING", "VIEW_BOOKING"],
  "HOUSEKEEPING": ["MANAGE_ROOMS"],
  "ACCOUNTANT": ["VIEW_FINANCIALS"],
  "EDA": ["CREATE_BOOKING", "VIEW_BOOKING"]
};

const roleLabels: Record<string, string> = {
  "SUPER_ADMIN": "HQ System Boss (Super Admin)",
  "ADMIN": "Global Administrator",
  "PROPERTY_ADMIN": "Regional Single Property Admin",
  "FRONT_DESK": "Reception & Front Desk Management",
  "MANAGER": "Property Manager",
  "ACCOUNTANT": "Financial Accountant Head",
  "AGENT": "Agency Head",
  "EDA": "External Distributing Agent (EDA)",
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { hasPermission, getAllowedCreationRoles } = useRole();
  const allowedRoles = getAllowedCreationRoles();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Target User Data
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [firstName, setFirstName] = useState("");
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/user/admin/account/${userId}`);
        const user = response.data;
        
        setEmail(user.email || "");
        setRole(user.role || "USER");
        setFirstName(user.first_name || "");
        setEnabledModules(user.enabled_modules || []);
        setActivePermissions(user.active_permissions || []);
      } catch (err: any) {
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Sync default permissions and modules ONLY when role explicitly changes manually
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole === "SUPER_ADMIN") {
        setActivePermissions(["*"]);
    } else {
        setActivePermissions(ROLE_MAX_PERMISSIONS[newRole] || []);
    }
    
    // Auto-select modules the new role has access to
    const defaultModules = MODULES.filter(m => !m.allowedRoles || m.allowedRoles.includes(newRole)).map(m => m.id);
    setEnabledModules(defaultModules);
  };

  const toggleModule = (mod: string) => {
    setEnabledModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  const togglePermission = (perm: string) => {
    setActivePermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.patch(`/user/admin/account/${userId}`, {
        role,
        first_name: firstName || undefined,
        enabled_modules: enabledModules,
        active_permissions: activePermissions
      });
      
      router.push("/admin/users");
    } catch (err: any) {
      setError(handleApiError(err));
      setIsSubmitting(false);
    }
  };

  if (isLoading || isProfileLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-muted-foreground/60" />
             Edit Access Permissions
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
             Modify role access, module subscriptions, and permissions for this user.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm"
      >
        <form onSubmit={handleUpdateUser} className="space-y-8">
            
            <div className="bg-muted border border-border p-5 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center font-bold shadow-sm">
                  {email ? email.substring(0, 2).toUpperCase() : "AA"}
               </div>
               <div>
                  <p className="font-bold text-lg">{firstName || "Unassigned"}</p>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5"><Mail className="w-3 h-3" /> {email}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Identity Section */}
               <div className="space-y-6">
                 <div>
                   <h3 className="text-lg font-bold mb-4">Identity Information</h3>
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                         Staff First Name
                       </label>
                       <input
                         type="text"
                         value={firstName}
                         onChange={(e) => setFirstName(e.target.value)}
                         placeholder="John"
                         className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm placeholder:text-muted-foreground/40"
                       />
                     </div>
                   </div>
                 </div>
               </div>

               {/* Access & Configuration Section */}
               <div className="space-y-6">
                 <div>
                   <h3 className="text-lg font-bold mb-4">Access Configuration</h3>
                   <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                         Role Designation
                       </label>
                       <select
                         value={role}
                         onChange={(e) => handleRoleChange(e.target.value)}
                         className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm font-medium"
                       >
                          {/* Include current role even if they cannot assign it to others, so the dropdown doesn't break */}
                          {!allowedRoles.includes(role) && (
                            <option value={role} disabled className="bg-muted text-muted-foreground italic">
                              {roleLabels[role] || role.replace(/_/g, " ")} (Current - Cannot Reassign)
                            </option>
                          )}
                          {allowedRoles.map((r) => (
                            <option key={r} value={r} className="bg-background">
                              {roleLabels[r] || r.replace(/_/g, " ")}
                            </option>
                          ))}
                       </select>
                     </div>

                     {/* SaaS Modules Toggle Grid */}
                     <div className="space-y-3">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                         Subscribed SaaS Modules
                       </label>
                       <div className="grid grid-cols-2 gap-3">
                         {MODULES_LIST.map((mod) => (
                           <label key={mod} className={cn(
                             "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold select-none",
                             enabledModules.includes(mod) 
                               ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400 shadow-sm" 
                               : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                           )}>
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={enabledModules.includes(mod)}
                               onChange={() => toggleModule(mod)}
                             />
                             <div className={cn(
                               "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                               enabledModules.includes(mod) ? "bg-blue-600 border-blue-600" : "border-muted-foreground/30"
                             )}>
                               {enabledModules.includes(mod) && <CheckCircle2 className="w-3 h-3 text-white" />}
                             </div>
                             {mod.replace(/_/g, " ")}
                           </label>
                         ))}
                       </div>
                     </div>

                     {/* Role Permissions Bounds */}
                     <div className="space-y-3">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex flex-col gap-1">
                         <span>Explicit Role Permissions</span>
                         <span className="text-[10px] text-muted-foreground/60 normal-case tracking-normal font-medium">Bound by {roleLabels[role] || role} limits</span>
                       </label>
                       <div className="grid grid-cols-2 gap-3">
                         {role === "SUPER_ADMIN" ? (
                             <div className="col-span-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                               Super Admins bypass all permission checks.
                             </div>
                         ) : ROLE_MAX_PERMISSIONS[role]?.map((perm) => (
                           <label key={perm} className={cn(
                             "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold select-none",
                             activePermissions.includes(perm) 
                               ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                               : "bg-background border-border text-muted-foreground hover:bg-muted/50 opacity-60"
                           )}>
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={activePermissions.includes(perm)}
                               onChange={() => togglePermission(perm)}
                             />
                             <div className={cn(
                               "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                               activePermissions.includes(perm) ? "bg-emerald-600 border-emerald-600" : "border-muted-foreground/30"
                             )}>
                               {activePermissions.includes(perm) && <CheckCircle2 className="w-3 h-3 text-white" />}
                             </div>
                             {perm.replace(/_/g, " ")}
                           </label>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-6 border-t border-border flex justify-end gap-4">
               <Link 
                 href="/admin/users"
                 className="px-6 py-3 rounded-xl font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
               >
                  Cancel
               </Link>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     Saving...
                   </>
                 ) : (
                   <>
                     <Save className="w-5 h-5" />
                     Save Changes
                   </>
                 )}
               </button>
            </div>
        </form>
      </motion.div>
    </div>
  );
}
