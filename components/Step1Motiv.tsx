import React from 'react';
import { SearchCriteria } from '../types';

interface Motiv {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

interface Step1MotivProps {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  motivs: Motiv[];
}

const Step1Motiv: React.FC<Step1MotivProps> = ({ criteria, setCriteria, motivs }) => {
  const toggleMotiv = (motivId: string) => {
    setCriteria((prev) => {
      const newMotivs = prev.motivs.includes(motivId)
        ? prev.motivs.filter((m) => m !== motivId)
        : [...prev.motivs, motivId];
      return { ...prev, motivs: newMotivs };
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">Was möchtest du aufnehmen?</h2>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setCriteria(prev => ({ ...prev, mediaType: 'photo' }))}
          className={`px-8 py-2.5 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${criteria.mediaType === 'photo' ? 'bg-primary-500 border-primary-500 text-white' : 'bg-gray-700 border-gray-600 hover:border-primary-500'}`}
        >
          Fotografie
        </button>
        <button
          onClick={() => setCriteria(prev => ({ ...prev, mediaType: 'video' }))}
          className={`px-8 py-2.5 rounded-lg text-lg font-semibold transition-all duration-200 border-2 ${criteria.mediaType === 'video' ? 'bg-primary-500 border-primary-500 text-white' : 'bg-gray-700 border-gray-600 hover:border-primary-500'}`}
        >
          Videografie
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2 text-center">Was ist dein Hauptmotiv?</h3>
      <p className="text-center text-gray-400 mb-6">Wähle ein oder mehrere Motive.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {motivs.map((motiv) => {
          const isSelected = criteria.motivs.includes(motiv.id);
          return (
            <button
              key={motiv.id}
              onClick={() => toggleMotiv(motiv.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${isSelected ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500 hover:bg-gray-700 text-gray-300'}
              `}
            >
              <motiv.icon className="w-10 h-10 mb-2" />
              <span className="font-medium text-sm">{motiv.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1Motiv;