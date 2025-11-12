import React, { useState } from 'react';
import { PhotoSpot, Coordinates, User, UserData } from '../types';
import SpotCard from './SpotCard';
import MapModal from './MapModal'; // New component for the map
import { MapIcon } from './icons/CardIcons';

interface ResultsProps {
  spots: PhotoSpot[];
  userLocation: Coordinates;
  resetSearch: () => void;
  currentUser: User | null;
  userData: UserData;
  onToggleFavorite: (spot: PhotoSpot) => void;
  onToggleVisited: (spotId: string) => void;
  onSpotSelect: (spot: PhotoSpot) => void;
}

const Results: React.FC<ResultsProps> = ({ spots, userLocation, resetSearch, currentUser, userData, onToggleFavorite, onToggleVisited, onSpotSelect }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Deine Top-Spots</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMapModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-all">
            <MapIcon className="w-5 h-5"/>
            Alle auf der Karte anzeigen
          </button>
          <button onClick={resetSearch} className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg hover:bg-gray-600/50 transition-all">
            Neue Suche
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        {spots.map((spot) => {
          const isFavorite = userData.favorites.some(fav => fav.id === spot.id);
          const isVisited = userData.visited.includes(spot.id);

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
              onSelect={onSpotSelect}
            />
          )
        })}
      </div>

      {isMapModalOpen && (
        <MapModal 
          spots={spots}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Results;