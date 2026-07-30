import * as React from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function DashboardBanner() {
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return (
      <div className="w-full bg-teal-900 rounded-2xl p-6 md:p-10 mb-6 shadow-sm overflow-hidden relative">
        <Skeleton className="h-8 w-64 mb-2 bg-teal-800" />
        <Skeleton className="h-4 w-48 bg-teal-800" />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="bodyfont w-full bg-linear-to-r from-teal-900 to-teal-700 rounded-2xl p-6 md:p-10 mb-6 shadow-lg overflow-hidden relative">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
      <div className="absolute -bottom-24 right-12 w-48 h-48 bg-teal-400 opacity-10 rounded-full blur-2xl mix-blend-overlay"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome back, {firstName} <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-teal-100/90 font-medium">
            Here's what's happening at your restaurant today.
          </p>
        </div>
      </div>
    </div>
  );
}
