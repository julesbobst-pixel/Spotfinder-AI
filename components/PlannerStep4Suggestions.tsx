import React from 'react';
import { TimeSlotSuggestion } from '../types';
import { CalendarIcon, SparklesIcon } from './icons/CardIcons';

interface Props {
  suggestions: TimeSlotSuggestion[];
  onSelect: (dateTime: string) => void;
  onBack: () => void;
}

const PlannerStep4Suggestions: React.FC<Props> = ({ suggestions, onSelect, onBack }) => {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' Uhr';
  };

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-2xl font-semibold mb-2">Optimale Zeitfenster</h2>
      <p className="text-center text-gray-400 mb-6">Basierend auf deinen Wünschen und der Wetterprognose sind dies die besten Termine. Wähle einen, um den finalen Plan zu generieren.</p>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion.dateTime)}
            className="w-full text-left p-4 bg-gray-700/50 border-2 border-gray-600 rounded-lg hover:border-red-500 hover:bg-gray-700 transition-all"
          >
            <div className="flex items-center font-bold text-lg text-white mb-2">
                <CalendarIcon className="w-5 h-5 mr-2 text-red-400" />
                {formatDate(suggestion.dateTime)}
            </div>
            <div className="flex items-start text-sm text-gray-300">
                 <SparklesIcon className="w-5 h-5 mr-2 mt-0.5 text-red-40á0 flex-shrink-0" />
                <p>{suggestion.reason}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            &larr; Zurück und Kriterien ändern
        </button>
      </div>
    </div>
  );
};

export default PlannerStep4Suggestions;
