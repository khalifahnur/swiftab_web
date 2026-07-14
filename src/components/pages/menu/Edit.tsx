"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Pencil } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#008080] hover:bg-[#008080]/10 transition-colors h-9 w-9">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {item.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] font-sans border-l border-gray-100">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <SheetTitle className="text-xl font-bold text-gray-900">Edit Menu Item</SheetTitle>
          <SheetDescription>Update the details for {item.menu}. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-6 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-menu" className="text-sm font-semibold text-gray-700">Dish Name</Label>
            <Input
              id="edit-menu"
              value={editedItem.menu}
              onChange={(e) => setEditedItem({ ...editedItem, menu: e.target.value })}
              className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">Description</Label>
            <textarea
              id="edit-description"
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-price" className="text-sm font-semibold text-gray-700">Price (KES)</Label>
            <Input
              id="edit-price"
              type="number"
              value={editedItem.price}
              onChange={(e) => {
                const value = e.target.value
                if (!isNaN(Number(value)) || value === "") {
                  setEditedItem({
                    ...editedItem,
                    price: Number(value),
                  })
                }
              }}
              className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100 mt-2">
            <Button type="submit" className="w-full h-11 bg-[#008080] hover:bg-[#006666] text-white font-semibold transition-colors">
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}