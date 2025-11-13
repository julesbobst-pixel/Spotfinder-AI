import React from 'react';
import { WeatherData } from '../types';
import { WEATHER_DETAILS_CONFIG } from '../constants';
import { DuotoneSunIcon, DuotoneCloudIcon, DuotoneRainIcon, DuotoneWindIcon, DuotoneSnowIcon, DuotonePartlyCloudyIcon, DuotoneFogIcon } from './icons/WeatherIcons';

interface WeatherDisplayProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

const WeatherIcon: React.FC<{ condition: string; className?: string }> = ({ condition, className = "w-8 h-8" }) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('schnee')) return <DuotoneSnowIcon className={className} />;
    if (lowerCondition.includes('regen') || lowerCondition.includes('schauer')) return <DuotoneRainIcon className={className} />;
    if (lowerCondition.includes('nebel')) return <DuotoneFogIcon className={className} />;
    if (lowerCondition.includes('wind')) return <DuotoneWindIcon className={className} />;
    if (lowerCondition.includes('sonnig') || lowerCondition.includes('klar')) return <DuotoneSunIcon className={className} />;
    if (lowerCondition.includes('leicht bewölkt') || lowerCondition.includes('wolkig') || lowerCondition.includes('teilweise')) return <DuotonePartlyCloudyIcon className={className} />;
    if (lowerCondition.includes('bewölkt') || lowerCondition.includes('dramatische wolken') || lowerCondition.includes('bedeckt')) return <DuotoneCloudIcon className={className} />;
    return <DuotoneCloudIcon className={className} />; // Default
};


const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, isLoading }) => {
  if (isLoading) {
    return <div className="bg-gray-700/50 p-3 rounded-lg text-xs text-center animate-pulse w-48 h-[76px]">Lade Wetter...</div>;
  }

  if (!weather) {
    return <div className="bg-gray-700/50 p-3 rounded-lg text-xs text-center w-48">Wetterdaten nicht verfügbar.</div>;
  }

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-3 border border-gray-600/50">
      <div className="flex-shrink-0 text-red-400">
        <WeatherIcon condition={weather.condition} className="w-10 h-10" />
      </div>
      <div>
        {WEATHER_DETAILS_CONFIG.temperature && <p className="font-bold text-lg">{weather.temperature}°C</p>}
        <p className="text-xs text-gray-400 -mt-1 capitalize">{weather.condition}</p>
        <div className="text-xs text-gray-300 mt-1 space-y-0.5">
            {WEATHER_DETAILS_CONFIG.precipitationChance && <span>N: {weather.precipitationChance}%</span>}
            {WEATHER_DETAILS_CONFIG.windSpeed && <span className="ml-2">W: {weather.windSpeed} km/h</span>}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;