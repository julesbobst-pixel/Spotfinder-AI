
import React, { useState } from 'react';
import { UserData, User, PhotoSpot, Coordinates, ImageState } from '../types';
import SpotCard from './SpotCard';
import PlanCard from './PlanCard';
import MapEmbed from './MapEmbed';

interface ProfileProps {
    userData: UserData;
    currentUser: User;
    userLocation: Coordinates | null;
    onToggleFavorite: (spot: PhotoSpot) => void;
    onToggleVisited: (spot: PhotoSpot) => void;
    onDeletePlan: (planId: string) => void;
    setView: (view: 'search' | 'profile' | 'results') => void;
    onAddNewSpot: () => void;
    imageStates: { [spotId: string]: ImageState };
    onLoadImage: (spotId: string, spotName: string, description: string) => void;
    isOffline: boolean;
}

const getDistance = (coords1: Coordinates, coords2: Coordinates): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
      onClick={() => { navigator.vibrate?.(50); onClick(); }}
      className={`px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-3 font-semibold transition-all rounded-t-lg ${
        isActive
          ? 'text-primary-400 border-b-2 border-primary-500 bg-gray-800/50'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
);


const Profile: React.FC<ProfileProps> = ({ userData, currentUser, userLocation, onToggleFavorite, onToggleVisited, onDeletePlan, setView, onAddNewSpot, imageStates, onLoadImage, isOffline }) => {
    const [activeTab, setActiveTab] = useState<'favorites' | 'visited'>('favorites');
    const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);

    const handleToggleExpand = (spot: PhotoSpot) => {
        const { id, name, description } = spot;
        const isOpening = expandedSpotId !== id;
        const newExpandedId = isOpening ? id : null;
        setExpandedSpotId(newExpandedId);

        if (isOpening && !imageStates[id]) {
            onLoadImage(id, name, description);
        }
    };
    
    const favoriteSpots = userData.favorites;
    const visitedSpots = userData.visited || [];
    const savedPlans = userData.savedPlans || [];
    
    const spotsToProcess = activeTab === 'favorites' ? favoriteSpots : visitedSpots;
    const spotsToShow = spotsToProcess.map(spot => ({
        ...spot,
        distance: userLocation ? parseFloat(getDistance(userLocation, spot.coordinates).toFixed(1)) : undefined
    }));

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-3xl font-bold">Mein Profil</h2>
                 <button 
                    onClick={() => setView('search')} 
                    disabled={isOffline}
                    className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-white rounded-lg hover:bg-gray-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isOffline ? "Du musst online sein, um eine neue Suche zu starten." : "Neue Suche starten"}
                 >
                    Neue Suche starten
                </button>
            </div>

            {/* Spots Section */}
            <section className="mb-12">
                <div className="flex justify-between items-end border-b-2 border-gray-700 mb-6">
                    <div className="flex items-center">
                        <TabButton isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')}>
                           Favoriten ({favoriteSpots.length})
                        </TabButton>
                         <TabButton isActive={activeTab === 'visited'} onClick={() => setActiveTab('visited')}>
                           Besucht ({visitedSpots.length})
                        </TabButton>
                    </div>
                     {activeTab === 'visited' && (
                        <button 
                            onClick={() => { navigator.vibrate?.(50); onAddNewSpot(); }} 
                            className="mb-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                            disabled={isOffline}
                            title={isOffline ? "Du musst online sein, um einen neuen Spot hinzuzufügen." : "Neuen besuchten Spot eintragen"}
                        >
                            + Spot eintragen
                        </button>
                    )}
                </div>

                {spotsToShow.length > 0 ? (
                    <>
                        <div className="mb-6 h-64 md:h-80">
                            <MapEmbed spots={spotsToShow} focusedSpot={spotsToShow.find(s => s.id === expandedSpotId)} />
                        </div>
                        <div className="space-y-6">
                            {spotsToShow.map(spot => {
                                const isFavorite = userData.favorites.some(fav => fav.id === spot.id);
                                const isVisited = userData.visited.some(v => v.id === spot.id);
                                return (
                                    <SpotCard
                                        key={spot.id}
                                        spot={spot}
                                        userLocation={userLocation!}
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
                    </>
                ) : (
                    <div className="text-center futuristic-bg p-8 rounded-lg futuristic-border border-dashed">
                        <p className="text-gray-400 mb-4">
                            {activeTab === 'favorites'
                                ? 'Du hast noch keine Spots als Favoriten markiert.'
                                : 'Du hast noch keine besuchten Spots eingetragen.'
                            }
                        </p>
                         {activeTab === 'visited' && (
                            <button 
                                onClick={onAddNewSpot} 
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                                disabled={isOffline}
                            >
                                Ersten besuchten Spot eintragen
                            </button>
                        )}
                    </div>
                )}
            </section>
            
            {/* Gespeicherte Pläne Section */}
            <section>
                <h3 className="text-2xl font-semibold border-b-2 border-primary-500 pb-2 mb-6">Meine gespeicherten Pläne</h3>
                {savedPlans.length > 0 ? (
                     <div className="space-y-4">
                        {savedPlans.map(plan => (
                           <PlanCard key={plan.id} plan={plan} onDelete={onDeletePlan} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center futuristic-bg p-8 rounded-lg futuristic-border border-dashed">
                        <p className="text-gray-400 mb-4">Du hast noch keine Shooting-Pläne gespeichert.</p>
                    </div>
                )}
            </section>

        </div>
    );
};

export default Profile;
