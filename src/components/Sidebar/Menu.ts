import {
  LucideIcon,
  LayoutDashboard,
  ListOrdered,
  Table2,
  Utensils,
  Users,
  ChartNetwork,
  Grid3x3,
  CalendarRange,
  Settings2,
  List
} from "lucide-react";

interface SidebarItem {
  icon: LucideIcon;
  title: string;
  url: string;
  children?: SidebarItem[];
}

const menuItems: SidebarItem[] = [
  { icon: LayoutDashboard, title: "Dashboard", url: "/home" },
  { icon: ChartNetwork, title: "Report", url: "/analytics" },
  {icon:List,title:"Reservations",url:'/reservations'},
  { icon: ListOrdered, title: "Orders", url: "/orders" },

  {
    icon: Utensils,
    title: "Manage Dishes",
    url: "/dishes",
  },
  {
    icon: Table2,
    title: "Manage Tables",
    url: "#",
    children: [
      { icon: Grid3x3, title: "Floor Plan", url: "/tables/floorplan" },
      { icon: Table2, title: "Grid", url: "/tables/grid" },
    ],
  },
  {
    icon: Settings2,
    title: "Settings",
    url: "/settings",
  },
];

export default menuItems;
