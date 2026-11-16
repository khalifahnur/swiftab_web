import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { useSignUp } from "@/hooks/authhook/authhooks";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FullScreenLoader } from "../Loading/FullScreen";
import toast from "react-hot-toast";
import Link from "next/link";

interface AdminSignUpFormProps {
  onClose?: () => void;
  onToggleView?: () => void;
  restaurantName?: string;
}

const AdminSignUpSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  restaurantName: Yup.string().required("Restaurant is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone format")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Min 8 characters")
    .matches(/[a-z]/, "Needs lowercase")
    .matches(/[A-Z]/, "Needs uppercase")
    .matches(/[0-9]/, "Needs number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password"),
});

export function SignUpForm({ onClose}: AdminSignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const signUpMutation = useSignUp();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const { confirmPassword, ...submitData } = values;
      await signUpMutation.mutateAsync(submitData);

      toast.success("Registration Successful!");

      if (onClose) onClose();
      setTimeout(() => {
        router.push("/signin");
      }, 1500);
    } catch (err: any) {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col bodyfont">
      {loading && <FullScreenLoader />}
      <div className="mb-5 text-left">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
          Create an account
        </h2>
        <p className="text-[14px] text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-teal-600 font-medium hover:text-teal-700 hover:underline underline-offset-4 transition-all">
            Log in
          </Link>
        </p>
      </div>

      <Formik
        initialValues={{
          name: "",
          restaurantName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={AdminSignUpSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-3.5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative pb-1">
                <Label htmlFor="name" className="text-[13px] font-medium text-slate-700 mb-1 block">Full Name</Label>
                <Field
                  name="name"
                  as={Input}
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                  placeholder="John Doe"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
              <div className="relative pb-1">
                <Label htmlFor="restaurantName" className="text-[13px] font-medium text-slate-700 mb-1 block">Restaurant Name</Label>
                <Field
                  name="restaurantName"
                  as={Input}
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                  placeholder="The Gourmet"
                />
                <ErrorMessage name="restaurantName" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative pb-1">
                <Label htmlFor="email" className="text-[13px] font-medium text-slate-700 mb-1 block">Email Address</Label>
                <Field
                  name="email"
                  as={Input}
                  type="email"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                  placeholder="name@restaurant.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
              <div className="relative pb-1">
                <Label htmlFor="phoneNumber" className="text-[13px] font-medium text-slate-700 mb-1 block">Phone Number</Label>
                <Field
                  name="phoneNumber"
                  as={Input}
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                  placeholder="+1 (555) 000-0000"
                />
                <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative pb-1">
                <Label htmlFor="password" className="text-[13px] font-medium text-slate-700 mb-1 block">Password</Label>
                <div className="relative">
                  <Field
                    name="password"
                    as={Input}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
              
              <div className="relative pb-1">
                <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-slate-700 mb-1 block">Confirm Password</Label>
                <div className="relative">
                  <Field
                    name="confirmPassword"
                    as={Input}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-[11px] absolute bottom-[-4px] left-1 font-medium" />
              </div>
            </div>
            <div className="pt-2 pb-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600 focus:ring-offset-white cursor-pointer" 
                  required
                />
                <span className="text-[13px] text-slate-600 leading-snug">
                  I agree to the <a href="/terms" className="text-teal-600 font-medium hover:underline">Terms</a> and <a href="/privacy" className="text-teal-600 font-medium hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-2.5 mt-1 bg-teal-600 hover:bg-teal-700 text-white font-medium text-[14px] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create account</span>
              )}
            </Button>

          </Form>
        )}
      </Formik>
    </div>
  );
}