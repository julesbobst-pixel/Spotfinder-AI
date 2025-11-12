import React, { useState } from 'react';
import { PhotoSpot, Coordinates, User } from '../types';
import { getTextToSpeechAudio, playAudio } from '../services/geminiService';
import WeatherDisplay from './WeatherDisplay';
import { LocationMarkerIcon, TagIcon, VolumeUpIcon, VolumeOffIcon, CheckCircleIcon, SolidCheckCircleIcon, ChevronRightIcon, FavoriteIcon, RouteIcon, MapIcon } from './icons/CardIcons';

interface SpotCardProps {
  spot: PhotoSpot;
  userLocation: Coordinates;
  currentUser: User | null;
  isFavorite: boolean;
  isVisited: boolean;
  onToggleFavorite: (spot: PhotoSpot) => void;
  onToggleVisited: (spotId: string) => void;
  onSelect: (spot: PhotoSpot) => void;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, currentUser, isFavorite, isVisited, onToggleFavorite, onToggleVisited, onSelect }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    setIsSpeaking(true);
    let bufferToPlay = audioBuffer;
    if (!bufferToPlay) {
      const generatedBuffer = await getTextToSpeechAudio(spot.description);
      if (generatedBuffer) {
        setAudioBuffer(generatedBuffer);
        bufferToPlay = generatedBuffer;
      }
    }

    if (bufferToPlay) {
        playAudio(bufferToPlay);
    }
    
    setTimeout(() => setIsSpeaking(false), (spot.description.length / 10) * 1000); 
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(spot);
  }

  const handleVisitedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisited(spot.id);
  }
  
  const getGoogleMapsUrl = (coords: Coordinates) => {
      return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`;
  }

  return (
    <div 
        onClick={() => onSelect(spot)}
        className={`futuristic-bg futuristic-border rounded-xl overflow-hidden shadow-lg p-5 flex flex-col transition-all duration-300 cursor-pointer hover:border-red-500/50 hover:shadow-red-500/10 ${isVisited ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold text-red-400 mb-1">{spot.name}</h3>
          {currentUser && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button onClick={handleVisitedClick} title={isVisited ? "Als unbesucht markieren" : "Als besucht markieren"} className="text-gray-300 hover:text-white transition-colors">
                      {isVisited ? <SolidCheckCircleIcon className="w-6 h-6 text-green-400" /> : <CheckCircleIcon className="w-6 h-6" />}
                  </button>
                  <button onClick={handleFavoriteClick} title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"} className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}>
                      <FavoriteIcon className="w-6 h-6" isFavorite={isFavorite} />
                  </button>
              </div>
          )}
        </div>
        <div className="flex items-start text-gray-400 text-sm mb-3">
            <div className="flex items-center mr-4 flex-shrink-0">
                <LocationMarkerIcon className="w-4 h-4 mr-1.5" />
                <span>{spot.distance !== undefined ? `${spot.distance} km entfernt` : 'Entfernung unbekannt'}</span>
            </div>
             <p className="text-xs">{spot.address}</p>
        </div>
        <p className="text-gray-300 mb-4">{spot.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {spot.matchingCriteria.map((tag) => (
            <span key={tag} className="flex items-center bg-gray-700/50 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-600">
              <TagIcon className="w-3 h-3 mr-1.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {isVisited && (
          <div className="w-full text-center my-2">
              <span className="text-white font-bold text-sm bg-green-900/50 px-3 py-1 rounded-full border border-green-700">✓ Besucht</span>
          </div>
      )}

      <div className="flex justify-between items-end mt-2">
        <WeatherDisplay weather={spot.weather || null} isLoading={false} />
        <div className="flex items-center gap-2">
            <a href={getGoogleMapsUrl(spot.coordinates)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 rounded-full transition-colors bg-gray-700/50 hover:bg-red-500/50 border border-gray-600" aria-label="Route planen">
                <RouteIcon className="w-6 h-6" />
            </a>
            <button
              onClick={() => onSelect(spot)}
              className="p-2 rounded-full bg-gray-700/50 border border-gray-600" aria-label="Details ansehen">
                <ChevronRightIcon className="w-6 h-6 text-red-400" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;