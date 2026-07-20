"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader, Plus, UploadCloud, X, Image as ImageIcon } from "lucide-react"
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

  const handleRemoveImage = () => {
    setImageFile(null)
    setNewItem({ ...newItem, image: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("name", newItem.name)
    formData.append("description", newItem.description)
    formData.append("cost", newItem.cost.toString())
    formData.append("rate", newItem.rate.toString())
    formData.append("category", category.category)

    if (useFileUpload && imageFile) {
      formData.append("file", imageFile)
    } else if (!useFileUpload && newItem.image) {
      formData.append("file", newItem.image)
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
      <SheetTrigger>
        <Button 
          className="h-14 w-14 rounded-full bg-[#008080] hover:bg-[#006666] text-white shadow-xl shadow-[#008080]/30 transition-all hover:scale-105 p-0 flex items-center justify-center group"
          aria-label="Create New Item"
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto font-sans border-l border-gray-100 bg-white">
        <SheetHeader className="pb-6 border-b border-gray-100">
          <SheetTitle className="text-2xl font-bold text-gray-900 tracking-tight">Add Menu Item</SheetTitle>
          <SheetDescription className="text-gray-500 text-sm mt-1">
            Create a new dish and instantly add it to your digital menu.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-5 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Dish Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1.5 h-11 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors"
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
                  min="0"
                  step="0.01"
                  value={newItem.cost || ""}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      cost: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1.5 h-11 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors"
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
                className="mt-1.5 flex min-h-[100px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors resize-none"
                placeholder="List ingredients, preparation style, or dietary notes..."
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
                className="mt-1.5 flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-colors cursor-pointer"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              <div>
                <Label htmlFor="imageToggle" className="text-sm font-semibold text-gray-900 block">
                  Image Source
                </Label>
                <span className="text-xs text-gray-500">Upload a file or provide a URL</span>
              </div>
              <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                <span className={`text-xs ${!useFileUpload ? 'font-bold text-[#008080]' : 'text-gray-400'}`}>URL</span>
                <Switch 
                  id="imageToggle" 
                  checked={useFileUpload} 
                  onCheckedChange={setUseFileUpload}
                  className="data-[state=checked]:bg-[#008080]" 
                />
                <span className={`text-xs ${useFileUpload ? 'font-bold text-[#008080]' : 'text-gray-400'}`}>File</span>
              </div>
            </div>

            {useFileUpload ? (
              <div className="relative">
                {imageFile ? (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-10 w-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-5 w-5 text-[#008080]" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{imageFile.name}</p>
                        <p className="text-xs text-gray-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleRemoveImage}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-[#008080]/50 transition-all relative group cursor-pointer bg-white">
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      required={useFileUpload}
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
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-[#008080]/5 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-6 w-6 text-[#008080]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  required={!useFileUpload}
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="mt-1.5 h-11 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </div>

          {newItem.image && (
            <div className="mt-6 animate-in fade-in zoom-in-95 duration-300">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Image Preview</Label>
              <div className="relative border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50 h-48 group">
                <Image
                  src={newItem.image || "/placeholder.svg"}
                  alt="Menu Item Preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
              </div>
            </div>
          )}

          <div className="pt-8 pb-4">
            <Button 
              type="submit" 
              disabled={isPending || (useFileUpload && !imageFile) || (!useFileUpload && !newItem.image)} 
              className="w-full h-12 bg-[#008080] hover:bg-[#006666] text-white font-semibold text-base transition-all shadow-md shadow-[#008080]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2 h-5 w-5" />
                  Saving to Menu...
                </span>
              ) : (
                "Add to Menu"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}