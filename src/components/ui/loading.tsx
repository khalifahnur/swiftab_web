"use client";
import React from "react";
import { UtensilsCrossed } from "lucide-react";

export const LoadingSpinner = ({ desc = "Loading..." }: { desc?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
      
      <div className="relative flex items-center justify-center">
        <div className="absolute h-20 w-20 border-4 border-gray-100 border-t-[#008080] rounded-full animate-spin"></div>
        <div className="h-16 w-16 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-lg">
          <UtensilsCrossed className="h-7 w-7 text-[#008080]" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
          {desc}
        </p>
        <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
          Please wait
        </span>
      </div>
    </div>
  );
};