"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader, Plus, UploadCloud } from "lucide-react"
import { useAddMenu } from "@/hooks/restauranthook/addmenuhook"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"

interface MenuItem {
  name: string
  description: string
  cost: number
  rate: number
  image: string
}

type categoryprop = {
  category: "breakfast" | "lunch" | "dinner"
}

export default function CreateItemSheet() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [useFileUpload, setUseFileUpload] = React.useState(true)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const [newItem, setNewItem] = React.useState<MenuItem>({
    name: "",
    description: "",
    cost: 0,
    rate: 0,
    image: "",
  })

  const [category, setCategory] = React.useState<categoryprop>({
    category: "breakfast",
  })

  const { mutate: addMenuItem, isPending } = useAddMenu()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("name", newItem.name)
    formData.append("description", newItem.description)
    formData.append("cost", newItem.cost.toString())
    formData.append("rate", newItem.rate.toString())
    formData.append("category", category.category)

    if (imageFile) {
      formData.append("image", imageFile)
    } else if (newItem.image) {
      formData.append("image", newItem.image)
    }

    addMenuItem(
      { data: formData, menuType: category.category },
      {
        onSuccess: () => {
          setIsOpen(false)
          setNewItem({ name: "", description: "", cost: 0, rate: 0, image: "" })
          setImageFile(null)
        },
      },
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          className="h-14 w-14 rounded-full bg-[#008080] hover:bg-[#006666] text-white shadow-lg shadow-[#008080]/30 transition-transform hover:scale-105 p-0 flex items-center justify-center group"
          aria-label="Create New Item"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto font-sans border-l border-gray-100">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <SheetTitle className="text-xl font-bold text-gray-900">Add Menu Item</SheetTitle>
          <SheetDescription>Create a new dish and add it to your restaurant's digital menu.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Dish Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1.5 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                  placeholder="e.g. Classic Beef Burger"
                  required
                />
              </div>
              <div className="w-full sm:w-1/3">
                <Label htmlFor="cost" className="text-sm font-semibold text-gray-700">
                  Price (KES)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  value={newItem.cost || ""}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      cost: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1.5 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="mt-1.5 flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                placeholder="Ingredients, preparation style, or dietary notes..."
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Menu Category
              </Label>
              <select
                id="category"
                value={category.category}
                onChange={(e) =>
                  setCategory({
                    category: e.target.value as "breakfast" | "lunch" | "dinner",
                  })
                }
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Label htmlFor="imageToggle" className="text-sm font-semibold text-gray-700">
                Image Source
              </Label>
              <div className="flex items-center space-x-3">
                <span className={`text-xs ${!useFileUpload ? 'font-bold text-[#008080]' : 'text-gray-500'}`}>URL</span>
                <Switch 
                  id="imageToggle" 
                  checked={useFileUpload} 
                  onCheckedChange={setUseFileUpload}
                  className="data-[state=checked]:bg-[#008080]" 
                />
                <span className={`text-xs ${useFileUpload ? 'font-bold text-[#008080]' : 'text-gray-500'}`}>File</span>
              </div>
            </div>

            {useFileUpload ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImageFile(file)
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (reader.result) {
                          setNewItem({
                            ...newItem,
                            image: reader.result as string,
                          })
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
              </div>
            ) : (
              <div>
                <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="text"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="mt-1.5 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </div>

          {newItem.image && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Label className="text-sm font-semibold text-gray-700">Preview</Label>
              <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                <Image
                  src={newItem.image || "/placeholder.svg"}
                  alt="Selected Menu Item"
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          <div className="pt-6 pb-2">
            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 bg-[#008080] hover:bg-[#006666] text-white font-semibold text-base transition-colors"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Saving to Menu...
                </span>
              ) : (
                "Save Menu Item"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}