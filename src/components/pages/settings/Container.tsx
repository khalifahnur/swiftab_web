"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Cog, Star, Package, DollarSign, Save, Ticket, User, Store, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Assuming you use this hook
import { FullScreenLoader } from "@/components/Loading/FullScreen";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Waiter from "./Waiter";
import AdsManager from "./AdsManager";
import Subscription from "./Subscription";
import { fetchAdminInfo } from "@/lib/api";

const SettingsContainer = () => {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [isFormChanged, setIsFormChanged] = useState(false);
  const { toast } = useToast();

  const { data, error, isLoading } = useQuery({
    queryKey: ["adminInfo"],
    queryFn: fetchAdminInfo,
  });

  const [formData, setFormData] = useState({
    restaurant: {
      image: "", name: "", cuisine: "Italian", city: "", state: "", zip: "03463", phone: "", email: "",
      hours: [
        { day: "Monday", open: true, from: "10:00", to: "18:00" },
        { day: "Tuesday", open: false, from: "", to: "" },
        { day: "Wednesday", open: true, from: "10:00", to: "18:00" },
        { day: "Thursday", open: true, from: "10:00", to: "18:00" },
        { day: "Friday", open: true, from: "10:00", to: "18:00" },
        { day: "Saturday", open: false, from: "", to: "" },
        { day: "Sunday", open: false, from: "", to: "" },
      ],
    },
    profile: { firstName: "", email: "" },
  });

  useEffect(() => {
    if (data) {
      setFormData(prev => ({
        ...prev,
        restaurant: { ...prev.restaurant, name: data.restaurantName, image: data.image, phone: data.phoneNumber, email: data.restaurantEmail, city: data.location },
        profile: { firstName: data.name, email: data.email }
      }));
    }
  }, [data]);

  if (isLoading) return <FullScreenLoader desc="Loading your settings..." />;
  if (error) return <div className="p-8 text-center text-red-500">Error loading settings.</div>;

  const handleInputChange = (section: 'restaurant' | 'profile', field: string, value: any) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setIsFormChanged(true);
  };

  const handleHoursChange = (index: number, field: string, value: any) => {
    const newHours = [...formData.restaurant.hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData(prev => ({ ...prev, restaurant: { ...prev.restaurant, hours: newHours } }));
    setIsFormChanged(true);
  };

  const handleSaveChanges = () => {
    toast({ title: "Settings updated", description: "Your changes have been saved successfully." });
    setIsFormChanged(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 font-sans pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your restaurant details, profile, and subscriptions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <div className="overflow-x-auto pb-1 scrollbar-hide">
          <TabsList className="h-12 bg-white p-1 border border-gray-100 shadow-sm rounded-xl">
            {["restaurant", "profile", "waiters", "promotion"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold capitalize transition-all data-[state=active]:bg-[#008080] data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="restaurant" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <Store className="h-5 w-5 text-[#008080]" />
                <h2 className="font-bold text-gray-900">General Information</h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 rounded-2xl border-2 border-gray-100">
                    <Image src={formData.restaurant.image || "/placeholder.svg"} alt="Restaurant" width={96} height={96} className="object-cover" />
                  </Avatar>
                  <Button variant="outline" className="border-gray-200">Change Logo</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Restaurant Name</Label><Input value={formData.restaurant.name} onChange={(e) => handleInputChange("restaurant", "name", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Cuisine</Label><Input value={formData.restaurant.cuisine} onChange={(e) => handleInputChange("restaurant", "cuisine", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input value={formData.restaurant.city} onChange={(e) => handleInputChange("restaurant", "city", e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input value={formData.restaurant.phone} onChange={(e) => handleInputChange("restaurant", "phone", e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
              <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#008080]" />
                <h2 className="font-bold text-gray-900">Operating Hours</h2>
              </div>
              <CardContent className="p-6">
                {formData.restaurant.hours.map((h, i) => (
                  <div key={h.day} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-sm w-24">{h.day}</span>
                    <div className="flex items-center gap-4">
                      <Switch checked={h.open} onCheckedChange={(v) => handleHoursChange(i, "open", v)} className="data-[state=checked]:bg-[#008080]" />
                      <div className="flex items-center gap-2">
                        <Input className="w-20 h-9" value={h.from} onChange={(e) => handleHoursChange(i, "from", e.target.value)} disabled={!h.open} />
                        <span className="text-gray-300">-</span>
                        <Input className="w-20 h-9" value={h.to} onChange={(e) => handleHoursChange(i, "to", e.target.value)} disabled={!h.open} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="rounded-2xl border-gray-100 shadow-sm bg-white p-6">
             <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-[#008080]" />
                <h2 className="font-bold text-gray-900">User Profile</h2>
             </div>
             <div className="max-w-xl space-y-4">
                <div className="space-y-1.5"><Label>Full Name</Label><Input value={formData.profile.firstName} onChange={(e) => handleInputChange("profile", "firstName", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input value={formData.profile.email} onChange={(e) => handleInputChange("profile", "email", e.target.value)} /></div>
             </div>
          </Card>
        </TabsContent>

        {/* Other Tabs */}
        {/* <TabsContent value="subscription"><Subscription /></TabsContent> */}
        <TabsContent value="waiters"><Waiter /></TabsContent>
        <TabsContent value="promotion"><AdsManager /></TabsContent>
      </Tabs>

      {isFormChanged && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-5">
          <Button onClick={handleSaveChanges} className="h-12 px-8 rounded-full bg-[#008080] hover:bg-[#006666] shadow-xl shadow-[#008080]/20 font-bold flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default SettingsContainer;