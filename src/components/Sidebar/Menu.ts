import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  ClipboardList,
  ConciergeBell,
  LayoutTemplate,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  icon: LucideIcon;
  title: string;
  url: string;
  children?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  { icon: LayoutDashboard, title: "Overview", url: "/home" },
  // { icon: TrendingUp, title: "Analytics", url: "/analytics" },
  { icon: CalendarCheck, title: "Reservations", url: "/reservations" },
  { icon: ClipboardList, title: "Live Orders", url: "/orders" },
  { icon: ConciergeBell, title: "Menu & Dishes", url: "/dishes" },
  { icon: LayoutTemplate, title: "Floor Plan", url: "/tables/floorplan" },
  { icon: Settings, title: "Settings", url: "/settings" },
];

export default menuItems;