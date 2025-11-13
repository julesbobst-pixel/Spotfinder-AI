import React, { useState } from 'react';
import { PhotoSpot, Coordinates, User, UserData, ImageState } from '../types';
import SpotCard from './SpotCard';
import { SparklesIcon } from './icons/CardIcons';

interface ResultsProps {
  spots: PhotoSpot[];
  userLocation: Coordinates;
  resetSearch: () => void;
  onRemix: () => void;
  currentUser: User;
  userData: UserData;
  onToggleFavorite: (spot: PhotoSpot) => void;
  onToggleVisited: (spot: PhotoSpot) => void;
  imageStates: { [spotId: string]: ImageState };
  onLoadImage: (spotId: string, spotName: string, description: string) => void;
}

const Results: React.FC<ResultsProps> = ({ 
  spots, userLocation, resetSearch, onRemix, currentUser, userData, onToggleFavorite, onToggleVisited, imageStates, onLoadImage 
}) => {
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);

  const handleToggleExpand = (spot: PhotoSpot) => {
    const { id, name, description } = spot;
    const isOpening = expandedSpotId !== id;
    const newExpandedId = isOpening ? id : null;
    setExpandedSpotId(newExpandedId);

    // Load image only when expanding for the first time
    if (isOpening && !imageStates[id]) {
      onLoadImage(id, name, description);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Deine Top-Spots</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { navigator.vibrate?.(50); onRemix(); }} title="Neue Spots mit den gleichen Kriterien finden" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-400" />
              Neue Vorschläge
          </button>
          <button onClick={() => { navigator.vibrate?.(50); resetSearch(); }} className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg hover:bg-gray-600/50 transition-all">
            Neue Suche
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {spots.map((spot) => {
          const isFavorite = userData.favorites.some(fav => fav.id === spot.id);
          const isVisited = userData.visited.some(s => s.id === spot.id);

          return (
            <SpotCard 
              key={spot.id} 
              spot={spot} 
              userLocation={userLocation}
              currentUser={currentUser}
              isFavorite={isFavorite}
              isVisited={isVisited}
              onToggleFavorite={onToggleFavorite}
              onToggleVisited={onToggleVisited}
              isExpanded={spot.id === expandedSpotId}
              onToggleExpand={() => handleToggleExpand(spot)}
              imageState={imageStates[spot.id]}
            />
          )
        })}
      </div>
    </div>
  );
};

export default Results;