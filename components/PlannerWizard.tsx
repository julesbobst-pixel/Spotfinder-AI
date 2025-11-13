import React from 'react';
import { PlannerCriteria, Coordinates } from '../types';
import PlannerStep1Concept from './PlannerStep1Concept';
import PlannerStep2DateTime from './PlannerStep2DateTime';
import Step2Location from './Step2Location';
import { motion, AnimatePresence } from 'framer-motion';

import { MAX_RADIUS } from '../constants';

interface PlannerWizardProps {
  step: number;
  setStep: (step: number) => void;
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
  onGeneratePlan: () => void;
}

const PlannerWizard: React.FC<PlannerWizardProps> = ({ 
    step, setStep, criteria, setCriteria, onGeneratePlan 
}) => {
  const handleNext = () => {
    navigator.vibrate?.(50);
    setStep(step + 1);
  };
  const handleBack = () => {
    navigator.vibrate?.(50);
    setStep(step - 1);
  };

  const isNextDisabled = () => {
    switch(step) {
        case 1: return !criteria.motivs || criteria.motivs.length === 0;
        case 2: return !criteria.dateRange?.start || !criteria.dateRange?.end;
        case 3: return !criteria.userLocation;
        default: return true;
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PlannerStep1Concept criteria={criteria} setCriteria={setCriteria} />;
      case 2:
        return <PlannerStep2DateTime criteria={criteria} setCriteria={setCriteria} />;
      case 3:
        return <Step2Location 
                    radius={criteria.radius || 25}
                    onRadiusChange={(r) => setCriteria(prev => ({...prev, radius: r}))} 
                    setUserLocation={(loc: Coordinates | null) => setCriteria(prev => ({...prev, userLocation: loc || undefined}))} 
                    maxRadius={MAX_RADIUS} 
                />;
      default:
        return null;
    }
  };

  const StepIndicatorBar = ({ current, total }: { current: number, total: number }) => {
    const steps = ["Konzept", "Bedingungen", "Standort"];
    return (
        <div className="flex justify-center items-center mb-8">
            {steps.map((label, index) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${current > index + 1 ? 'bg-green-500' : current === index + 1 ? 'bg-primary-500' : 'bg-gray-600'}`}>
                            {current > index + 1 ? '✓' : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${current >= index + 1 ? 'text-white' : 'text-gray-400'}`}>{label}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition-all ${current > index + 1 ? 'bg-green-500' : 'bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
  };

 return (
    <motion.div
      key="planner-wizard"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="futuristic-bg p-8 rounded-2xl futuristic-border w-full max-w-3xl mx-auto shadow-2xl"
    >
        <StepIndicatorBar current={step} total={3} />
        <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
        </AnimatePresence>
        <div className="flex justify-between mt-10">
            <button onClick={handleBack} disabled={step === 1} className="px-8 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50">Zurück</button>
            <button
                onClick={step === 3 ? () => { navigator.vibrate?.(80); onGeneratePlan(); } : handleNext}
                disabled={isNextDisabled()}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:bg-gray-700/80 disabled:cursor-not-allowed disabled:shadow-none btn-primary-glow"
            >
                {step === 3 ? 'Plan generieren' : 'Weiter'}
            </button>
        </div>
    </motion.div>
  );
};

export { PlannerWizard };