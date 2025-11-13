import React, { useState } from 'react';
import { PhotoshootPlan } from '../types';
import { LocationMarkerIcon, ClockIcon, SunIcon, SparklesIcon, DocumentTextIcon, MoonIcon } from './icons/CardIcons';
import WeatherDisplay from './WeatherDisplay';

interface PlanCardProps {
  plan: PhotoshootPlan;
  onDelete: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/70 rounded-xl border border-gray-700 transition-all">
      {/* Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h4 className="font-bold text-lg text-primary-400">{plan.title}</h4>
          <p className="text-sm text-gray-400 flex items-center">
            <LocationMarkerIcon className="w-4 h-4 mr-1.5" />
            {plan.spot.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`Möchtest du den Plan "${plan.title}" wirklich löschen?`)) {
                        onDelete(plan.id);
                    }
                }} 
                className="text-gray-500 hover:text-primary-500 text-xs font-semibold px-3 py-1 bg-gray-700 rounded-md transition-colors"
            >
                Löschen
            </button>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-sm space-y-3">
                <p className="font-semibold text-white">Reiseplan</p>
                <p><ClockIcon className="w-4 h-4 inline mr-2" />Abfahrt: {plan.travelPlan.departureTime}</p>
                <p className="text-gray-300">{plan.travelPlan.notes}</p>
            </div>
             <div className="text-sm space-y-3">
                <p className="font-semibold text-white">Wetter & Licht</p>
                 <WeatherDisplay weather={plan.weatherForecast} isLoading={false} />
                 <p className="text-gray-300">{plan.weatherForecast.notes}</p>
                 <p><SunIcon className="w-4 h-4 inline mr-2" />{plan.lightingAnalysis.condition}</p>
                 <p><MoonIcon className="w-4 h-4 inline mr-2" />Lichtverschmutzung: {plan.lightingAnalysis.lightPollution}</p>
            </div>
             <div className="text-sm space-y-3">
                <p className="font-semibold text-white">Ausrüstung</p>
                 <ul className="list-disc list-inside text-gray-300">
                    {plan.equipmentList.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
             <div className="text-sm space-y-3">
                <p className="font-semibold text-white">Profi-Tipps</p>
                 <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {plan.notesAndTips.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCard;