import {
  LayoutDashboard,
  Inbox,
  MessageSquareText,
  Tag,
  Hotel,
  Bed,
  Calendar,
  Activity,
  User,
  Settings,
  Users,
  BarChart3,
  ShieldCheck,
  Globe,
  Briefcase,
  Users2
} from "lucide-react";
import React from "react";

export type ModuleID = "PMS" | "CRM" | "CHANNEL_MANAGER" | "BOOKING_ENGINE" | "FLIGHTS" | "HOTELS" | "PACKAGES" | "BUS" | "TRAIN" | "SYSTEM_AGENT" | "SYSTEM_ADMIN";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  allowedRoles?: string[]; // Legacy role override
  requiredPermission?: string; // Dynamic permission check
}

export interface ModuleConfig {
  id: ModuleID;
  label: string;
  icon: React.ElementType;
  description: string;
  navItems: NavItem[];
  allowedRoles?: string[];
  requiredPermission?: string;
}
export const MODULES: ModuleConfig[] = [
  {
    id: "PMS",
    label: "PMS Workspace",
    icon: Hotel,
    description: "Manage reservations, rooms, and daily operations.",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PROPERTY_ADMIN", "AGENT"],
    navItems: [
      { name: "PMS Overview", href: "/pms", icon: LayoutDashboard, exact: true },
      { name: "Reservations", href: "/pms/reservations", icon: Inbox },
      { name: "Properties", href: "/pms/properties", icon: Hotel },
      { name: "Rooms & Setup", href: "/pms/rooms", icon: Bed },
      { name: "Calendar", href: "/pms/calendar", icon: Calendar },
    ]
  },
  {
    id: "CRM",
    label: "CRM Workspace",
    icon: Users2,
    description: "Marketing, loyalty, and guest communications.",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PROPERTY_ADMIN"],
    navItems: [
      { name: "CRM Overview", href: "/crm", icon: LayoutDashboard, exact: true },
      { name: "Reviews", href: "/crm/reviews", icon: MessageSquareText },
      { name: "Promotions", href: "/crm/promotions", icon: Tag },
      { name: "Loyalty Program", href: "/crm/loyalty", icon: ShieldCheck },
    ]
  },
  {
    id: "CHANNEL_MANAGER",
    label: "Channel Manager",
    icon: Globe,
    description: "Distribute inventory across OTAs.",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "PROPERTY_ADMIN"],
    navItems: [
      { name: "CM Overview", href: "/channel", icon: LayoutDashboard, exact: true },
      { name: "Sync Status", href: "/channel/analytics", icon: Activity },
      { name: "Yield Management", href: "/channel/yield", icon: BarChart3 },
    ]
  },
  {
    id: "SYSTEM_AGENT",
    label: "Agent Portal",
    icon: Briefcase,
    description: "Manage B2B partners and commissions.",
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "AGENT"],
    navItems: [
      { name: "Agent Overview", href: "/agent", icon: LayoutDashboard, exact: true },
      { name: "My Bookings", href: "/agent/bookings", icon: Inbox },
      { name: "Commissions", href: "/agent/commissions", icon: BarChart3 },
    ]
  },
  {
    id: "SYSTEM_ADMIN",
    label: "Admin & Settings",
    icon: ShieldCheck,
    description: "Global settings and platform oversight.",
    navItems: [
      { name: "Admin Overview", href: "/admin", icon: LayoutDashboard, exact: true, requiredPermission: "SYSTEM_CONFIG" },
      { name: "Users & Team", href: "/admin/users", icon: User, requiredPermission: "MANAGE_USERS" },
      { name: "Audit Logs", href: "/admin/logs", icon: Activity, requiredPermission: "SYSTEM_CONFIG" },
      { name: "Global Settings", href: "/admin/settings", icon: Settings, requiredPermission: "SYSTEM_CONFIG" },
    ]
  }
];
