"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { FullScreenLoader } from "../components/Loading/FullScreen";

const publicRoutes = ["/", "/signin", "/signup","/privacy-policy","/terms-of-service","/forgot-password"];

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.replace("/signin");
    } 
    
    else if (user && isPublicRoute) {
      router.replace("/home");
    }
  }, [mounted, isLoading, user, pathname, router]);

  if (!mounted || isLoading) {
    return <FullScreenLoader />
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  if (!user && !isPublicRoute) return null;
  if (user && isPublicRoute) return null;

  return <>{children}</>;
}

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}






