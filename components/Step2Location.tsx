import React, { useState, useEffect } from 'react';
import { Coordinates, GeocodedLocation } from '../types';
import { geocodeLocation, reverseGeocode } from '../services/geminiService';
import { ClockIcon, LocationMarkerIcon } from './icons/CardIcons';

interface Step2LocationProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  setUserLocation: (location: Coordinates | null) => void;
  maxRadius: number;
}

const LAST_LOCATION_KEY = 'spotfinder_last_location';

const Step2Location: React.FC<Step2LocationProps> = ({ radius, onRadiusChange, setUserLocation, maxRadius }) => {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('Wir brauchen deinen Standort, um Spots in der Nähe zu finden.');
  
  const [manualInput, setManualInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [lastUsedLocation, setLastUsedLocation] = useState<GeocodedLocation | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_LOCATION_KEY);
    if (saved) {
      try {
        setLastUsedLocation(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse last location", e);
        localStorage.removeItem(LAST_LOCATION_KEY);
      }
    }
  }, []);

  const saveLastLocation = (location: GeocodedLocation) => {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
    setLastUsedLocation(location);
  };

  const handleUseLastLocation = () => {
    if (!lastUsedLocation) return;
    setUserLocation({ lat: lastUsedLocation.lat, lon: lastUsedLocation.lon });
    setLocationStatus('success');
    setStatusMessage(`Zuletzt verwendeter Ort: ${lastUsedLocation.name}`);
  };

  const handleLocationClick = () => {
    setLocationStatus('loading');
    setStatusMessage('Standort wird abgerufen...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lon: longitude };
        setUserLocation(coords);
        setStatusMessage('Ortsname wird ermittelt...');
        try {
            const name = await reverseGeocode(coords);
            const geocodedLocation = { ...coords, name };
            saveLastLocation(geocodedLocation);
            setStatusMessage(`Standort gefunden: ${name}`);
            setLocationStatus('success');
        } catch (e) {
            console.error("Reverse geocoding failed, but location is set.", e)
            setStatusMessage('Standort erfasst! Name konnte nicht ermittelt werden.');
            setLocationStatus('success');
        }
      },
      (error) => {
        let msg = 'Standort konnte nicht abgerufen werden.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Du hast den Zugriff auf deinen Standort verweigert. Bitte gib ihn in den Browsereinstellungen frei oder gib den Ort manuell ein.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Standortinformationen sind nicht verfügbar. Versuche es erneut oder gib den Ort manuell ein.';
            break;
          case error.TIMEOUT:
            msg = 'Die Anfrage nach dem Standort hat zu lange gedauert. Versuche es erneut.';
            break;
        }
        setStatusMessage(msg);
        setLocationStatus('error');
        setUserLocation(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualInput.trim()) return;
      
      setIsGeocoding(true);
      setStatusMessage('');
      try {
          const result = await geocodeLocation(manualInput);
          setUserLocation({ lat: result.lat, lon: result.lon });
          setStatusMessage(`Standort gefunden: ${result.name}`);
          setLocationStatus('success');
          saveLastLocation(result);
      } catch (err: any) {
          setStatusMessage(err.message || "Ort konnte nicht gefunden werden.");
          setLocationStatus('error');
      } finally {
          setIsGeocoding(false);
      }
  }
  
  const getStatusColor = () => {
    switch(locationStatus) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'loading': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl font-bold mb-4 text-center">Wo befindest du dich?</h2>
      <div className={`w-full max-w-md text-center text-sm mb-6 h-10 flex items-center justify-center transition-colors ${getStatusColor()}`}>
        <p>{statusMessage}</p>
      </div>

      <div className="w-full max-w-sm flex flex-col sm:flex-row gap-4">
        {lastUsedLocation && (
          <button
            onClick={handleUseLastLocation}
            className="w-full px-4 py-3 text-base font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 border border-gray-600"
          >
            <ClockIcon className="w-5 h-5" />
            Zuletzt: {lastUsedLocation.name}
          </button>
        )}
        <button
            onClick={handleLocationClick}
            disabled={locationStatus === 'loading'}
            className={`w-full px-6 py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center
            ${locationStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'}
            disabled:bg-gray-600 disabled:cursor-wait`}
        >
            {locationStatus === 'loading' ? <SpinnerIcon /> : <><LocationMarkerIcon className="w-6 h-6 mr-2" /> Meinen Standort verwenden</>}
        </button>
      </div>

      <div className="w-full max-w-sm mt-6 text-center">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">oder</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="PLZ, Stadt oder Adresse eingeben"
                className="flex-grow shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button 
                type="submit" 
                disabled={isGeocoding || !manualInput}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
                {isGeocoding ? <SpinnerIcon /> : 'Suchen'}
            </button>
        </form>
      </div>

      <div className="w-full max-w-md mt-10">
        <label htmlFor="radius-slider" className="block mb-2 font-medium text-center">
          Umkreis: <span className="font-bold text-primary-400 text-xl">{radius} km</span>
        </label>
        <input
          id="radius-slider"
          type="range"
          min="1"
          max={maxRadius}
          value={radius}
          onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
          <span>1 km</span>
          <span>{maxRadius} km</span>
        </div>
      </div>
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