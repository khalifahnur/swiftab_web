"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Cog, Star, Package, DollarSign, Save, Ticket } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { FullScreenLoader } from "@/components/Loading/FullScreen";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Waiter from "./Waiter";
import AdsManager from "./AdsManager";
import Subscription from "./Subscription";
import { fetchAdminInfo } from "@/lib/api";

interface FormDataType {
  restaurant: {
    image: string;
    name: string;
    cuisine: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    hours: { day: string; open: boolean; from: string; to: string }[];
  };
  profile: {
    firstName: string;
    email: string;
  };
}

const Container = () => {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [isFormChanged, setIsFormChanged] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: ["adminInfo"],
    queryFn: fetchAdminInfo,
  });

  useEffect(() => {
    setIsFormChanged(false);
  }, [activeTab]);

  const [formData, setFormData] = useState<FormDataType>({
    restaurant: {
      image: "",
      name: "",
      cuisine: "Italian",
      city: "",
      state: "",
      zip: "03463",
      phone: "",
      email: "",
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
    profile: {
      firstName: "",
      email: "",
    },
  });

  useEffect(() => {
    if (data) {
      const {
        name,
        email,
        phoneNumber,
        restaurantName,
        location,
        image,
        restaurantEmail,
      } = data;

      setFormData({
        restaurant: {
          image: image,
          name: restaurantName,
          cuisine: "",
          city: location,
          state: location,
          zip: "03463",
          phone: phoneNumber,
          email: restaurantEmail,
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
        profile: {
          firstName: name,
          email: email,
        },
      });
    }
  }, [data]);

  if (isLoading) return <FullScreenLoader />;
  if (error) return <div>Error fetching admin info: {error.message}</div>;
  if (!data) return <div>No data available</div>;

  const handleInputChange = <K extends keyof FormDataType>(
    section: K,
    field: keyof FormDataType[K],
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setIsFormChanged(true);
  };

  const handleHoursChange = (
    index: number,
    field: "open" | "from" | "to",
    value: string | boolean,
  ) => {
    setFormData((prev) => {
      const updatedHours = [...prev.restaurant.hours];
      updatedHours[index] = { ...updatedHours[index], [field]: value };
      return { ...prev, restaurant: { ...prev.restaurant, hours: updatedHours } };
    });
    setIsFormChanged(true);
  };

  const handleSaveChanges = () => {
    console.log("Saving changes:", formData);
    Toast({ title: "Changes saved", duration: 3000 });
    setIsFormChanged(false);
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Modernized Pill Tabs */}
        <div className="w-full overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-full bg-white p-1 border border-gray-100 shadow-sm w-max min-w-full lg:min-w-0">
            {["restaurant", "profile", "subscription", "waiters", "promotion"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-full px-6 py-2.5 text-sm font-medium capitalize transition-all data-[state=active]:bg-[#008080] data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 hover:text-gray-900"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Restaurant Settings Tab */}
        <TabsContent value="restaurant" className="space-y-6 focus-visible:outline-none m-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* General Info */}
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">General Info</h2>
                <div className="flex items-center gap-5 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                    <Image src={formData.restaurant.image || "/placeholder.svg"} alt="restaurant image" width={100} height={100} className="object-cover" />
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700">
                      Upload new picture
                    </Button>
                    <span className="text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="restaurantName" className="text-sm font-semibold text-gray-700">Restaurant Name</Label>
                    <Input
                      id="restaurantName"
                      value={formData.restaurant.name}
                      onChange={(e) => handleInputChange("restaurant", "name", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cuisine" className="text-sm font-semibold text-gray-700">Cuisine</Label>
                    <Input
                      id="cuisine"
                      value={formData.restaurant.cuisine}
                      onChange={(e) => handleInputChange("restaurant", "cuisine", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                    <Input
                      id="city"
                      value={formData.restaurant.city}
                      onChange={(e) => handleInputChange("restaurant", "city", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.restaurant.state}
                      onChange={(e) => handleInputChange("restaurant", "state", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="zip" className="text-sm font-semibold text-gray-700">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.restaurant.zip}
                      onChange={(e) => handleInputChange("restaurant", "zip", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-5 pt-6 border-t border-gray-100">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.restaurant.phone}
                      onChange={(e) => handleInputChange("restaurant", "phone", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      value={formData.restaurant.email}
                      onChange={(e) => handleInputChange("restaurant", "email", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Opening Hours</h2>
                <div className="space-y-1">
                  {formData.restaurant.hours.map((schedule, index) => (
                    <div key={schedule.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100 gap-3">
                      <div className="w-32 flex items-center">
                        <p className="font-semibold text-gray-700">{schedule.day}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={schedule.open}
                          onCheckedChange={(checked) => handleHoursChange(index, "open", checked)}
                          className="data-[state=checked]:bg-[#008080]"
                        />
                        <span className={`text-sm min-w-[60px] font-medium ${schedule.open ? 'text-[#008080]' : 'text-gray-400'}`}>
                          {schedule.open ? "Open" : "Closed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 sm:justify-end">
                        {schedule.open ? (
                          <>
                            <Input
                              className="w-24 text-center focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                              value={schedule.from}
                              onChange={(e) => handleHoursChange(index, "from", e.target.value)}
                              placeholder="09:00"
                            />
                            <span className="text-gray-400">-</span>
                            <Input
                              className="w-24 text-center focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                              value={schedule.to}
                              onChange={(e) => handleHoursChange(index, "to", e.target.value)}
                              placeholder="22:00"
                            />
                          </>
                        ) : (
                          <div className="w-[208px] text-center text-sm text-gray-400 italic">Day off</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 focus-visible:outline-none m-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="mb-8">
                  <div className="flex gap-6 border-b border-gray-100">
                    <button className="pb-3 text-sm font-bold text-[#008080] border-b-2 border-[#008080]">Account</button>
                    <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Security</button>
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                    <Image src="/swiftab/USER.jpg" alt="User Avatar" width={100} height={100} className="object-cover" />
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700">Upload Photo</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                    </div>
                    <span className="text-xs text-gray-500">Pick a photo up to 4 MB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.profile.firstName}
                      onChange={(e) => handleInputChange("profile", "firstName", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="userEmail" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <Input
                      id="userEmail"
                      value={formData.profile.email}
                      onChange={(e) => handleInputChange("profile", "email", e.target.value)}
                      className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Password</h3>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Change your password</p>
                      <p className="text-xs text-gray-500">Keep your account secure</p>
                    </div>
                    <Button variant="outline" className="bg-white hover:text-[#008080] hover:border-[#008080]/50 transition-colors">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#008080]">
                    <Cog className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", title: "Sales Target Met", desc: "Your restaurant 'Sushi Paradise' has achieved total sales of Ksh.5,432.87 today." },
                    { icon: Package, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", title: "Low Stock Alert", desc: "The stock level of Chicken Breast is below the threshold. Reorder soon." },
                    { icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", title: "New Review", desc: "A customer left a 5-star review. Click here to read their comments." }
                  ].map((notification, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${notification.border} bg-white shadow-sm hover:shadow transition-shadow`}>
                      <div className={`rounded-full ${notification.bg} p-2.5 shrink-0`}>
                        <notification.icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{notification.desc}</p>
                        <p className="text-xs font-medium text-gray-400 mt-2">2 min ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="focus-visible:outline-none m-0">
          <Subscription />
        </TabsContent>

        <TabsContent value="waiters" className="focus-visible:outline-none m-0">
          <Waiter />
        </TabsContent>

        <TabsContent value="promotion" className="focus-visible:outline-none m-0">
          <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center mb-8 gap-4 pb-6 border-b border-gray-100">
                <div className="bg-[#008080]/10 p-3 rounded-xl">
                  <Ticket className="h-6 w-6 text-[#008080]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Restaurant Promotions</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Create special offers and promotions to attract customers</p>
                </div>
              </div>
              <AdsManager />
            </CardContent>
          </Card>
        </TabsContent>

        {isFormChanged && (
          <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              className="h-12 px-6 rounded-full bg-[#008080] hover:bg-[#006666] text-white shadow-lg shadow-[#008080]/30 transition-transform hover:scale-105 font-bold text-base flex items-center gap-2"
              onClick={handleSaveChanges}
            >
              <Save className="h-5 w-5" />
              Save Changes
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Container;