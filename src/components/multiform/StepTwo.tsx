import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating"; 

interface StepTwoProps {
  formik: {
    values: { averagePrice: number; hoursOfOperation: string; rate: number; cuisines: string; };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (field: string, value: any) => void;
    errors: { averagePrice?: string; hoursOfOperation?: string; rate?: string; cuisines?: string; };
    touched: { averagePrice?: boolean; hoursOfOperation?: boolean; rate?: boolean; cuisines?: boolean; };
  };
}

export function StepTwo({ formik }: StepTwoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Operations & Dining</h3>
        <p className="text-sm text-gray-500 mb-6">Provide details to help customers know what to expect.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="averagePrice" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Average Meal Price (KES)</Label>
          <Input
            name="stepTwo.averagePrice"
            type="number"
            value={formik.values.averagePrice || ""}
            onChange={formik.handleChange}
            placeholder="e.g. 1500"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.averagePrice && formik.errors.averagePrice && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.averagePrice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisines" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cuisines</Label>
          <Input
            name="stepTwo.cuisines"
            value={formik.values.cuisines}
            onChange={formik.handleChange}
            placeholder="e.g. Italian, Swahili, Cafe"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.cuisines && formik.errors.cuisines && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.cuisines}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="hoursOfOperation" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Hours of Operation</Label>
          <Input
            name="stepTwo.hoursOfOperation"
            value={formik.values.hoursOfOperation}
            onChange={formik.handleChange}
            placeholder="e.g. Mon-Sun, 8:00 AM - 10:00 PM"
            className="h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080]"
          />
          {formik.touched.hoursOfOperation && formik.errors.hoursOfOperation && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.hoursOfOperation}</p>
          )}
        </div>

        <div className="space-y-3 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Initial Star Rating</Label>
          <StarRating
            rating={formik.values.rate}
            onRatingChange={(rating: number) => formik.setFieldValue("stepTwo.rate", rating)}
          />
          {formik.touched.rate && formik.errors.rate && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.rate}</p>
          )}
        </div>
      </div>
    </div>
  );
}