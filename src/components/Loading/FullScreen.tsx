"use client";

import { LoadingSpinner } from "../ui/loading";


export const FullScreenLoader = ({ desc }: { desc?: string }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-[100] transition-all duration-300">
      <LoadingSpinner desc={desc} /> 
    </div>
  );
};