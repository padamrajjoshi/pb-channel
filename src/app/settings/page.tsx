"use client";

import React, { useState, useEffect } from "react";
import {
   Settings as SettingsIcon,
   User,
   Bell,
   Shield,
   CreditCard,
   Globe,
   Mail,
   Smartphone,
   ChevronRight,
   LogOut,
   Moon,
   Sun,
   Loader2,
   Save,
   CheckCircle2,
   Laptop,
   Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { useUserProfile, useUserSettings, useUserSessions } from "@/hooks/useUser";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
   const router = useRouter();
   const { profile, isLoading: profileLoading, mutate: mutateProfile } = useUserProfile();
   const { settings, isLoading: settingsLoading, mutate: mutateSettings } = useUserSettings();
   const { sessions, isLoading: sessionsLoading, mutate: mutateSessions } = useUserSessions();

   const [activeEditor, setActiveEditor] = useState<string | null>(null);

   // Settings states
   const [syncAlertsEnabled, setSyncAlertsEnabled] = useState(true);
   const [syncThreshold, setSyncThreshold] = useState(3);

   // Profile states
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [companyName, setCompanyName] = useState("");

   const [isSaving, setIsSaving] = useState(false);
   const [saveMessage, setSaveMessage] = useState("");

   // OTP Modal states
   const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
   const [otpCode, setOtpCode] = useState("");
   const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

   useEffect(() => {
      if (settings) {
         setSyncAlertsEnabled(settings.sync_alerts_enabled);
         setSyncThreshold(settings.sync_alert_threshold);
      }
   }, [settings]);

   useEffect(() => {
      if (profile) {
         setFirstName(profile.first_name || "");
         setLastName(profile.last_name || "");
         setCompanyName(profile.company_name || "");
      }
   }, [profile]);

   const handleLogout = async () => {
      try {
         await api.post("/auth/logout", {});
      } catch (e) {
         // Proceed with local logout regardless of network status
      } finally {
         router.push("/login");
      }
   };

   const handleSaveSettings = async () => {
      setIsSaving(true);
      setSaveMessage("");
      try {
         await api.patch('/user/settings', { sync_alerts_enabled: syncAlertsEnabled, sync_alert_threshold: syncThreshold });
         await mutateSettings();
         setSaveMessage("Settings saved successfully.");
         setTimeout(() => setSaveMessage(""), 3000);
         setActiveEditor(null);
      } catch (error) {
         console.error(error);
         setSaveMessage("Failed to save settings.");
      } finally {
         setIsSaving(false);
      }
   };

   const handleSaveProfile = async () => {
      setIsSaving(true);
      setSaveMessage("");
      try {
         await api.put('/user/profile', {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName
         });
         setIsOtpModalOpen(true);
      } catch (error: any) {
         console.error(error);
         alert(error.response?.data?.detail || "Failed to request profile update.");
      } finally {
         setIsSaving(false);
      }
   };

   const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!otpCode) return;

      setIsVerifyingOtp(true);
      try {
         await api.post('/user/verify-update', { otp: otpCode });
         await mutateProfile(); // Force SWR cache refresh

         setSaveMessage("Identity & Profile updated successfully.");
         setTimeout(() => setSaveMessage(""), 3000);
         setActiveEditor(null);
         setIsOtpModalOpen(false);
         setOtpCode("");
      } catch (error: any) {
         console.error(error);
         alert(error.response?.data?.detail || "Incorrect OTP. Verification failed.");
      } finally {
         setIsVerifyingOtp(false);
      }
   };

   const handleRevokeSession = async (sessionId: number) => {
      // Optimistically hide from UI immediately!
      mutateSessions((current: any) => current?.filter((s: any) => s.id !== sessionId), false);
      try {
         await api.delete(`/user/sessions/${sessionId}`);
         await mutateSessions(); // Re-validate sync
      } catch (error: any) {
         if (error.response?.status !== 404) {
            console.error(error);
         }
      }
   };

   if (profileLoading || settingsLoading || sessionsLoading) {
      return <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
   }

   const parseDevice = (userAgent?: string) => {
      if (!userAgent) return "Authenticated Device";
      const ua = userAgent.toLowerCase();
      let os = "Unknown OS";
      if (ua.includes("mac")) os = "Mac OS";
      else if (ua.includes("win")) os = "Windows";
      else if (ua.includes("linux")) os = "Linux";
      else if (ua.includes("android")) os = "Android";
      else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
   
      let browser = "Web Browser";
      if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
      else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
      else if (ua.includes("firefox")) browser = "Firefox";
      else if (ua.includes("edg")) browser = "Edge";
      
      return `${os} / ${browser}`;
   };

   // Generate initials
   const initials = profile?.email ? profile.email.substring(0, 2).toUpperCase() : "AA";

   const renderEditor = (id: string, name: string, icon: any, children: React.ReactNode, onSave: () => void) => {
      const isExpanded = activeEditor === id;
      const Icon = icon;

      return (
         <div className="bg-card border border-border rounded-3xl overflow-hidden transition-all shadow-sm">
            <button
               onClick={() => setActiveEditor(isExpanded ? null : id)}
               className={cn(
                  "w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-all text-left",
                  isExpanded ? "bg-muted border-b border-border" : ""
               )}
            >
               <div className="flex items-center gap-6">
                  <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                     isExpanded ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-muted border-border text-muted-foreground group-hover:bg-blue-600 group-hover:text-white"
                  )}>
                     <Icon className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="font-bold">{name}</h4>
                     {isExpanded && <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-medium italic">Currently Editing Area</p>}
                  </div>
               </div>
               <ChevronRight className={cn("w-5 h-5 text-muted-foreground/40 transition-transform", isExpanded ? "rotate-90" : "")} />
            </button>

            <AnimatePresence>
               {isExpanded && (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                  >
                     <div className="p-6 bg-muted/30 space-y-6">
                        {children}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                           <button
                              onClick={() => setActiveEditor(null)}
                              className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                           >
                              Cancel
                           </button>
                           <button
                              onClick={onSave}
                              disabled={isSaving}
                              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                           >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Changes
                           </button>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      );
   };

   return (
      <div className="space-y-12 pb-24">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <SettingsIcon className="w-8 h-8 text-muted-foreground/60" />
                  Settings
               </h2>
               <p className="text-muted-foreground mt-2 font-medium">Manage your portfolio configurations and account security.</p>
            </div>

            {saveMessage && (
               <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-lg flex items-center gap-2"
               >
                  <CheckCircle2 className="w-4 h-4" />
                  {saveMessage}
               </motion.div>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Sidebar / Quick Links */}
            <div className="space-y-6">
               <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-4 py-2">
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/20">
                        {initials}
                     </div>
                     <div>
                        <h3 className="font-bold text-lg break-all">{profile?.email}</h3>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mt-1">{profile?.role?.replace("_", " ")}</p>
                     </div>
                  </div>

                  <div className="pt-4 space-y-2">
                     <button className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 text-foreground hover:bg-muted transition-all border border-border cursor-not-allowed opacity-60">
                        <div className="flex items-center gap-3">
                           <Moon className="w-4 h-4 text-blue-500" />
                           <span className="text-sm font-medium">Sync with System Theme</span>
                        </div>
                        <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                           <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                        </div>
                     </button>
                     <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-xl font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 text-sm hover:text-white border border-rose-500/20 transition-all shadow-lg shadow-rose-500/5 group"
                     >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Log out Session
                     </button>
                  </div>
               </div>

               <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl shadow-sm">
                  <h4 className="text-blue-600 dark:text-blue-200 font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                     Beta Access
                  </h4>
                  <p className="text-xs text-blue-600/60 dark:text-blue-200/50 leading-relaxed font-medium">
                     You are currently on the {settings?.subscription_plan} program. Automated dynamic pricing via AI is coming in Phase 6.
                  </p>
               </div>
            </div>

            {/* Main Content Areas */}
            <div className="lg:col-span-2 space-y-8">

               {/* Section 0: Profile Details */}
               <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                     <User className="w-3.5 h-3.5" /> Identity & Access Management
                  </h3>

                  {renderEditor("profile", "Employee Directory Details", User, (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">First Name</label>
                              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-sm" placeholder="e.g. John" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">Last Name</label>
                              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-sm" placeholder="e.g. Doe" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">Company / Property Assignment</label>
                           <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-sm" placeholder="e.g. Pebiglobe Corporate" />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic flex items-center gap-1.5"><Shield className="w-3 h-3" /> Changes to critical identity structures require active OTP authorization.</p>
                     </div>
                  ), handleSaveProfile)}
               </div>

               {/* Section 1 */}
               <div className="space-y-4 pt-4 border-t border-border mt-8">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                     <Bell className="w-3.5 h-3.5" /> Workflow & Notifications
                  </h3>

                  {renderEditor("alerts", "Sync Alerts", Bell, (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center bg-muted/50 dark:bg-white/5 p-4 rounded-xl border border-border dark:border-white/5">
                           <div>
                              <p className="font-bold text-sm">Critical OTA Sync Failures</p>
                              <p className="text-xs text-muted-foreground">Notify me immediately if an active channel refuses properties</p>
                           </div>
                           <button
                              onClick={() => setSyncAlertsEnabled(!syncAlertsEnabled)}
                              className={cn("w-12 h-6 rounded-full relative transition-colors cursor-pointer", syncAlertsEnabled ? "bg-blue-600" : "bg-muted dark:bg-slate-700")}
                           >
                              <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", syncAlertsEnabled ? "right-1 shadow-sm" : "left-1")} />
                           </button>
                        </div>

                        <div className="space-y-3">
                           <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex justify-between">
                              Failure Threshold count
                              <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 rounded">{syncThreshold}</span>
                           </label>
                           <input
                              type="range"
                              min="1" max="10"
                              value={syncThreshold}
                              onChange={(e) => setSyncThreshold(parseInt(e.target.value))}
                              className="w-full accent-blue-600"
                              disabled={!syncAlertsEnabled}
                           />
                           <p className="text-[11px] text-muted-foreground italic">Wait until consecutive failures reach this count before sending an email blast.</p>
                        </div>
                     </div>
                  ), handleSaveSettings)}

                  <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between opacity-70 shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center border border-border">
                           <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                           <h4 className="font-bold">Subscription</h4>
                           <p className="text-muted-foreground text-xs mt-1">Status: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">{settings?.billing_status}</span></p>
                        </div>
                     </div>
                     <span className="text-xs font-bold bg-muted text-foreground px-3 py-1.5 rounded-lg border border-border">Auto-managed</span>
                  </div>
               </div>

               {/* Section 3 */}
               <div className="space-y-4 pt-4">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                     <Shield className="w-3.5 h-3.5" /> Security & Access
                  </h3>

                  <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center border border-border">
                           <Shield className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                           <h4 className="font-bold">Password & Authentication</h4>
                           <p className="text-muted-foreground text-xs mt-1">Multi-factor authentication via OTP is actively enforcing policies.</p>
                        </div>
                     </div>
                     <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex gap-1 items-center">
                        <CheckCircle2 className="w-3 h-3" /> Secure
                     </span>
                  </div>

                  {/* Active Sessions Panel */}
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mt-6">
                     <div className="mb-6">
                         <h4 className="font-bold text-sm tracking-tight flex items-center gap-2 mb-1">
                             <Laptop className="w-4 h-4 text-muted-foreground" />
                             Active Logged-In Sessions
                         </h4>
                         <p className="text-xs text-muted-foreground">Manage your hardware sessions and remote connections universally.</p>
                     </div>
                     
                     <div className="space-y-3">
                         {sessions?.length === 0 ? (
                             <p className="text-xs font-medium text-muted-foreground p-4 text-center bg-muted/50 rounded-xl">No active sessions located.</p>
                         ) : (
                             sessions?.map((sess: any) => (
                                <div key={sess.id} className="flex items-center justify-between p-4 bg-muted/30 dark:bg-white/5 border border-border dark:border-white/5 rounded-2xl group transition-all hover:bg-muted/50">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                         <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-foreground">
                                             {parseDevice(sess.device_info)}
                                         </p>
                                         <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                             Authorized: {new Date(sess.created_at).toLocaleString()}
                                             {sess.ip_address && ` • IP: ${sess.ip_address}`}
                                         </p>
                                      </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-4">
                                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                                          Expires: {new Date(sess.expires_at).toLocaleDateString()}
                                      </span>
                                      
                                      <button 
                                        onClick={() => handleRevokeSession(sess.id)}
                                        className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20 focus:opacity-100"
                                        title="Revoke Terminate Session"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                </div>
                             ))
                         )}
                     </div>
                  </div>
               </div>

            </div>
         </div>

         {/* OTP Verification Modal */}
         <Modal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} title="Security Verification">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
               <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                  <Shield className="w-6 h-6 text-amber-500 dark:text-amber-400 mt-1" />
                  <div>
                     <p className="text-sm font-bold text-amber-600 dark:text-amber-200 uppercase tracking-widest mb-1">Authorization Required</p>
                     <p className="text-amber-600/70 dark:text-amber-200/70 text-[11px] leading-relaxed">
                        You are about to irreversibly update your primary identity. Enter the 6-digit confirmation code we just dispatched to your inbox.
                     </p>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left block">
                     6-Digit OTP Code
                  </label>
                  <input
                     required
                     type="text"
                     value={otpCode}
                     onChange={(e) => setOtpCode(e.target.value)}
                     placeholder="000000"
                     className="w-full bg-card border border-border rounded-xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition-all"
                  />
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button
                     type="button"
                     onClick={() => setIsOtpModalOpen(false)}
                     className="px-5 py-2.5 rounded-xl font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isVerifyingOtp}
                     className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                     {isVerifyingOtp ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                        <>Verify & Commit</>
                     )}
                  </button>
               </div>
            </form>
         </Modal>
      </div>
   );
}
