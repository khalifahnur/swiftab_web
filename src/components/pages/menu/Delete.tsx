"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  isDeleting?: boolean // Added for TanStack Query loading state
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
        // Prevent closing the modal by clicking outside if a deletion is in progress
        if (!isDeleting && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] font-sans p-0 border-gray-100 shadow-2xl overflow-hidden rounded-2xl">
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-5 relative border-[6px] border-white shadow-sm">
            {/* Subtle pulse animation behind the icon to draw attention */}
            <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping opacity-20"></div>
            <AlertTriangle className="h-7 w-7 text-red-600 relative z-10" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            Delete Menu Item
          </DialogTitle>
          
          <DialogDescription className="text-gray-500 text-[15px] leading-relaxed max-w-[90%] mx-auto">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>? 
            This action cannot be undone and will permanently remove it from your menu.
          </DialogDescription>
        </div>

        <DialogFooter className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
            className="w-full sm:w-1/2 h-11 border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors bg-white font-medium"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="w-full sm:w-1/2 h-11 bg-red-600 hover:bg-red-700 text-white transition-all font-medium shadow-md shadow-red-600/20"
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