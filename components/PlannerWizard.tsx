
import React from 'react';
import { PlannerCriteria, Coordinates, TimeSlotSuggestion } from '../types';
import PlannerStep1Idea from './PlannerStep1Idea';
import PlannerStep2Conditions from './PlannerStep2Conditions';
import Step2Location from './Step2Location';
import PlannerStep4Suggestions from './PlannerStep4Suggestions';

import { MAX_RADIUS } from '../constants';

interface PlannerWizardProps {
  step: number;
  setStep: (step: number) => void;
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
  suggestions: TimeSlotSuggestion[];
  onGetSuggestions: () => void;
  onGeneratePlan: (dateTime: string) => void;
}

const PlannerWizard: React.FC<PlannerWizardProps> = ({ 
    step, setStep, criteria, setCriteria, suggestions, onGetSuggestions, onGeneratePlan 
}) => {
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const isNextDisabled = () => {
    switch(step) {
        case 1: return !criteria.subject || criteria.styles!.length === 0;
        case 2: return criteria.desiredWeather!.length === 0 || criteria.desiredLight!.length === 0;
        case 3: return !criteria.userLocation;
        default: return true;
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PlannerStep1Idea criteria={criteria} setCriteria={setCriteria} />;
      case 2:
        return <PlannerStep2Conditions criteria={criteria} setCriteria={setCriteria} />;
      case 3:
        return <Step2Location 
                    criteria={{ radius: criteria.radius!, ...criteria } as any} 
                    setCriteria={(update: React.SetStateAction<any>) => {
                        if (typeof update === 'function') {
                            setCriteria(prev => ({...prev, radius: update(prev).radius }));
                        }
                    }} 
                    setUserLocation={(loc: Coordinates | null) => setCriteria(prev => ({...prev, userLocation: loc!}))} 
                    maxRadius={MAX_RADIUS} 
                />;
      case 4:
          return <PlannerStep4Suggestions suggestions={suggestions} onSelect={onGeneratePlan} onBack={handleBack} />
      default:
        return null;
    }
  };

  const StepIndicatorBar = ({ current, total }: { current: number, total: number }) => {
    const steps = ["Idee", "Bedingungen", "Standort", "Terminwahl"];
    return (
        <div className="flex justify-center items-center mb-8">
            {steps.map((label, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${current >= index + 1 ? 'bg-red-500 border-red-500' : 'bg-gray-700/50 border-gray-600'}`}>
                            {current > index + 1 ? '✓' : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${current >= index + 1 ? 'text-white' : 'text-gray-400'}`}>{label}</p>
                    </div>
                    {index < total - 1 && <div className={`flex-auto h-0.5 transition-all mx-2 sm:mx-4 ${current > index + 1 ? 'bg-red-500' : 'bg-gray-600'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    )
  }

  return (
    <div className="futuristic-bg p-6 sm:p-8 rounded-2xl futuristic-border w-full max-w-3xl mx-auto shadow-2xl">
      <StepIndicatorBar current={step} total={4} />
      <div className="min-h-[300px] flex items-center justify-center">
        {renderStep()}
      </div>
      
      {step < 4 && (
        <div className="flex justify-between mt-10">
            <button onClick={handleBack} disabled={step === 1} className="px-8 py-3 bg-gray-600/50 border border-gray-500 text-white rounded-lg hover:bg-gray-500/50 transition-all disabled:opacity-50">Zurück</button>
            {step < 3 ? (
            <button onClick={handleNext} disabled={isNextDisabled()} className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-500/80 disabled:cursor-not-allowed disabled:shadow-none btn-primary-glow">Weiter</button>
            ) : (
            <button onClick={onGetSuggestions} disabled={isNextDisabled()} className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-500/80 disabled:cursor-not-allowed">Termine finden</button>
            )}
        </div>
      )}
    </div>
  );
};

export default PlannerWizard;
