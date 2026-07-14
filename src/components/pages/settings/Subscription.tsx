import React from 'react';
import { CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Subscription = () => {
  const plans = [
    {
      name: "Starter",
      price: "Ksh.499",
      description: "Perfect for small restaurants just getting started with digitization.",
      features: [
        "Up to 100 reservations/month",
        "Basic waitlist management",
        "Standard digital menu",
        "Standard email support",
        "1 admin account",
      ],
    },
    {
      name: "Professional",
      price: "Ksh.999",
      description: "Ideal for busy restaurants looking to streamline payments and operations.",
      features: [
        "Unlimited reservations",
        "Automated M-Pesa Integration",
        "Advanced floor plan tools",
        "Unlimited Waiter accounts",
        "Inventory tracking module",
        "Priority 24/7 support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Ksh.1199",
      description: "For high-volume establishments requiring maximum compliance.",
      features: [
        "Unlimited reservations",
        "KRA eTIMS Integration",
        "Multi-branch management",
        "API access for third-parties",
        "Custom Loyalty Program",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
      <div className="px-6 py-12 md:py-16 md:px-12 bg-gray-50/30">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="max-w-2xl text-gray-600 text-lg">
            Choose the Swiftab plan that scales with your restaurant. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-3xl transition-transform hover:-translate-y-1 duration-300 ${
                plan.popular
                  ? "bg-[#008080] shadow-2xl shadow-[#008080]/30 border-0 transform md:scale-105 z-10"
                  : "bg-white border border-gray-100 shadow-lg shadow-gray-200/40"
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Zap className="w-32 h-32 text-white" />
                </div>
              )}

              <div className="p-8 relative h-full flex flex-col">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#d4f870] text-[#1a2e05] text-xs font-bold uppercase tracking-wider shadow-sm">
                      Recommended
                    </div>
                  </div>
                )}

                <h3 className={`text-2xl font-bold ${plan.popular ? "text-white" : "text-gray-900"} mb-3 mt-4`}>
                  {plan.name}
                </h3>
                
                <div className="flex items-baseline mb-4">
                  <span className={`text-4xl font-black tracking-tight ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`ml-2 text-sm font-semibold ${plan.popular ? "text-white/80" : "text-gray-500"}`}>
                    /month
                  </span>
                </div>
                
                <p className={`mb-8 min-h-[48px] text-sm leading-relaxed ${plan.popular ? "text-white/90" : "text-gray-600"}`}>
                  {plan.description}
                </p>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle
                        className={`h-5 w-5 mr-3 shrink-0 ${plan.popular ? "text-[#d4f870]" : "text-[#008080]"}`}
                      />
                      <span className={`text-sm font-medium ${plan.popular ? "text-white" : "text-gray-700"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full h-12 rounded-xl font-bold text-base transition-all ${
                    plan.popular
                      ? "bg-white text-[#008080] hover:bg-gray-50"
                      : "bg-gray-100 text-gray-900 hover:bg-[#008080] hover:text-white"
                  }`}
                >
                  {plan.name === "Starter" ? "Start Free Trial" : "Upgrade Plan"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm font-medium text-gray-500">
          All plans include a 14-day free trial. No credit card required to start.
        </div>
      </div>
    </Card>
  );
};

export default Subscription;