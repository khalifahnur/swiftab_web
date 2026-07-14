"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepOne } from "./StepOne";
import { StepTwo } from "./StepTwo";
import { StepThree } from "./StepThree"; 

import { StepIndicator } from "./StepIndicator";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAddRestaurant } from "@/hooks/restauranthook/restauranthook";
import { ErrorResponse } from "@/types/restaurant";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { useAuth } from "../auth/AuthContext";
import { ChevronLeft, ChevronRight, Loader2, Store } from "lucide-react";
import { StepFive } from "./StepFive";
import { StepFour } from "./StepFour";

interface RestaurantSetupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const stepOneSchema = Yup.object().shape({
  restaurantName: Yup.string().required("Restaurant name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  description: Yup.string().required("Description is required"),
});

const stepTwoSchema = Yup.object().shape({
  averagePrice: Yup.number().min(0, "Must be positive").required("Average price is required"),
  hoursOfOperation: Yup.string().required("Hours of operation are required"),
  cuisines: Yup.string().required("Cuisines are required"),
  rate: Yup.number().min(1).max(5).required("Initial rating is required"),
});

const stepThreeSchema = Yup.object().shape({
  taxRate: Yup.number().min(0).max(100).required("Tax rate is required"),
  serviceCharge: Yup.number().min(0).max(100),
  paymentMethods: Yup.array().of(Yup.string()).min(1, "Select at least one payment method"),
});

const stepFourSchema = Yup.object().shape({
  location: Yup.string().required("Location is required"),
  latitude: Yup.string().required("Latitude is required"),
  longitude: Yup.string().required("Longitude is required"),
});

const stepFiveSchema = Yup.object().shape({
  logo: Yup.mixed().required("Logo is required"),
  coverImage: Yup.mixed().required("Cover image is required"),
});

export function RestaurantSetupModal({ isOpen, onOpenChange }: RestaurantSetupModalProps) {
  const { refreshUser, user } = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const { toast } = useToast();
  const { mutate: addRestaurant, isPending } = useAddRestaurant();

  const validationSchemas = [stepOneSchema, stepTwoSchema, stepThreeSchema, stepFourSchema, stepFiveSchema];

  const initialValues = {
    stepOne: { restaurantName: "", description: "", email: "", phone: "" },
    stepTwo: { averagePrice: 0, hoursOfOperation: "", rate: 5, cuisines: "" },
    stepThree: { taxRate: 16, serviceCharge: 0, paymentMethods: ["M-Pesa"] },
    stepFour: { location: "", latitude: "", longitude: "" },
    stepFive: { logo: null as File | null, coverImage: null as File | null },
  };

  const stepKeys = ["stepOne", "stepTwo", "stepThree", "stepFour", "stepFive"] as const;

  const handleNext = async (formik: any) => {
    const currentStepKey = stepKeys[step - 1];
    const errors = await formik.validateForm();
    
    const currentStepFields = Object.keys(formik.values[currentStepKey]).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as any);

    formik.setTouched({ ...formik.touched, [currentStepKey]: currentStepFields });

    if (!errors[currentStepKey]) {
      setDirection(1);
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (values: typeof initialValues) => {
    const combinedData = {
      title: "New Restaurants",
      data: [
        {
          restaurantName: values.stepOne.restaurantName,
          location: values.stepFour.location,
          latitude: parseFloat(values.stepFour.latitude),
          longitude: parseFloat(values.stepFour.longitude),
          rate: values.stepTwo.rate,
          taxRate: values.stepThree.taxRate / 100, // Convert 16% to 0.16
          serviceCharge: values.stepThree.serviceCharge / 100, // Convert 10% to 0.10
          paymentMethods: values.stepThree.paymentMethods,
          about: [
            {
              description: values.stepOne.description,
              averagePrice: values.stepTwo.averagePrice,
              hrsOfOperation: values.stepTwo.hoursOfOperation,
              phone: values.stepOne.phone,
              email: values.stepOne.email,
              cuisines: values.stepTwo.cuisines,
            },
          ],
        },
      ],
    };

    const formData = new FormData();
    if (values.stepFive.logo) formData.append("logoString", values.stepFive.logo);
    if (values.stepFive.coverImage) formData.append("coverImageString", values.stepFive.coverImage);
    formData.append("title", combinedData.title);
    formData.append("data", JSON.stringify(combinedData));

    try {
      await addRestaurant(formData, {
        onSuccess: () => {
          toast({ title: "Success!", description: "Your restaurant has been set up successfully." });
          refreshUser();
          onOpenChange(false);
        },
        onError: (error: ErrorResponse) => {
          toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
        },
      });
    } catch (error) {
      console.error("Error submitting restaurant data:", error);
    }
  };

  const handleClose = useCallback(
    (open: boolean) => {
      onOpenChange(open);
      if (!open && user?.restaurantId) {
        window.location.reload();
      }
    },
    [onOpenChange, user]
  );

  const animationClass = direction === 1 
    ? "animate-in fade-in slide-in-from-right-8 duration-500" 
    : "animate-in fade-in slide-in-from-left-8 duration-500";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="[&>button]:hidden sm:max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-[24px] flex flex-col max-h-[90vh] font-sans"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="px-8 pt-8 pb-6 bg-gray-50/50 border-b border-gray-100 z-10 shrink-0">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="h-12 w-12 rounded-full bg-[#008080]/10 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6 text-[#008080]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Set Up Your Restaurant
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-gray-500 mt-1">
                Complete your profile to unlock your POS dashboard.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="mt-8">
            <StepIndicator currentStep={step} totalSteps={5} />
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchemas[step - 1]}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
          enableReinitialize
        >
          {(formik) => (
            <Form className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-8 bg-white">
                <div key={step} className={animationClass}>
                  {step === 1 && (
                    <StepOne
                      formik={{
                        values: formik.values.stepOne,
                        handleChange: formik.handleChange,
                        errors: formik.errors.stepOne || {},
                        touched: formik.touched.stepOne || {},
                        setFieldValue: formik.setFieldValue,
                      }}
                    />
                  )}
                  {step === 2 && (
                    <StepTwo
                      formik={{
                        values: formik.values.stepTwo,
                        setFieldValue: formik.setFieldValue,
                        handleChange: formik.handleChange,
                        errors: formik.errors.stepTwo || {},
                        touched: formik.touched.stepTwo || {},
                      }}
                    />
                  )}
                  {step === 3 && (
                    <StepThree
                      formik={{
                        values: formik.values.stepThree,
                        handleChange: formik.handleChange,
                        setFieldValue: formik.setFieldValue,
                        errors: formik.errors.stepThree || {},
                        touched: formik.touched.stepThree || {},
                      }}
                    />
                  )}
                  {step === 4 && (
                    <StepFour
                      formData={formik.values.stepFour}
                      handleInputChange={formik.handleChange}
                      errors={formik.errors.stepFour || {}}
                      touched={formik.touched.stepFour || {}}
                    />
                  )}
                  {step === 5 && (
                    <StepFive
                      formik={{
                        values: formik.values.stepFive,
                        setFieldValue: formik.setFieldValue,
                        errors: formik.errors.stepFive || {},
                        touched: formik.touched.stepFive || {},
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-between items-center z-10 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div>
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-bold h-12 px-6 rounded-xl transition-all"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" /> Back
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>
                
                <div>
                  {step < 5 ? (
                    <Button 
                      type="button" 
                      onClick={() => handleNext(formik)}
                      className="bg-[#008080] hover:bg-[#006666] text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-[#008080]/20 transition-transform active:scale-95"
                    >
                      Next Step <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isPending}
                      className="bg-[#008080] hover:bg-[#006666] text-white font-bold h-12 px-8 rounded-xl shadow-md shadow-[#008080]/20 transition-transform active:scale-95 disabled:opacity-70 disabled:scale-100"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Finalizing Profile...
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}












