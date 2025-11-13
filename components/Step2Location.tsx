
import React, { useState, useEffect } from 'react';
import { SearchCriteria, Coordinates } from '../types';
import { geocodeLocation, reverseGeocode } from '../services/geminiService';

interface Step2LocationProps {
  criteria: SearchCriteria;
  setCriteria: React.Dispatch<React.SetStateAction<SearchCriteria>>;
  setUserLocation: (location: Coordinates | null) => void;
  maxRadius: number;
}

const Step2Location: React.FC<Step2LocationProps> = ({ criteria, setCriteria, setUserLocation, maxRadius }) => {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [manualInput, setManualInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [resolvedLocationName, setResolvedLocationName] = useState<string | null>(null);

  useEffect(() => {
    // Fix: Replaced NodeJS.Timeout with number for browser compatibility.
    let timer: number;
    if (resolvedLocationName) {
      timer = setTimeout(() => {
        setResolvedLocationName(null);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [resolvedLocationName]);

  const handleLocationClick = () => {
    setLocationStatus('loading');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lon: longitude };
        setUserLocation(coords);
        try {
            const name = await reverseGeocode(coords);
            setResolvedLocationName(name);
        } catch (e) {
            console.error("Reverse geocoding failed, but location is set.", e)
        }
        setLocationStatus('success');
      },
      (error) => {
        setErrorMsg('Standort konnte nicht abgerufen werden. Bitte Berechtigung erteilen oder Ort manuell eingeben.');
        setLocationStatus('error');
        setUserLocation(null);
      }
    );
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualInput.trim()) return;
      
      setIsGeocoding(true);
      setErrorMsg('');
      try {
          const result = await geocodeLocation(manualInput);
          setUserLocation({ lat: result.lat, lon: result.lon });
          setResolvedLocationName(result.name);
          setLocationStatus('success');
      } catch (err: any) {
          setErrorMsg(err.message || "Ort konnte nicht gefunden werden.");
          setLocationStatus('error');
      } finally {
          setIsGeocoding(false);
      }
  }
  
  const getButtonText = () => {
    switch(locationStatus) {
        case 'loading': return 'Standort wird ermittelt...';
        case 'success': return 'Standort erfasst!';
        default: return 'Meinen aktuellen Standort verwenden';
    }
  }

  return (
    <div className="flex flex-col items-center w-full relative">
      <h2 className="text-2xl font-semibold mb-4 text-center">Wo befindest du dich?</h2>
      <p className="text-center text-gray-400 mb-6">Wir brauchen deinen Standort, um Spots in der Nähe zu finden.</p>

      <div className="w-full max-w-sm relative">
        {resolvedLocationName && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max bg-green-800/80 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-lg border border-green-600 shadow-lg animate-fade-in-out">
                Standort gefunden: {resolvedLocationName} ✓
            </div>
        )}
        <button
            onClick={handleLocationClick}
            disabled={locationStatus === 'loading'}
            className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition-colors flex items-center justify-center
            ${locationStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            disabled:bg-gray-500 disabled:cursor-wait`}
        >
            {locationStatus === 'loading' && <SpinnerIcon />}
            {getButtonText()}
        </button>
      </div>

      <div className="w-full max-w-sm mt-6 text-center">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">oder</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <p className="text-gray-300 mb-3 text-sm font-semibold">Korrigiere den Standort oder gib ihn manuell ein:</p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="PLZ, Stadt oder Adresse"
                className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button 
                type="submit" 
                disabled={isGeocoding || !manualInput}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
                {isGeocoding ? <SpinnerIcon /> : 'Suchen'}
            </button>
        </form>
         {errorMsg && <p className="text-red-400 mt-2 text-sm">{errorMsg}</p>}
      </div>

      <div className="w-full max-w-md mt-8">
        <label htmlFor="radius-slider" className="block mb-2 font-medium text-center">
          Umkreis: <span className="font-bold text-red-400">{criteria.radius} km</span>
        </label>
        <input
          id="radius-slider"
          type="range"
          min="1"
          max={maxRadius}
          value={criteria.radius}
          onChange={(e) => setCriteria(prev => ({ ...prev, radius: parseInt(e.target.value, 10) }))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
          <span>1 km</span>
          <span>{maxRadius} km</span>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(-10px) translateX(-50%); }
          10%, 90% { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default Step2Location;
