import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, CreditCard, Banknote, Smartphone } from "lucide-react";

interface StepThreeProps {
  formik: {
    values: { taxRate: number; serviceCharge: number; paymentMethods: string[]; };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (field: string, value: any) => void;
    errors: { taxRate?: string; serviceCharge?: string; paymentMethods?: string| string[]; };
    touched: { taxRate?: boolean; serviceCharge?: boolean; paymentMethods?: boolean| boolean[]; };
  };
}

const PAYMENT_OPTIONS = [
  { id: "M-Pesa", icon: Smartphone },
  { id: "Credit Card", icon: CreditCard },
  { id: "Debit Card", icon: CreditCard },
  { id: "Cash", icon: Banknote }
];

export function StepThree({ formik }: StepThreeProps) {
  const handlePaymentToggle = (method: string) => {
    const current = formik.values.paymentMethods;
    if (current.includes(method)) {
      formik.setFieldValue("stepThree.paymentMethods", current.filter((m) => m !== method));
    } else {
      formik.setFieldValue("stepThree.paymentMethods", [...current, method]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Financials & Payments</h3>
        <p className="text-sm text-gray-500 mb-6">Configure your tax settings and accepted payment methods.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
        <div className="space-y-2">
          <Label htmlFor="taxRate" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-gray-400" /> Default VAT / Tax Rate (%)
          </Label>
          <div className="relative">
            <Input
              name="stepThree.taxRate"
              type="number"
              value={formik.values.taxRate}
              onChange={formik.handleChange}
              className="h-12 bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] pr-8"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
          </div>
          {formik.touched.taxRate && formik.errors.taxRate && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.taxRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceCharge" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-gray-400" /> Service Charge (%)
          </Label>
          <div className="relative">
            <Input
              name="stepThree.serviceCharge"
              type="number"
              value={formik.values.serviceCharge}
              onChange={formik.handleChange}
              className="h-12 bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] pr-8"
              placeholder="e.g. 10 (Optional)"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
          </div>
          {formik.touched.serviceCharge && formik.errors.serviceCharge && (
            <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.serviceCharge}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Accepted Payment Methods</Label>
        <div className="grid grid-cols-2 gap-4">
          {PAYMENT_OPTIONS.map((method) => {
            const isSelected = formik.values.paymentMethods.includes(method.id);
            return (
              <label 
                key={method.id} 
                className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "border-[#008080] bg-[#008080]/5 ring-1 ring-[#008080]/20" 
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => handlePaymentToggle(method.id)}
                />
                <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-[#008080] border-[#008080]" : "border-gray-300 bg-white"
                }`}>
                  {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <method.icon className={`w-5 h-5 ${isSelected ? 'text-[#008080]' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${isSelected ? 'text-[#008080]' : 'text-gray-700'}`}>
                  {method.id}
                </span>
              </label>
            );
          })}
        </div>
        {formik.touched.paymentMethods && formik.errors.paymentMethods && (
          <p className="text-red-500 text-xs font-bold mt-1">{formik.errors.paymentMethods}</p>
        )}
      </div>
    </div>
  );
}