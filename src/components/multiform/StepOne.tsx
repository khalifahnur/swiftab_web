import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormikHelpers } from "formik";

interface StepOneProps {
  formik: {
    values: { restaurantName: string; description: string; email: string; phone: string; };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    errors: { restaurantName?: string; email?: string; phone?: string; description?: string; };
    touched: { restaurantName?: boolean; email?: boolean; phone?: boolean; description?: boolean; };
    setFieldValue: FormikHelpers<any>["setFieldValue"];
  };
}

export function StepOne({ formik }: StepOneProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Basic Details</h3>
        <p className="text-sm text-gray-500 mb-6">Let's start with the name and contact info for your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="restaurantName" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Restaurant Name</Label>
          <Input
            name="stepOne.restaurantName"
            value={formik.values.restaurantName}
            onChange={formik.handleChange}
            placeholder="e.g. Swiftab Cafe"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.restaurantName && formik.errors.restaurantName && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.restaurantName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business Email</Label>
          <Input
            name="stepOne.email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            placeholder="hello@restaurant.com"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</Label>
          <Input
            name="stepOne.phone"
            type="tel"
            value={formik.values.phone}
            onChange={formik.handleChange}
            placeholder="+254 712 345678"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.phone}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Restaurant Description</Label>
          <Textarea
            name="stepOne.description"
            value={formik.values.description}
            onChange={formik.handleChange}
            placeholder="Tell your customers a little bit about your cuisine and atmosphere..."
            className="min-h-[120px] bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}