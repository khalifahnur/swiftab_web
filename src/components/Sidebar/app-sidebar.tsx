"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { fetchLogout } from "@/hooks/authhook/authhooks";
import { useAuth } from "@/components/auth/AuthContext";
import menuItems from "./Menu";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Hexagon,
  HelpCircle,
  Headset,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

type MenuItem = (typeof menuItems)[number];

const SIDEBAR_BG = "#0f1115";
const SURFACE_BG = "#181b21";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [logoFailed, setLogoFailed] = useState(false);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((group) => group !== title)
        : [...prev, title],
    );
  };

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: fetchLogout,
    onSuccess: () => {
      toast.success("Logged out");
      localStorage.clear();
      router.replace("/signin");
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const renderMenuItem = (item: MenuItem) => {
    const isChildActive =
      item.children?.some((child) => pathname === child.url) ?? false;
    const isActive =
      pathname === item.url ||
      pathname.startsWith(`${item.url}/`) ||
      isChildActive;
    const isOpen = openGroups.includes(item.title) || isChildActive;

    return (
      <Fragment key={item.title}>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            onClick={() => item.children && toggleGroup(item.title)}
            className={cn(
              "h-10 rounded-lg px-3 transition-all duration-200 gap-3",
              isActive
                ? "bg-[#0f766e] text-white shadow-md shadow-[#0f766e]/20 hover:bg-[#0f766e] hover:text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Link
              href={item.children ? "#" : item.url}
              className="flex gap-5 items-center w-full"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span
                className={cn(
                  "truncate",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {item.title}
              </span>
              {item.children && (
                <ChevronDown
                  className={cn(
                    "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Fragment>
    );
  };

  if (isLoading || !user) {
    return (
      <Sidebar collapsible="icon" variant="inset" className="p-0 border-none">
        <div className="flex h-full flex-col bg-[#0f1115]">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </Sidebar>
    );
  }

  const initials = getInitials(user?.name);
  const primaryItems = menuItems.filter((item) => item.title !== "Settings");
  const secondaryItems = menuItems.filter((item) => item.title === "Settings");

  return (
    <Sidebar collapsible="icon" variant="inset" className="p-0 border-none">
      <div className="flex h-full flex-col bg-[#0f1115]">
        <SidebarHeader className="px-5 py-3">
          <div className="flex items-center gap-3 pl-1">
            {!logoFailed ? (
              <Image
                src="/assets/logo/logo2.png"
                alt="Swiftab"
                width={100}
                height={66}
                priority
                onError={() => setLogoFailed(true)}
                className="shrink-0 rounded-lg object-contain items-center ml-10"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] text-white shadow-lg shadow-[#0f766e]/20">
                <Hexagon className="h-5 w-5 fill-current" />
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col px-3 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              {state === "expanded" && (
                <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Main Menu
                </p>
              )}
              <SidebarMenu className="gap-1.5">
                {primaryItems.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {secondaryItems.length > 0 && (
            <SidebarGroup className="mt-4">
              <SidebarGroupContent>
                {state === "expanded" && (
                  <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    System
                  </p>
                )}
                <SidebarMenu className="gap-1.5">
                  {secondaryItems.map(renderMenuItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2 text-slate-300 outline-none transition-all duration-200 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10",
                    state === "collapsed" && "justify-center"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-white/10">
                    <AvatarFallback className="rounded-lg bg-[#0f766e] text-xs font-bold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {state === "expanded" && (
                    <>
                      <div className="grid flex-1 text-left leading-tight overflow-hidden">
                        <span className="truncate text-sm font-bold text-white">
                          {user?.name ?? "Account"}
                        </span>
                        <span className="truncate text-xs font-medium text-slate-400">
                          {user?.email ?? "—"}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-slate-500" />
                    </>
                  )}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64 rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  style={{ backgroundColor: `${SURFACE_BG}fa` }}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-2.5 font-normal">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-lg border border-white/10">
                          <AvatarFallback className="rounded-lg text-sm font-bold text-white bg-[#0f766e]">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid leading-tight">
                          <span className="truncate text-sm font-bold text-white">
                            {user?.name ?? "Account"}
                          </span>
                          <span className="truncate text-xs font-medium text-slate-400 mt-0.5">
                            {user?.email ?? "—"}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-1 bg-white/10" />
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push("/help")}
                      className="w-full cursor-pointer rounded-lg py-2.5 px-3 text-slate-300 focus:bg-white/10 focus:text-white font-medium flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Help Center</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => router.push("/support")}
                      className="w-full cursor-pointer rounded-lg py-2.5 px-3 text-slate-300 focus:bg-white/10 focus:text-white font-medium flex items-center gap-2"
                    >
                      <Headset className="h-4 w-4" />
                      <span>Live Support</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="my-1 bg-white/10" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer rounded-lg py-2.5 px-3 text-red-400 focus:bg-red-500/10 focus:text-red-400 font-medium flex items-center gap-2"
                    >
                      {logoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span>
                        {logoutMutation.isPending
                          ? "Logging out…"
                          : "Log out"}
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}