"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserPlus, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useWaiterSignUp } from "@/hooks/authhook/authhooks";
import WaiterTable from "./WaiterTable";

const WaiterSignUpSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phoneNumber: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, "Invalid phone format").required("Phone number is required"),
});

export default function WaiterSignupTab() {
  const signUpMutation = useWaiterSignUp();

  const handleSubmit = async (
    values: { firstname: string; lastname: string; email: string; phoneNumber: string },
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void, resetForm: () => void }
  ) => {
    try {
      await signUpMutation.mutateAsync(values);
      resetForm();
    } catch (err: any) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 flex flex-col gap-6">
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
          <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <UserPlus className="h-5 w-5 text-[#008080]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-none mb-1.5">Add New Waiter</h2>
                <p className="text-xs text-gray-500 font-medium">Register staff to access the mobile POS</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <Formik
              initialValues={{ firstname: "", lastname: "", email: "", phoneNumber: "" }}
              validationSchema={WaiterSignUpSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstname" className="text-xs font-bold text-gray-700 uppercase tracking-wider">First Name</Label>
                      <Field
                        name="firstname"
                        as={Input}
                        className="w-full bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                        placeholder="John"
                      />
                      <ErrorMessage name="firstname" component="div" className="text-red-500 text-[11px] font-bold" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lastname" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Last Name</Label>
                      <Field
                        name="lastname"
                        as={Input}
                        className="w-full bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                        placeholder="Doe"
                      />
                      <ErrorMessage name="lastname" component="div" className="text-red-500 text-[11px] font-bold" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-400" /> Email Address
                    </Label>
                    <Field
                      name="email"
                      as={Input}
                      type="email"
                      className="w-full bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                      placeholder="john@restaurant.com"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-[11px] font-bold" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" /> Phone Number
                    </Label>
                    <Field
                      name="phoneNumber"
                      as={Input}
                      className="w-full bg-white border-gray-200 focus-visible:ring-[#008080]/20 focus-visible:border-[#008080] transition-all"
                      placeholder="+254 712 345678"
                    />
                    <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-[11px] font-bold" />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-[#008080] hover:bg-[#006666] text-white font-bold rounded-xl shadow-md shadow-[#008080]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          <span>Registering...</span>
                        </div>
                      ) : (
                        "Register Waiter"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
            
            <div className="flex items-start gap-3 mt-6 bg-[#008080]/5 p-4 rounded-xl border border-[#008080]/10">
              <ShieldCheck className="h-5 w-5 text-[#008080] shrink-0" />
              <p className="text-xs text-[#008080] leading-relaxed font-medium">
                A secure validation code will be emailed to the staff member. They need this code to authenticate and complete their account setup on the mobile app.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white h-full overflow-hidden">
          <WaiterTable />
        </Card>
      </div>
    </div>
  );
}