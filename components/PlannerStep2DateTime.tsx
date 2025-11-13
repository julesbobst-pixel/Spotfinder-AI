import React from 'react';
import { PlannerCriteria } from '../types';
import { DESIRED_LIGHT, DESIRED_WEATHER } from '../constants';

interface Props {
  criteria: Partial<PlannerCriteria>;
  setCriteria: React.Dispatch<React.SetStateAction<Partial<PlannerCriteria>>>;
}

const PlannerStep2DateTime: React.FC<Props> = ({ criteria, setCriteria }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    setCriteria(prev => ({
      ...prev,
      dateRange: {
        start: prev.dateRange?.start || '',
        end: prev.dateRange?.end || '',
        ...prev.dateRange,
        [field]: e.target.value
      }
    }));
  };

  const toggleSelection = (field: 'desiredWeather' | 'desiredLight', value: string) => {
    navigator.vibrate?.(30);
    setCriteria(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-2xl font-semibold mb-2">Lege die Bedingungen fest</h2>
      <p className="text-center text-gray-400 mb-6">Gib den Zeitraum und deine Wunschvorstellungen für Wetter und Licht an.</p>
      
      <div className="text-left space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-center">1. Wann bist du verfügbar?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex-1">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="startDate">
                Von
              </label>
              <input
                id="startDate"
                type="date"
                value={criteria.dateRange?.start || ''}
                onChange={(e) => handleDateChange(e, 'start')}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                min={today}
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="endDate">
                Bis
              </label>
              <input
                id="endDate"
                type="date"
                value={criteria.dateRange?.end || ''}
                onChange={(e) => handleDateChange(e, 'end')}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                min={criteria.dateRange?.start || today}
              />
            </div>
          </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold mb-3 text-center">2. Bevorzugtes Wetter (optional)</h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {DESIRED_WEATHER.map(weather => {
                    const isSelected = criteria.desiredWeather?.includes(weather);
                    return (
                        <button key={weather} onClick={() => toggleSelection('desiredWeather', weather)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${isSelected ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500'}`}>
                            {weather}
                        </button>
                    )
                })}
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold mb-3 text-center">3. Bevorzugtes Licht (optional)</h3>
             <div className="flex flex-wrap gap-2 justify-center">
                {DESIRED_LIGHT.map(light => {
                    const isSelected = criteria.desiredLight?.includes(light);
                    return (
                        <button key={light} onClick={() => toggleSelection('desiredLight', light)} className={`px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${isSelected ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-gray-700/50 border-gray-600 hover:border-primary-500'}`}>
                            {light}
                        </button>
                    )
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlannerStep2DateTime;