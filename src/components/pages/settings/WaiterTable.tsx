"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Trash2, Users, AlertCircle } from "lucide-react";
import { fetchWaiter } from "@/lib/api";
import { useDeleteWaiter } from "@/hooks/authhook/deleteWaiterHook";

interface Waiter {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  restaurantId: string;
  createdAt: string;
}

interface WaiterResponse {
  message: string;
  waiter: Waiter[];
}

export default function WaiterTable() {
  const { data, isLoading, isError, error } = useQuery<WaiterResponse>({
    queryKey: ["waiters"],
    queryFn: fetchWaiter,
  });

  const waiters = data?.waiter || [];
  const deleteMutation = useDeleteWaiter();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to revoke this waiter's access?")) {
      deleteMutation.mutate({ waiterId: id });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none mb-1.5">
              Active Staff
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Manage your restaurant floor team
            </p>
          </div>
        </div>
        {!isLoading && !isError && (
          <Badge className="bg-[#008080]/10 text-[#008080] hover:bg-[#008080]/20 border-0 shadow-none font-bold px-3 py-1 text-sm">
            {waiters.length} Total
          </Badge>
        )}
      </div>

      <div className="flex-1 p-0">
        {isLoading && (
          <div className="p-6 space-y-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 px-2">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-gray-100 rounded" />
                  <Skeleton className="h-4 w-24 bg-gray-100 rounded" />
                </div>
                <div className="space-y-2 hidden md:block">
                  <Skeleton className="h-5 w-40 bg-gray-100 rounded" />
                  <Skeleton className="h-4 w-24 bg-gray-100 rounded" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Failed to load staff</h3>
            <p className="text-sm text-gray-500 mt-1.5 max-w-sm leading-relaxed">
              {(error as Error).message || "There was a problem communicating with the server. Please try refreshing."}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && waiters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="h-20 w-20 rounded-full bg-[#008080]/5 flex items-center justify-center mb-5">
              <Users className="h-10 w-10 text-[#008080]/40" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No waiters registered</h3>
            <p className="text-base text-gray-500 max-w-sm mt-2 leading-relaxed">
              Add a staff member using the form to give them access to the mobile POS.
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && !isError && waiters.length > 0 && (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-b-gray-100">
                  <TableHead className="font-semibold text-gray-500 pl-6 h-12 w-[40%]">Staff Member</TableHead>
                  <TableHead className="font-semibold text-gray-500 h-12 w-[35%]">Contact Info</TableHead>
                  <TableHead className="font-semibold text-gray-500 h-12 hidden xl:table-cell">Joined</TableHead>
                  <TableHead className="text-right font-semibold text-gray-500 h-12 pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waiters.map((waiter) => (
                  <TableRow 
                    key={waiter.id} 
                    className="hover:bg-gray-50/80 transition-colors border-b-gray-50 last:border-0 group"
                  >
                    <TableCell className="pl-6 py-5">
                      <div className="font-bold text-gray-900 group-hover:text-[#008080] transition-colors text-base">
                        {waiter.firstname} {waiter.lastname}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono text-gray-500 bg-white px-2 py-0.5 border-gray-200 uppercase tracking-wider">
                          ID: ...{waiter?.id.slice(-6)}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-5">
                      <div className="text-sm text-gray-900 font-semibold">{waiter.email}</div>
                      <div className="text-sm text-gray-500 mt-1 font-medium">{waiter.phoneNumber}</div>
                    </TableCell>
                    
                    <TableCell className="py-5 text-sm text-gray-500 font-medium hidden xl:table-cell">
                      {new Date(waiter.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    
                    <TableCell className="text-right pr-6 py-5">
                      <Button
                        onClick={() => handleDelete(waiter.id)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors h-9 w-9 rounded-lg"
                        title="Remove Waiter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}