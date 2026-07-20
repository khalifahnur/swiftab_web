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
          className="text-gray-400 hover:text-[#008080] hover:bg-[#008080]/10 transition-colors h-9 w-9 rounded-full"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {item.menu}</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto font-sans border-l border-gray-100 bg-white">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <SheetTitle className="text-2xl font-bold text-gray-900 tracking-tight">Edit Menu Item</SheetTitle>
          <SheetDescription className="text-gray-500 text-sm mt-1">
            Update the details for <span className="font-semibold text-gray-700">{item.menu}</span>.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Quick Preview Image */}
          {item.image && (
             <div className="relative border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50 h-32 w-full mb-2 group">
               <Image
                 src={item.image || "/placeholder.svg"}
                 alt={item.menu}
                 fill
                 className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
               <div className="absolute bottom-3 left-4 text-white font-medium drop-shadow-md">
                 Currently Editing
               </div>
             </div>
          )}

          <div className="space-y-5 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="edit-menu" className="text-sm font-semibold text-gray-700">
                  Dish Name
                </Label>
                <Input
                  id="edit-menu"
                  value={editedItem.menu}
                  onChange={(e) => setEditedItem({ ...editedItem, menu: e.target.value })}
                  className="mt-1.5 h-11 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors"
                  required
                />
              </div>
              <div className="w-full sm:w-1/3">
                <Label htmlFor="edit-price" className="text-sm font-semibold text-gray-700">
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
                  className="mt-1.5 h-11 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <textarea
                id="edit-description"
                value={editedItem.description}
                onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                className="mt-1.5 flex min-h-[120px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors resize-none"
                required
              />
            </div>
          </div>
          
          <div className="pt-6 pb-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#008080] hover:bg-[#006666] text-white font-semibold text-base transition-all shadow-md shadow-[#008080]/20"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}