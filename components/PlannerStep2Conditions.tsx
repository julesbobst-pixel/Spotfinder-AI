import React from 'react';
import { PlannerCriteria } from '../types';
import { DESIRED_WEATHER, DESIRED_LIGHT } from '../constants';

interface Props {
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
}

const PlannerStep2Conditions: React.FC<Props> = ({ criteria, setCriteria }) => {

  const toggleItem = (category: 'desiredWeather' | 'desiredLight', value: string) => {
    setCriteria((prev) => {
      const currentItems = prev[category] || [];
      const newItems = currentItems.includes(value)
        ? currentItems.filter((i) => i !== value)
        : [...currentItems, value];
      return { ...prev, [category]: newItems };
    });
  };

  return (
    <div className="w-full max-w-xl text-center">
      <h2 className="text-2xl font-semibold mb-2">Was sind die idealen Bedingungen?</h2>
      <p className="text-center text-gray-400 mb-6">Wähle deine Wunschvorstellungen. Die KI sucht dann nach passenden Terminen.</p>
      
      <div className="text-left mb-6">
        <label className="block text-gray-300 text-sm font-bold mb-2">Gewünschtes Wetter</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DESIRED_WEATHER.map(weather => (
                 <label
                    key={weather}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border-2
                    ${criteria.desiredWeather?.includes(weather) ? 'bg-red-500/20 border-red-500' : 'bg-gray-700/50 border-gray-600 hover:border-red-500'}
                    `}
                >
                    <input
                    type="checkbox"
                    checked={criteria.desiredWeather?.includes(weather)}
                    onChange={() => toggleItem('desiredWeather', weather)}
                    className="w-5 h-5 rounded accent-red-500 bg-gray-700 border-gray-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-200">{weather}</span>
                </label>
            ))}
        </div>
      </div>
      
       <div className="text-left">
        <label className="block text-gray-300 text-sm font-bold mb-2">Gewünschtes Licht</label>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DESIRED_LIGHT.map(light => (
                 <label
                    key={light}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border-2
                    ${criteria.desiredLight?.includes(light) ? 'bg-red-500/20 border-red-500' : 'bg-gray-700/50 border-gray-600 hover:border-red-500'}
                    `}
                >
                    <input
                    type="checkbox"
                    checked={criteria.desiredLight?.includes(light)}
                    onChange={() => toggleItem('desiredLight', light)}
                    className="w-5 h-5 rounded accent-red-500 bg-gray-700 border-gray-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-200">{light}</span>
                </label>
            ))}
        </div>
      </div>

    </div>
  );
};

export default PlannerStep2Conditions;
