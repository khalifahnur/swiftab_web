"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { fetchLogout } from "@/hooks/authhook/authhooks";
import { useAuth } from "../auth/AuthContext";
import menuItems from "./Menu";

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
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, LogOut, Hexagon, HelpCircle, Headset } from "lucide-react";
import toast from "react-hot-toast";

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [logoutLoading, setLogoutLoading] = useState(false);

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
    onError: (error: any) => {
      toast.success("Logout failed");
      setLogoutLoading(false);
    },
  });

  if (isLoading || !user) {
    return (
      <Sidebar className="border-none bg-transparent">
        <SidebarContent className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/10" />
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-none bg-transparent" collapsible="icon">
      <SidebarHeader className="pt-8 pb-6 px-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#d4f870] flex items-center justify-center text-[#1a2e05] shrink-0">
            <Hexagon className="h-5 w-5 fill-current" />
          </div>
          {state === "expanded" && (
            <span className="font-bold text-xl text-white tracking-wide">
              Swiftab
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                
                return (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        onClick={() => item.children && toggleGroup(item.title)}
                        className="rounded-lg"
                        size="sm"
                      >
                        <Link href={item.children ? "#" : item.url}>
                          <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-gray-900" : "text-gray-300"}`} />
                          <span className="font-medium ">{item.title}</span>
                          {item.children && (
                            <ChevronDown
                              className={`ml-auto h-4 w-4 transition-transform ${openGroups.includes(item.title) ? "rotate-180" : ""}`}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    {item.children && (
                      <Collapsible open={openGroups.includes(item.title)} onOpenChange={() => toggleGroup(item.title)}>
                        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                          <SidebarMenu className="pl-9 mt-1 space-y-1 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-white/10">
                            {item.children.map((subItem) => {
                              const isSubActive = pathname === subItem.url;
                              return (
                                <SidebarMenuItem key={subItem.title}>
                                  <SidebarMenuButton asChild isActive={isSubActive} className="h-9">
                                    <Link href={subItem.url}>
                                      <span className="text-sm font-medium">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-2">
        <div className="relative rounded-xl p-px overflow-hidden bg-linear-to-b from-white/15 to-transparent shadow-xl group transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-b from-[#008080]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="bg-[#d4f870]  rounded-[15px] p-2 relative z-10 flex flex-col gap-1">
            <SidebarMenu className="gap-1">
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Help Center" 
                  className="h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                  size="sm"
                >
                  <Link href="/help">
                    <HelpCircle className="h-[18px] w-[18px]" />
                    <span className="font-medium text-[14px]">Help Center</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Live Support" 
                  className="h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Link href="/support">
                    <Headset className="h-[18px] w-[18px]" />
                    <span className="font-medium text-[14px]">Live Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <div className="h-px w-[90%] mx-auto bg-linear-to-r from-transparent via-white/15 to-transparent my-1" />

              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Logout" 
                  onClick={() => logoutMutation.mutate()} 
                  disabled={logoutLoading}
                  className="h-10 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span className="font-medium text-[14px]">
                    {logoutLoading ? "Logging out..." : "Log out"}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}