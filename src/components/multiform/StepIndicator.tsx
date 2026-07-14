import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, className = '' }: StepIndicatorProps) {
  return (
    <div className={`w-full max-w-2xl mx-auto font-sans ${className}`}>
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-4 left-0 w-full h-1.5 bg-gray-100 rounded-full" />
        
        {/* Fill Track */}
        <div 
          className="absolute top-4 left-0 h-1.5 bg-[#008080] rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div key={step} className="flex flex-col items-center group z-10">
                <div
                  className={`
                    relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out transform
                    ${isCompleted 
                      ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/30 scale-100' 
                      : isCurrent
                      ? 'bg-white text-[#008080] border-[3px] border-[#008080] shadow-lg scale-110'
                      : 'bg-white text-gray-400 border-[3px] border-gray-100'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>

                <div className="mt-3 text-center absolute top-10">
                  <div
                    className={`
                      text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 mt-2 whitespace-nowrap
                      ${isCompleted || isCurrent ? 'text-[#008080]' : 'text-gray-400'}
                    `}
                  >
                    Step {step}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}