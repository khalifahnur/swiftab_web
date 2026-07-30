"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader } from "lucide-react"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string | undefined
  isDeleting?: boolean
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-120 displayfont p-0 border-slate-200 shadow-2xl overflow-hidden rounded-[1.25rem]">
        <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center bg-white">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4 relative border-[4px] border-white shadow-sm shrink-0">
            <div className="absolute inset-0 rounded-full border border-red-200 animate-ping opacity-20"></div>
            <AlertTriangle className="h-5 w-5 text-red-600 relative z-10" />
          </div>
          
          <DialogTitle className="text-[18px] font-semibold text-slate-900 mb-1.5 tracking-tight">
            Delete Menu Item
          </DialogTitle>
          
          <DialogDescription className="text-slate-500 text-[13px] leading-relaxed max-w-[95%] mx-auto">
            Are you sure you want to delete <span className="font-medium text-slate-900">"{itemName}"</span>? 
            This action cannot be undone.
          </DialogDescription>
        </div>

        <DialogFooter className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
            className="w-full sm:w-1/2 h-10 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors bg-white font-medium text-[13px]"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="w-full sm:w-1/2 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all font-medium text-[13px] shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />
                Deleting...
              </span>
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}