import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import React from "react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | undefined;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] font-sans">
        <DialogHeader className="flex flex-col items-center text-center sm:text-center pb-2">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
          <DialogDescription className="text-gray-500 pt-2 text-base">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{itemName}</span>? 
            This action removes it from the menu and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-center mt-6 w-full">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-11 px-8 border-gray-200">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full sm:w-auto h-11 px-8 bg-red-600 hover:bg-red-700">
            Yes, Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}