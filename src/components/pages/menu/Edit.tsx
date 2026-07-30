"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Pencil } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface MenuItem {
  id: string
  menu: string
  description: string
  price: number
  category: "breakfast" | "lunch" | "dinner"
  image: string
  code: string
}

interface EditItemSheetProps {
  item: MenuItem
  onEditItem: (item: MenuItem) => void
}

export default function EditItemSheet({ item, onEditItem }: EditItemSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [editedItem, setEditedItem] = React.useState<MenuItem>(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditItem(editedItem)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-[#008080] hover:bg-[#008080]/10 transition-colors h-8 w-8 rounded-md"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only bodyfont">Edit {item.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full monofont sm:w-[480px] p-6 sm:p-8 overflow-y-auto font-sans border-l border-slate-200 bg-white shadow-2xl">
        <SheetHeader className="pb-4 border-b border-slate-100">
          <SheetTitle className="text-[18px] font-semibold text-slate-900 tracking-tight">Edit Menu Item</SheetTitle>
          <SheetDescription className="text-slate-500 text-[13px] mt-1">
            Update the details for <span className="font-medium text-slate-700">{item.menu}</span>.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          {item.image && (
             <div className="relative border border-slate-100 rounded-lg overflow-hidden shadow-sm bg-slate-50 h-28 w-full group">
               <Image
                 src={item.image || "/placeholder.svg"}
                 alt={item.menu}
                 fill
                 className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
               <div className="absolute bottom-2.5 left-3 text-white text-[12px] font-medium drop-shadow-md">
                 Currently Editing
               </div>
             </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full relative">
                <Label htmlFor="edit-menu" className="text-[13px] font-medium text-slate-700 mb-1.5 block">
                  Dish Name
                </Label>
                <Input
                  id="edit-menu"
                  value={editedItem.menu}
                  onChange={(e) => setEditedItem({ ...editedItem, menu: e.target.value })}
                  className="h-10 bg-white border-slate-200 rounded-lg text-[14px] text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                  required
                />
              </div>
              <div className="w-full sm:w-1/3 relative">
                <Label htmlFor="edit-price" className="text-[13px] font-medium text-slate-700 mb-1.5 block">
                  Price (KES)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editedItem.price}
                  onChange={(e) => {
                    const value = e.target.value
                    if (!isNaN(Number(value)) || value === "") {
                      setEditedItem({ ...editedItem, price: Number(value) })
                    }
                  }}
                  className="h-10 bg-white border-slate-200 rounded-lg text-[14px] text-slate-900 shadow-sm focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="edit-description" className="text-[13px] font-medium text-slate-700 mb-1.5 block">
                Description
              </Label>
              <textarea
                id="edit-description"
                value={editedItem.description}
                onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all resize-none"
                required
              />
            </div>
          </div>
          
          <div className="pt-4 pb-2">
            <Button 
              type="submit" 
              className="w-full h-10 rounded-lg bg-[#008080] hover:bg-[#006666] text-white font-medium text-[14px] transition-all shadow-sm hover:shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}