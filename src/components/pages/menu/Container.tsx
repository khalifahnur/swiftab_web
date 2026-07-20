"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Trash2,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteConfirmationDialog from "./Delete";
import EditItemDialog from "./Edit";
import CreateItemSheet from "./Create";
import Image from "next/image";
import { fetchMenu } from "@/hooks/restauranthook/fetchmenuhook";
import { useDeleteMenu } from "@/hooks/restauranthook/deletehook";
import { useEditMenuItem } from "@/hooks/restauranthook/editmenuhook";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  code: string;
  menu: string;
  image: string;
  description: string;
  price: number;
  category: "breakfast" | "lunch" | "dinner";
}

export default function MenuManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("breakfast");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    const restaurantData = localStorage.getItem("RestaurantData");
    if (restaurantData) {
      const parsedData = JSON.parse(restaurantData);
      const name = parsedData.restaurant?.data[0]?.restaurantName;
      if (name) {
        setRestaurantName(name);
      }
    }
  }, []);

  const {
    data: menu,
    error,
    isPending,
  } = useQuery({
    queryKey: ["menu"],
    queryFn: () => fetchMenu(),
  });

  const validCategories = ["breakfast", "lunch", "dinner"] as const;

  const menuItems: MenuItem[] = React.useMemo(() => {
    if (!menu) return [];
    return Object.entries(menu)
      .filter(([category]) => validCategories.includes(category as any))
      .flatMap(([category, items]) => {
        if (!Array.isArray(items)) return [];
        return items.map((item: any) => ({
          id: item._id,
          code: item._id,
          menu: item.name,
          image: item.image,
          description: item.description,
          price: item.cost,
          category: category as "breakfast" | "lunch" | "dinner",
        }));
      });
  }, [menu]);

  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(
      (item) =>
        item.category === activeTab &&
        (item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [menuItems, activeTab, searchQuery]);

  const getCount = (category: string) =>
    menuItems.filter((item) => item.category === category).length;

  const editMutation = useEditMenuItem();
  const handleEditItem = (updatedItem: MenuItem, menuType: string) => {
    editMutation.mutate({ updatedItem, menuType });
  };

  const deleteMutation = useDeleteMenu();
  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteMutation.mutate({
        menuType: itemToDelete.category,
        itemId: itemToDelete.id,
      });
    }
  };

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }, [deleteMutation.isSuccess, deleteMutation.isError, deleteMutation.error]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (error) {
    return (
      <div className="w-full flex-1 p-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Failed to load menu
          </h3>
          <p className="text-red-600 text-sm">
            Please check your connection and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 md:p-8 bg-gray-50/50 min-h-screen relative font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <div className="relative w-full sm:w-80 shadow-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dishes, descriptions, codes..."
              className="pl-9 h-11 bg-white border-gray-200 focus:ring-[#008080]/20 focus:border-[#008080] transition-all w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Controls */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <TabsList className="h-12 bg-gray-100/80 p-1 grid grid-cols-3 max-w-md border border-gray-200/50">
                <TabsTrigger
                  value="breakfast"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <Coffee className="w-4 h-4 hidden sm:block" />
                  Breakfast
                  <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-600 border-none shadow-none">
                    {getCount("breakfast")}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="lunch"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <Sun className="w-4 h-4 hidden sm:block" />
                  Lunch
                  <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-600 border-none shadow-none">
                    {getCount("lunch")}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="dinner"
                  className="rounded-md text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#008080] data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <Moon className="w-4 h-4 hidden sm:block" />
                  Dinner
                  <Badge variant="secondary" className="ml-1 bg-gray-100 text-gray-600 border-none shadow-none">
                    {getCount("dinner")}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Contents */}
            {["breakfast", "lunch", "dinner"].map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="m-0 focus-visible:outline-none"
              >
                {isPending || deleteMutation.isPending ? (
                  <div className="p-6">
                    <MenuLoadingSkeleton />
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-[#008080]/5 flex items-center justify-center mb-4">
                      <UtensilsCrossed className="h-8 w-8 text-[#008080]/40" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No items found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">
                      {searchQuery
                        ? "No items match your search. Try different keywords."
                        : `Your ${category} menu is currently empty. Click the plus button to add dishes.`}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[100px] font-medium text-gray-500 h-12 pl-6">Code</TableHead>
                          <TableHead className="font-medium text-gray-500 h-12">Item Details</TableHead>
                          <TableHead className="hidden lg:table-cell font-medium text-gray-500 h-12 w-1/3">Description</TableHead>
                          <TableHead className="font-medium text-gray-500 h-12">Price</TableHead>
                          <TableHead className="text-right font-medium text-gray-500 h-12 pr-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMenuItems.map((item) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-gray-50/80 transition-colors group"
                          >
                            <TableCell className="pl-6 py-4">
                              <Badge
                                variant="outline"
                                className="text-xs font-mono text-gray-500 bg-gray-50 border-gray-200 uppercase"
                              >
                                {item.code.slice(-6)}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.menu}
                                    width={56}
                                    height={56}
                                    className="object-cover h-full w-full hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-900 group-hover:text-[#008080] transition-colors">
                                    {item.menu}
                                  </span>
                                  <span className="text-xs text-gray-500 lg:hidden line-clamp-1 mt-0.5">
                                    {item.description}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-gray-500 pr-8 py-4">
                              <span className="line-clamp-2 leading-relaxed">
                                {item.description}
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-bold text-gray-900">
                                {formatPrice(item.price)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <EditItemDialog
                                  item={item}
                                  onEditItem={(updatedItem) =>
                                    handleEditItem(updatedItem, item.category)
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors h-9 w-9"
                                  onClick={() => {
                                    setItemToDelete(item);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50">
        <CreateItemSheet />
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteItem}
        itemName={itemToDelete?.menu}
      />
    </div>
  );
}

function MenuLoadingSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 px-6"
        >
          <Skeleton className="h-6 w-16 bg-gray-100 rounded-md" />
          <div className="flex items-center gap-4 flex-1 px-6">
            <Skeleton className="h-14 w-14 rounded-lg bg-gray-100 shrink-0" />
            <Skeleton className="h-5 w-40 bg-gray-100" />
          </div>
          <div className="hidden lg:block flex-1 pr-8">
            <Skeleton className="h-4 w-full bg-gray-100 mb-2" />
            <Skeleton className="h-4 w-2/3 bg-gray-100" />
          </div>
          <Skeleton className="h-6 w-20 bg-gray-100 mx-4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md bg-gray-100" />
            <Skeleton className="h-9 w-9 rounded-md bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}