"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/authhook/authhooks";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "../Loading/FullScreen";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface AdminSignInFormProps {
  onToggleView?: () => void;
  onClose?: () => void;
  restaurantName?: string;
}

const AdminSignInSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export function SignInForm({
  restaurantName = "Swiftab",
}: AdminSignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const signInMutation = useLogin();

  useEffect(() => {
    if (signInMutation.isSuccess) {
      toast.success(
        "Welcome Back! Successfully logged into your management dashboard."
      );
      setLoading(true);
      router.replace("/home");
    }
  }, [signInMutation.isSuccess, signInMutation.isError, signInMutation.error, toast, router]);

  return (
    <div className="w-full max-w-[400px] mx-auto flex flex-col bodyfont">
      {loading && <FullScreenLoader />}
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
          Welcome back
        </h2>
        <p className="text-[15px] text-slate-500">
          Sign in to manage {restaurantName}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[14px] font-medium text-center shadow-sm">
          {error}
        </div>
      )}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={AdminSignInSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setError(null);
          try {
            await signInMutation.mutateAsync(values);
          } catch (err: any) {
            console.error("Login failed:", err);
            const errorMessage =
              err?.message ||
              (err.statusCode === 401
                ? "Invalid administrator credentials"
                : "Authentication failed. Please verify your details.");
            setError(errorMessage);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div className="flex flex-col">
              <Label htmlFor="email" className="text-[14px] font-medium text-slate-700 mb-1.5">
                Administrator Email
              </Label>
              <Field
                name="email"
                as={Input}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder-slate-400 shadow-sm focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200 outline-none"
                placeholder="admin@restaurant.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-[12px] font-medium mt-1.5 ml-1"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-[14px] font-medium text-slate-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-teal-600 hover:text-teal-700 hover:underline underline-offset-4 transition-all"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Field
                  name="password"
                  as={Input}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-[15px] text-slate-900 placeholder-slate-400 shadow-sm focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all duration-200 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-[12px] font-medium mt-1.5 ml-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-[52px] mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[15px] rounded-xl shadow-[0_8px_16px_-4px_rgba(13,148,136,0.25)] hover:shadow-[0_12px_20px_-4px_rgba(13,148,136,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading || isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </Button>
            <div className="pt-5 text-center border-t border-slate-100 mt-6">
              <p className="text-[14px] text-slate-500">
                Don't have an admin account?{" "}
                <Link
                  href="/signup"
                  className="text-teal-600 font-medium hover:text-teal-700 hover:underline underline-offset-4 transition-all inline-flex items-center"
                >
                  Create one
                </Link>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}