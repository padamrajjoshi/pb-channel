"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2,
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useRole } from "@/hooks/useRole";
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

export default function CreateUserPage() {
  const router = useRouter();
  const { isAdmin, isAgent, getAllowedCreationRoles } = useRole();
  const allowedRoles = getAllowedCreationRoles();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState(allowedRoles[0] || "USER");
  const [firstName, setFirstName] = useState("");
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync default permissions and modules when role changes
  React.useEffect(() => {
    if (role === "SUPER_ADMIN") {
        setActivePermissions(["*"]);
    } else {
        setActivePermissions(ROLE_MAX_PERMISSIONS[role] || []);
    }
    
    // Auto-select modules the role has access to
    const defaultModules = MODULES.filter(m => !m.allowedRoles || m.allowedRoles.includes(role)).map(m => m.id);
    setEnabledModules(defaultModules);
  }, [role]);

  const toggleModule = (mod: string) => {
    setEnabledModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  const togglePermission = (perm: string) => {
    setActivePermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/user/admin/create-account", {
        email,
        role,
        app_source: "pb-dashboard",
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
             {isAgent ? "Provision Team Member" : "Provision Global Account"}
          </h2>
          <p className="text-muted-foreground mt-2 font-medium">
             Configure role access, module subscriptions, and permissions for the new user.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-sm"
      >
        <form onSubmit={handleCreateUser} className="space-y-8">
            
            {isAdmin && (
              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
                  <ShieldCheck className="w-7 h-7 text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-200 uppercase tracking-widest mb-1.5">Administrative Privileges</p>
                      <p className="text-blue-600/70 dark:text-blue-200/70 text-sm leading-relaxed">
                        Only Admins can issue credentials matching active global configurations. B2B Client isolation is automatically applied to non-Admin roles.
                      </p>
                  </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Identity Section */}
               <div className="space-y-6">
                 <div>
                   <h3 className="text-lg font-bold mb-4">Identity Information</h3>
                   <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                         Working Email Address
                       </label>
                       <input
                         required
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         placeholder="e.g. jdoe@pebiglobe.com"
                         className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm placeholder:text-muted-foreground/40"
                       />
                     </div>

                     <div className="space-y-2">
                       <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                         Staff First Name (Optional)
                       </label>
                       <input
                         type="text"
                         value={firstName}
                         onChange={(e) => setFirstName(e.target.value)}
                         placeholder="John"
                         className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm placeholder:text-muted-foreground/40"
                       />
                     </div>
                     <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                       <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                       <div className="space-y-1">
                         <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Secure Invite Sent via Email</p>
                         <p className="text-xs text-blue-600/70 dark:text-blue-200/70 leading-relaxed">
                           Upon creation, this staff member will automatically receive a welcome email with a secure link to configure their initial password and access the platform.
                         </p>
                       </div>
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
                         onChange={(e) => setRole(e.target.value)}
                         className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-sm font-medium"
                       >
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
                     Provisioning...
                   </>
                 ) : (
                   <>
                     <Save className="w-5 h-5" />
                     Provision Account
                   </>
                 )}
               </button>
            </div>
        </form>
      </motion.div>
    </div>
  );
}
