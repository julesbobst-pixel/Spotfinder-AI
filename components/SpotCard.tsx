import React from 'react';
import { PhotoSpot, Coordinates, User, ImageState } from '../types';
import WeatherDisplay from './WeatherDisplay';
import { LocationMarkerIcon, TagIcon, CheckCircleIcon, SolidCheckCircleIcon, ChevronRightIcon, FavoriteIcon, RouteIcon, ClockIcon, CameraIcon, LightBulbIcon, ShareIcon } from './icons/CardIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotCardProps {
  spot: PhotoSpot;
  userLocation: Coordinates;
  currentUser: User;
  isFavorite: boolean;
  isVisited: boolean;
  onToggleFavorite: (spot: PhotoSpot) => void;
  onToggleVisited: (spot: PhotoSpot) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  imageState?: ImageState;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, isFavorite, isVisited, onToggleFavorite, onToggleVisited, isExpanded, onToggleExpand, imageState }) => {

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.vibrate?.(isFavorite ? 30 : 50);
    onToggleFavorite(spot);
  }

  const handleVisitedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.vibrate?.(50);
    onToggleVisited(spot);
  }
  
  const getGoogleMapsUrl = (coords: Coordinates) => {
      return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`;
  }

  const canShare = typeof navigator.share === 'function';

  const handleShareClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.vibrate?.(50);
      if (canShare) {
          try {
              await navigator.share({
                  title: spot.name,
                  text: `${spot.name} - Entdeckt mit SpotFinder AI\n\n${spot.description}`,
                  url: getGoogleMapsUrl(spot.coordinates),
              });
          } catch (error) {
              console.error('Sharing failed:', error);
          }
      }
  };

  return (
    <div 
        onClick={() => { navigator.vibrate?.(30); onToggleExpand(); }}
        className={`futuristic-bg futuristic-border rounded-xl overflow-hidden shadow-lg flex flex-col transition-all duration-300 cursor-pointer hover:border-primary-500/50 hover:shadow-pink-500/10 ${isVisited ? 'opacity-60 hover:opacity-100' : ''}`}
    >
      <div className="p-5">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-primary-400 mb-1">{spot.name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button onClick={handleVisitedClick} title={isVisited ? "Als unbesucht markieren" : "Als besucht markieren"} className="text-gray-300 hover:text-white transition-colors">
                    {isVisited ? <SolidCheckCircleIcon className="w-6 h-6 text-green-400" /> : <CheckCircleIcon className="w-6 h-6" />}
                </button>
                <button onClick={handleFavoriteClick} title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"} className={`transition-colors ${isFavorite ? 'text-primary-500' : 'text-gray-300 hover:text-primary-400'}`}>
                    <FavoriteIcon className="w-6 h-6" isFavorite={isFavorite} />
                </button>
            </div>
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
              {canShare && (
                <button onClick={handleShareClick} className="p-2 rounded-full transition-colors bg-gray-700/50 hover:bg-primary-500/50 border border-gray-600" aria-label="Spot teilen">
                    <ShareIcon className="w-6 h-6" />
                </button>
              )}
              <a href={getGoogleMapsUrl(spot.coordinates)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 rounded-full transition-colors bg-gray-700/50 hover:bg-primary-500/50 border border-gray-600" aria-label="Route planen">
                  <RouteIcon className="w-6 h-6" />
              </a>
              <div
                className="p-2 rounded-full bg-gray-700/50 border border-gray-600" aria-label="Details ansehen">
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                    <ChevronRightIcon className="w-6 h-6 text-primary-400" />
                  </motion.div>
              </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <div className="border-t-2 border-primary-500/20 p-5 bg-black/20">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Left Column: Details */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center mb-2">
                                    <CameraIcon className="w-5 h-5 mr-2 text-primary-400" />
                                    <h4 className="font-semibold text-white">Foto-Tipps</h4>
                                </div>
                                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                    {spot.photoTips?.map((tip, index) => <li key={index}>{tip}</li>)}
                                </ul>
                            </div>
                             <div>
                                <div className="flex items-center mb-2">
                                    <LightBulbIcon className="w-5 h-5 mr-2 text-primary-400" />
                                    <h4 className="font-semibold text-white">Pro-Tipp</h4>
                                </div>
                                <p className="text-sm text-gray-300 italic">"{spot.proTip}"</p>
                            </div>
                             <div>
                                <div className="flex items-center mb-2">
                                    <ClockIcon className="w-5 h-5 mr-2 text-primary-400" />
                                    <h4 className="font-semibold text-white">Beste Besuchszeit</h4>
                                </div>
                                <p className="text-sm text-gray-300">{spot.bestTimeToVisit}</p>
                            </div>
                        </div>

                        {/* Right Column: Image */}
                        <div>
                            <div className="aspect-video bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center relative">
                                {imageState?.isLoading && (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                        <div className="w-full max-w-xs">
                                            <p className="text-xs text-gray-400 mb-2 text-center">Generiere fotorealistische Ansicht...</p>
                                            <div className="w-full bg-gray-700 rounded-full h-2.5 relative">
                                                <div
                                                    className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${imageState.progress || 0}%` }}
                                                ></div>
                                                <span className="absolute inset-0 text-center text-xs font-bold text-white leading-loose">
                                                    {Math.round(imageState.progress || 0)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {imageState?.error && <p className="text-xs text-red-400 p-4 text-center">{imageState.error}</p>}
                                {imageState?.image && !imageState.isLoading && <img src={`data:image/jpeg;base64,${imageState.image}`} alt={`Fotorealistische Darstellung von ${spot.name}`} className="w-full h-full object-cover" />}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotCard;