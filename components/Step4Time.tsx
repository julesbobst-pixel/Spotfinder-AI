import React from 'react';
import { SearchCriteria } from '../types';

interface TimeOfDay {
    value: string;
    label: string;
}

interface Step4TimeProps {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  timesOfDay: TimeOfDay[];
}

const Step4Time: React.FC<Step4TimeProps> = ({ criteria, setCriteria, timesOfDay }) => {
  const currentIndex = timesOfDay.findIndex(t => t.value === criteria.timeOfDay);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    setCriteria(prev => ({ ...prev, timeOfDay: timesOfDay[newIndex].value }));
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4 text-center">Für wann planst du dein Shooting?</h2>
      <p className="text-center text-gray-400 mb-10">Die gewählte Zeit wird für die Wettervorhersage verwendet.</p>
      
      <div className="w-full max-w-md">
        <p className="text-center text-2xl font-bold text-primary-400 mb-4">
          {criteria.timeOfDay}
        </p>
        <input
          id="time-slider"
          type="range"
          min="0"
          max={timesOfDay.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-gray-400 px-1 mt-2">
            {timesOfDay.map((time, index) => (
                <span key={time.value} className={`transition-opacity ${index !== 0 && index !== timesOfDay.length -1 ? 'hidden sm:inline' : 'inline'}`}>|</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Step4Time;