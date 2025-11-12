
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div>
      <p className="text-sm font-medium text-gray-400 mb-2">
        Schritt {currentStep} von {totalSteps}
      </p>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-[rgb(var(--color-primary))] h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
