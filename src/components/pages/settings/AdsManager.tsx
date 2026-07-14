"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";

export type PromotionType = "DISCOUNT" | "PAYMENT_OFFER" | "SPECIAL" | "SEASONAL";

export type PromotionFormValues = {
  title: string;
  description: string;
  type: PromotionType;
  discountPercentage?: number;
  paymentMethod?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  termsAndConditions: string;
};

const PromotionSchema = Yup.object().shape({
  title: Yup.string().required("Title is required").max(100, "Max 100 characters"),
  description: Yup.string().required("Description is required").max(500, "Max 500 characters"),
  type: Yup.mixed<PromotionType>().oneOf(["DISCOUNT", "PAYMENT_OFFER", "SPECIAL", "SEASONAL"] as const).required("Type is required"),
  discountPercentage: Yup.number().when("type", {
    is: "DISCOUNT",
    then: (schema) => schema.required("Discount % is required").min(1).max(100),
    otherwise: (schema) => schema.notRequired(),
  }),
  paymentMethod: Yup.string().when("type", {
    is: "PAYMENT_OFFER",
    then: (schema) => schema.required("Payment method required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required").test("is-after-start", "Must be after start date", function (value) {
    const { startDate } = this.parent;
    return startDate && value ? new Date(value) >= new Date(startDate) : true;
  }),
  isActive: Yup.boolean().default(true),
  termsAndConditions: Yup.string().required("Terms are required"),
});

export default function AdsManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [promotions, setPromotions] = useState<PromotionFormValues[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: PromotionFormValues, { resetForm }: FormikHelpers<PromotionFormValues>) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString());
      });

      const response = await fetch("/api/restaurant/promotions", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to create promotion");

      const data = await response.json();
      toast({ title: "Promotion Created", description: "Promotion added successfully." });
      resetForm();
      setImagePreview(null);
      setImageFile(null);
      setPromotions([...promotions, data.promotion]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Unexpected error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        type: "DISCOUNT" as PromotionType,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
        termsAndConditions: "",
      }}
      validationSchema={PromotionSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Promotion Title</Label>
              <Field name="title" as={Input} type="text" placeholder="E.g., Weekend Special 20% Off" className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
              <ErrorMessage name="title" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
              <Field name="description" as={Textarea} placeholder="Enter promotion details..." className="min-h-[100px] focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
              <ErrorMessage name="description" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Promotion Type</Label>
              <Select onValueChange={(value) => setFieldValue("type", value)} value={values.type}>
                <SelectTrigger className="focus:ring-[#008080]/20 focus:border-[#008080]">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISCOUNT">Discount</SelectItem>
                  <SelectItem value="PAYMENT_OFFER">Payment Offer</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                  <SelectItem value="SEASONAL">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              <ErrorMessage name="type" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>

            {values.type === "DISCOUNT" && (
              <div className="space-y-1.5">
                <Label htmlFor="discountPercentage" className="text-sm font-semibold text-gray-700">Discount %</Label>
                <Field name="discountPercentage" as={Input} type="number" placeholder="20" className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
                <ErrorMessage name="discountPercentage" component="div" className="text-red-500 text-xs font-bold mt-1" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Start Date</Label>
              <Field name="startDate" as={Input} type="date" className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
              <ErrorMessage name="startDate" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">End Date</Label>
              <Field name="endDate" as={Input} type="date" className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
              <ErrorMessage name="endDate" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="termsAndConditions" className="text-sm font-semibold text-gray-700">Terms & Conditions</Label>
              <Field name="termsAndConditions" as={Textarea} placeholder="Valid on dine-in only..." className="focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]" />
              <ErrorMessage name="termsAndConditions" component="div" className="text-red-500 text-xs font-bold mt-1" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Label className="text-sm font-semibold text-gray-700">Promotion Image</Label>
            
            {!imagePreview ? (
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="upload" />
                <UploadCloud className="mx-auto h-10 w-10 text-gray-300 group-hover:text-[#008080] transition-colors mb-3" />
                <p className="text-sm font-bold text-gray-700">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative inline-block border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full max-w-sm h-48 object-cover" />
                <button type="button" onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting || loading} className="w-full md:w-auto min-w-[200px] h-11 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl shadow-md shadow-[#008080]/20 transition-all">
              {loading ? "Creating Promotion..." : "Launch Promotion"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}